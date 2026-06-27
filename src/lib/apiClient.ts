/**
 * Browser API client with automatic access-token refresh on 401.
 * Uses httpOnly cookies — refresh_token is scoped to /api/v1/auth/refresh.
 */

const REFRESH_URL = "/api/v1/auth/refresh";
const AUTH_PATHS = new Set([
  REFRESH_URL,
  "/api/v1/auth/logout",
  "/api/v1/auth/github",
  "/api/v1/auth/github/callback",
]);

let refreshPromise: Promise<boolean> | null = null;

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

/**
 * Drop-in fetch wrapper: on 401, refreshes the session once and retries.
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init: ApiFetchInit = {},
): Promise<Response> {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  const { _retried = false, ...fetchInit } = init;

  const response = await fetch(input, {
    credentials: "include",
    ...fetchInit,
  });

  if (
    response.status === 401 &&
    shouldAttemptRefresh(url, _retried)
  ) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiFetch(input, { ...fetchInit, _retried: true });
    }
  }

  return response;
}
