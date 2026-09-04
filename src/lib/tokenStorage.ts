/**
 * Session token storage.
 *
 * The API issues a single JWT from POST /api/auth/verify, there is no
 * refresh token in the protocol, so an expired session is re-established by
 * signing the nonce message again (which is gasless).
 */

const TOKEN_KEY = "monkii_token";
const ADDRESS_KEY = "monkii_wallet_address";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string, walletAddress?: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    if (walletAddress) localStorage.setItem(ADDRESS_KEY, walletAddress);
  } catch {
    /* private mode, the session simply won't survive a reload */
  }
}

export function getStoredAddress(): string | null {
  try {
    return localStorage.getItem(ADDRESS_KEY);
  } catch {
    return null;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADDRESS_KEY);
  } catch {
    /* ignore */
  }
}

/** Legacy aliases, kept so older imports keep compiling. */
export const getAccessToken = getToken;
export const clearTokens = clearToken;
