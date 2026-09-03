// Minimal MetaMask (EVM) provider helpers — no external deps.

export interface EthereumProvider {
  isMetaMask?: boolean;
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

/** Returns the injected MetaMask provider, picking it out of multi-wallet arrays. */
export function getMetaMaskProvider(): EthereumProvider | undefined {
  const injected = window.ethereum;
  if (!injected) return undefined;
  if (Array.isArray(injected.providers)) {
    const mm = injected.providers.find((p) => p.isMetaMask);
    if (mm) return mm;
  }
  return injected.isMetaMask ? injected : undefined;
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
