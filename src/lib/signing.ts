import { signMessage } from "wagmi/actions";

import { wagmiConfig } from "@/lib/wagmi";

/**
 * Wallet-signed financial authorizations.
 *
 * Every balance-altering action (claims, withdrawals, staking, unstaking)
 * carries an explicit signature over a structured message, so the server
 * can prove the user authorised that exact amount at that exact moment. It
 * costs no gas and broadcasts no transaction.
 *
 * Signing goes through the wagmi connector rather than `window.ethereum`.
 * That distinction matters: the injected provider only exists for browser
 * extensions, so the previous implementation silently failed for anyone
 * who connected over WalletConnect or from a mobile wallet's in-app
 * browser: they could sign in, then find every stake and withdrawal
 * throwing "No wallet detected". Routing through the connector makes all
 * of RainbowKit's wallets work identically.
 *
 * The message shape is fixed by the API contract; do not reorder the lines.
 */

export type FinancialAction =
  | "withdraw_pons"
  | "withdraw_meta"
  | "withdraw_monki"
  | "stake_monki"
  | "unstake_monki"
  | "stake_pons"
  | "unstake_pons";

export interface SignedAuthorization {
  signature: string;
  nonce: string;
  timestamp: number;
}

function randomNonce(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") {
    return c.randomUUID().replace(/-/g, "");
  }
  if (c && typeof c.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    c.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  // Last resort for non-secure contexts; the server still gates replay by nonce.
  return `${Date.now().toString(16)}${Math.random().toString(16).slice(2, 14)}`;
}

/**
 * Builds the exact message the backend re-derives when verifying.
 * `Amount:` is omitted when the action withdraws an entire balance.
 */
export function buildAuthorizationMessage(params: {
  action: FinancialAction;
  walletAddress: string;
  amount?: number;
  nonce: string;
  timestamp: number;
}): string {
  const lines = [
    "Monkii Labs Authorization",
    `Action: ${params.action}`,
    `Wallet: ${params.walletAddress}`,
  ];
  if (typeof params.amount === "number") {
    lines.push(`Amount: ${params.amount}`);
  }
  lines.push(`Nonce: ${params.nonce}`, `Timestamp: ${params.timestamp}`);
  lines.push("", "Sign this message to authorize this transaction. It costs no gas.");
  return lines.join("\n");
}

/**
 * Prompts the wallet to authorise a financial action and returns the triple
 * every protected mutation endpoint expects in its body.
 */
export async function signFinancialAction(
  walletAddress: string,
  action: FinancialAction,
  amount?: number,
): Promise<SignedAuthorization> {
  const nonce = randomNonce();
  const timestamp = Date.now();
  const message = buildAuthorizationMessage({
    action,
    walletAddress,
    amount,
    nonce,
    timestamp,
  });

  const signature = await signMessage(wagmiConfig, {
    message,
    account: walletAddress as `0x${string}`,
  });

  return { signature, nonce, timestamp };
}
