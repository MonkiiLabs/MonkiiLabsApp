import { API_BASE_URL, API_FALLBACK_URL } from "@/lib/config";
import { clearToken, getToken } from "@/lib/tokenStorage";

/** Thrown for any non-2xx response, carrying the status for callers to branch on. */
export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export const AUTH_EXPIRED_EVENT = "monkii:authExpired";

interface ApiInit extends Omit<RequestInit, "body"> {
  /** Serialised as JSON with the correct content type. */
  json?: unknown;
  body?: BodyInit | null;
  /** Set for endpoints that must not send the Bearer token. */
  anonymous?: boolean;
}

function buildRequest(base: string, path: string, init: ApiInit): [string, RequestInit] {
  const url = path.startsWith("http") ? path : `${base}${path}`;

  const headers = new Headers(init.headers);
  if (init.json !== undefined) headers.set("Content-Type", "application/json");

  const token = getToken();
  if (!init.anonymous && token) headers.set("Authorization", `Bearer ${token}`);

  const { json, anonymous: _anonymous, ...rest } = init;
  return [
    url,
    { ...rest, headers, body: json !== undefined ? JSON.stringify(json) : init.body },
  ];
}

async function parse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return null as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

/**
 * Typed fetch against the Monkii Labs API.
 *
 * A 401 clears the session and raises `monkii:authExpired`, which the wallet
 * provider listens for so the UI drops back to a disconnected state rather
 * than looping on a dead token. Network-level failures against the primary
 * host retry once against the documented fallback.
 */
export async function apiFetch<T = unknown>(path: string, init: ApiInit = {}): Promise<T> {
  let res: Response;

  try {
    const [url, requestInit] = buildRequest(API_BASE_URL, path, init);
    res = await fetch(url, requestInit);
  } catch (networkError) {
    if (!API_FALLBACK_URL || API_FALLBACK_URL === API_BASE_URL) throw networkError;
    const [fallbackUrl, fallbackInit] = buildRequest(API_FALLBACK_URL, path, init);
    res = await fetch(fallbackUrl, fallbackInit);
  }

  if (res.status === 401) {
    clearToken();
    window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
    throw new ApiError(401, "Session expired. Sign in with your wallet again.");
  }

  if (!res.ok) {
    const body = await parse<{ error?: string; message?: string }>(res);
    const message =
      (typeof body === "object" && body && (body.error || body.message)) ||
      `Request failed (${res.status})`;
    throw new ApiError(res.status, message, body);
  }

  return parse<T>(res);
}

export const api = {
  get: <T>(path: string, init?: ApiInit) => apiFetch<T>(path, { ...init, method: "GET" }),
  post: <T>(path: string, json?: unknown, init?: ApiInit) =>
    apiFetch<T>(path, { ...init, method: "POST", json }),
};
