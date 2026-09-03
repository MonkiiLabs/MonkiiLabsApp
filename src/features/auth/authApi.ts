import { apiFetch } from "@/lib/api";
import { setTokens } from "@/lib/tokenStorage";

export type AuthTokens = { accessToken: string; refreshToken: string };

export async function getNonce(walletAddress: string): Promise<{ message: string }> {
  const res = await apiFetch<{ ok: boolean; message: string }>(`/auth/nonce`, {
    method: "POST",
    json: { walletAddress },
  });
  return { message: res.message };
}

export async function loginWithSignature(walletAddress: string, signature: string): Promise<AuthTokens> {
  const raw = await apiFetch<any>(`/auth/login`, {
    method: "POST",
    json: { walletAddress, signature },
  });

  const accessToken = raw?.accessToken ?? raw?.tokens?.accessToken ?? raw?.data?.accessToken;
  const refreshToken = raw?.refreshToken ?? raw?.tokens?.refreshToken ?? raw?.data?.refreshToken;
  if (!accessToken || !refreshToken) {
    throw new Error("Login succeeded but tokens missing in response.");
  }
  setTokens({ accessToken, refreshToken });
  return { accessToken, refreshToken };
}

