import crypto from "crypto";

export const CSRF_COOKIE = "csrf_token";
export const CSRF_HEADER = "x-csrf-token";

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function parseCookies(header: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  for (const part of header.split(";")) {
    const eqIdx = part.indexOf("=");
    if (eqIdx > -1) {
      const name = part.slice(0, eqIdx).trim();
      const val = part.slice(eqIdx + 1).trim();
      try {
        cookies[name] = decodeURIComponent(val);
      } catch {
        cookies[name] = val;
      }
    }
  }
  return cookies;
}

export function csrfCookieOptions(isProd: boolean) {
  return {
    httpOnly: false,
    secure: isProd,
    sameSite: isProd ? ("strict" as const) : ("lax" as const),
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  };
}
