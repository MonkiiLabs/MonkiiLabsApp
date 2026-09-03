import { API_BASE_URL } from "@/lib/config";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/lib/tokenStorage";

async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) return false;
  const raw = (await res.json()) as any;
  const accessToken = raw?.accessToken ?? raw?.tokens?.accessToken ?? raw?.data?.accessToken;
  const newRefreshToken = raw?.refreshToken ?? raw?.tokens?.refreshToken ?? raw?.data?.refreshToken;
  if (!accessToken || !newRefreshToken) return false;
  setTokens({ accessToken, refreshToken: newRefreshToken });
  return true;
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit & { json?: unknown } = {}
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("Missing BACKEND_URL env var (API base URL).");
  }
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const headers = new Headers(init.headers);
  if (init.json !== undefined) headers.set("Content-Type", "application/json");

  const isAuthRoute = path.startsWith("/auth/");
  const accessToken = getAccessToken();
  if (!isAuthRoute && accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const res = await fetch(url, {
    ...init,
    headers,
    body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
  });

  // attempt refresh once
  if (res.status === 401) {
    const refreshed = await refreshTokens();
    if (!refreshed) {
      clearTokens();
      // Let the app know auth is no longer valid so it can disconnect wallet UI state.
      window.dispatchEvent(new CustomEvent("monkii:authExpired"));
      throw new Error("Unauthorized");
    }

    const retryHeaders = new Headers(init.headers);
    if (init.json !== undefined) retryHeaders.set("Content-Type", "application/json");
    const newAccessToken = getAccessToken();
    if (!isAuthRoute && newAccessToken) retryHeaders.set("Authorization", `Bearer ${newAccessToken}`);

    const retryRes = await fetch(url, {
      ...init,
      headers: retryHeaders,
      body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
    });

    if (!retryRes.ok) {
      const text = await retryRes.text().catch(() => "");
      throw new Error(text || `Request failed (${retryRes.status})`);
    }

    const retryText = await retryRes.text();
    return (retryText ? JSON.parse(retryText) : null) as T;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed (${res.status})`);
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

