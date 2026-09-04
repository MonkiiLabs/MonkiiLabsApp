// EVM provider helpers. Robinhood Chain is an EVM L2, so any injected
// wallet (Robinhood Wallet, MetaMask, Rabby, Coinbase) works the same way.

import {
  CHAIN_EXPLORER_URL,
  CHAIN_ID_HEX,
  CHAIN_NAME,
  CHAIN_RPC_URL,
  NATIVE_CURRENCY,
} from "@/lib/config";

export interface EthereumProvider {
  isMetaMask?: boolean;
  isRobinhood?: boolean;
  isCoinbaseWallet?: boolean;
  isRabby?: boolean;
  providers?: EthereumProvider[];
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export type WalletKind = "robinhood" | "metamask" | "injected";

/** Any injected EVM provider, unwrapping multi-wallet arrays. */
export function getInjectedProvider(): EthereumProvider | undefined {
  const injected = window.ethereum;
  if (!injected) return undefined;
  if (Array.isArray(injected.providers) && injected.providers.length > 0) {
    return injected.providers[0];
  }
  return injected;
}

/** Picks a specific wallet out of a multi-provider environment. */
export function getProviderFor(kind: WalletKind): EthereumProvider | undefined {
  const injected = window.ethereum;
  if (!injected) return undefined;

  const match = (p: EthereumProvider) => {
    if (kind === "robinhood") return Boolean(p.isRobinhood);
    if (kind === "metamask") return Boolean(p.isMetaMask);
    return true;
  };

  if (Array.isArray(injected.providers)) {
    const found = injected.providers.find(match);
    if (found) return found;
  }
  return match(injected) ? injected : undefined;
}

export function hasInjectedWallet(): boolean {
  return Boolean(getInjectedProvider());
}

export function isRobinhoodWalletAvailable(): boolean {
  return Boolean(getProviderFor("robinhood"));
}

export function isMetaMaskAvailable(): boolean {
  return Boolean(getProviderFor("metamask"));
}

/** Deeplinks the current page into MetaMask's in-app browser (mobile). */
export function openInMetaMaskApp(): void {
  const target = `${window.location.host}${window.location.pathname}${window.location.search}`;
  window.location.href = `https://metamask.app.link/dapp/${target}`;
}

/** Hex-encodes a UTF-8 string for personal_sign. */
export function utf8ToHex(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let out = "0x";
  for (const b of bytes) out += b.toString(16).padStart(2, "0");
  return out;
}

/** personal_sign against the connected account. Gasless. */
export async function personalSign(
  provider: EthereumProvider,
  address: string,
  message: string,
): Promise<string> {
  return (await provider.request({
    method: "personal_sign",
    params: [utf8ToHex(message), address],
  })) as string;
}

export async function getChainId(provider: EthereumProvider): Promise<string> {
  return (await provider.request({ method: "eth_chainId" })) as string;
}

/**
 * Moves the wallet onto Robinhood Chain, adding the network first if the
 * wallet has never seen it. 4902 is the standard "unrecognised chain" code.
 */
export async function ensureRobinhoodChain(provider: EthereumProvider): Promise<void> {
  const current = await getChainId(provider);
  if (current?.toLowerCase() === CHAIN_ID_HEX.toLowerCase()) return;

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CHAIN_ID_HEX }],
    });
  } catch (err) {
    const code = (err as { code?: number })?.code;
    if (code !== 4902) throw err;

    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: CHAIN_ID_HEX,
          chainName: CHAIN_NAME,
          nativeCurrency: NATIVE_CURRENCY,
          rpcUrls: [CHAIN_RPC_URL],
          blockExplorerUrls: [CHAIN_EXPLORER_URL],
        },
      ],
    });
  }
}
