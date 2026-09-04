import { verifyMessage } from "viem";
import { pool } from "../db/index";
import { normalizeAddress } from "./auth";

export interface ClaimAuthPayload {
  signature: string;
  nonce: string;
  timestamp: number;
  action:
    | "withdraw_pons"
    | "withdraw_meta"
    | "stake_pons"
    | "unstake_pons"
    | "stake_meta"
    | "unstake_meta"
    | "withdraw_monki"
    | "stake_monki"
    | "unstake_monki";
  amount?: number;
}

export function buildActionMessage(
  action: string,
  walletAddress: string,
  nonce: string,
  timestamp: number,
  amount?: number,
): string {
  const lines = [
    "Monkii Labs Authorization",
    `Action: ${action}`,
    `Wallet: ${walletAddress}`,
  ];
  if (typeof amount === "number") {
    lines.push(`Amount: ${amount}`);
  }
  lines.push(`Nonce: ${nonce}`, `Timestamp: ${timestamp}`);
  lines.push("", "Sign this message to authorize this transaction. It costs no gas.");
  return lines.join("\n");
}

/**
 * Validates a user-signed message for critical balance actions (withdraw/stake/unstake).
 * Prevents replay attacks by logging nonces in claim_authorizations.
 */
export async function verifyActionAuthorization(
  userAddress: string,
  payload: ClaimAuthPayload,
): Promise<{ ok: boolean; reason?: string }> {
  const normalized = normalizeAddress(userAddress);

  // 1. Validate freshness (within 5 minutes)
  const now = Date.now();
  if (Math.abs(now - payload.timestamp) > 300_000) {
    return { ok: false, reason: "authorization_expired" };
  }

  // 2. Anti-replay check against DB
  const { rows } = await pool.query(
    `SELECT id FROM claim_authorizations WHERE nonce = $1`,
    [payload.nonce],
  );
  if (rows.length > 0) {
    return { ok: false, reason: "nonce_already_used" };
  }

  // 3. Reconstruct message and verify cryptographic EVM signature
  const expectedMessage = buildActionMessage(
    payload.action,
    normalized,
    payload.nonce,
    payload.timestamp,
    payload.amount,
  );

  const isValid = await verifyMessage({
    address: normalized as `0x${string}`,
    message: expectedMessage,
    signature: payload.signature as `0x${string}`,
  });

  if (!isValid) {
    return { ok: false, reason: "invalid_signature" };
  }

  // 4. Record authorization to prevent reuse
  await pool.query(
    `INSERT INTO claim_authorizations (user_address, action, nonce, message, signature)
     VALUES ($1, $2, $3, $4, $5)`,
    [normalized, payload.action, payload.nonce, expectedMessage, payload.signature],
  );

  return { ok: true };
}
