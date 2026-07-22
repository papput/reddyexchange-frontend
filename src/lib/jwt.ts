/** JWT `exp` (seconds since epoch), if present and parseable — not cryptographically verified. */
export function readJwtExpSeconds(token: string): number | null {
  try {
    const seg = token.split(".")[1];
    if (!seg) return null;
    const json = atob(seg.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as { exp?: unknown };
    return typeof payload.exp === "number" && Number.isFinite(payload.exp) ? payload.exp : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  // Disabled: treat auth JWT as non-expiring so the UI never logs out due to `exp`.
  // (Backend also ignores `exp` via `ignoreExpiration: true`.)
  void token;
  return false;
}
