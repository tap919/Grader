/**
 * Browser API client with automatic access-token refresh on 401
 * and CSRF double-submit headers on mutating requests.
 */

const REFRESH_URL = "/api/v1/auth/refresh";
const CSRF_URL = "/api/v1/auth/csrf";
const CSRF_HEADER = "X-CSRF-Token";
const CSRF_COOKIE = "csrf_token";
const PROACTIVE_REFRESH_MS = 50 * 60 * 1000;

const AUTH_PATHS = new Set([
  REFRESH_URL,
  CSRF_URL,
  "/api/v1/auth/logout",
  "/api/v1/auth/github",
  "/api/v1/auth/github/callback",
]);

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

let refreshPromise: Promise<boolean> | null = null;
let csrfPromise: Promise<string | null> | null = null;
let proactiveRefreshTimer: ReturnType<typeof setInterval> | null = null;

function readCsrfCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CSRF_COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function ensureCsrfToken(): Promise<string | null> {
  const existing = readCsrfCookie();
  if (existing) return existing;

  if (!csrfPromise) {
    csrfPromise = fetch(CSRF_URL, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = (await res.json()) as { csrfToken?: string };
        return data.csrfToken ?? readCsrfCookie();
      })
      .catch(() => null)
      .finally(() => {
        csrfPromise = null;
      });
  }
  return csrfPromise;
}

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(REFRESH_URL, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function shouldAttemptRefresh(url: string, retried: boolean): boolean {
  if (retried) return false;
  const path = url.startsWith("http") ? new URL(url).pathname : url.split("?")[0];
  return !AUTH_PATHS.has(path);
}

export interface ApiFetchInit extends RequestInit {
  /** @internal skip refresh retry — do not set in app code */
  _retried?: boolean;
}

/** Start proactive session refresh before the 1h access token expires. */
export function startProactiveSessionRefresh(): void {
  if (proactiveRefreshTimer || typeof window === "undefined") return;
  proactiveRefreshTimer = setInterval(() => {
    void refreshAccessToken();
  }, PROACTIVE_REFRESH_MS);
}

export function stopProactiveSessionRefresh(): void {
  if (proactiveRefreshTimer) {
    clearInterval(proactiveRefreshTimer);
    proactiveRefreshTimer = null;
  }
}

/**
 * Drop-in fetch wrapper: attaches CSRF on mutating requests,
 * refreshes session on 401, and retries once.
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init: ApiFetchInit = {},
): Promise<Response> {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  const { _retried = false, ...fetchInit } = init;
  const method = (fetchInit.method ?? "GET").toUpperCase();

  const headers = new Headers(fetchInit.headers);
  if (MUTATING_METHODS.has(method) && !AUTH_PATHS.has(url.split("?")[0])) {
    const csrf = await ensureCsrfToken();
    if (csrf) headers.set(CSRF_HEADER, csrf);
  }

  const response = await fetch(input, {
    credentials: "include",
    ...fetchInit,
    headers,
  });

  if (response.status === 401 && shouldAttemptRefresh(url, _retried)) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiFetch(input, { ...fetchInit, _retried: true });
    }
  }

  return response;
}

/** Bootstrap CSRF token and proactive refresh for authenticated sessions. */
export async function bootstrapSession(): Promise<void> {
  await ensureCsrfToken();
  startProactiveSessionRefresh();
}
