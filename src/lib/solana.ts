// Minimal Phantom (Solana) provider helpers — no external deps.

export interface PhantomProvider {
  isPhantom?: boolean;
  publicKey?: { toString(): string } | null;
  isConnected?: boolean;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array, display?: "utf8" | "hex") => Promise<{ signature: Uint8Array }>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    phantom?: { solana?: PhantomProvider };
    solana?: PhantomProvider;
  }
}

/** Returns the injected Phantom provider (Chrome/Brave/Edge extension, or Phantom's in-app browser). */
export function getPhantomProvider(): PhantomProvider | undefined {
  const injected = window.phantom?.solana ?? window.solana;
  if (injected?.isPhantom && typeof injected.connect === "function") return injected;
  return undefined;
}

/** True on phones/tablets, where the extension does not exist and we must deeplink. */
export function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent);
}

/**
 * Opens the current page inside Phantom's in-app browser, where the provider is injected.
 * This is the supported way to connect Phantom from a mobile web browser.
 */
export function openInPhantomApp(): void {
  const url = window.location.href;
  const ref = window.location.origin;
  window.location.href = `https://phantom.app/ul/browse/${encodeURIComponent(url)}?ref=${encodeURIComponent(ref)}`;
}

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/** base58 encode (used to send Phantom signatures to the backend in canonical form). */
export function base58Encode(bytes: Uint8Array): string {
  if (!bytes.length) return "";
  const digits: number[] = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let i = 0; i < digits.length; i++) {
      carry += digits[i] << 8;
      digits[i] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let out = "";
  for (let i = 0; bytes[i] === 0 && i < bytes.length - 1; i++) out += "1";
  for (let i = digits.length - 1; i >= 0; i--) out += B58[digits[i]];
  return out;
}
