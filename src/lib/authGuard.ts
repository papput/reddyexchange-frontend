import { redirect } from "@tanstack/react-router";
import { SESSION_EXPIRED_FLASH_KEY } from "@/lib/constants";
import { captureGatewayReturnIfPresent } from "@/lib/buyGateway";
import { getAuth, logout, type AuthState } from "@/lib/store";

const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/about",
  "/privacy",
  "/terms",
  "/contact",
  "/reviews",
  "/refund",
]);

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.has(pathname);
}

/**
 * Enforce a valid JWT on protected routes. Clears invalid sessions and redirects to login.
 * Gateway return params on `/buy` or `/app/buy` are captured before the auth check.
 */
export function guardRouteAuth(pathname: string, search: unknown): AuthState {
  if (typeof window === "undefined") return null;
  if (isPublicPath(pathname)) return getAuth();

  captureGatewayReturnIfPresent(pathname, search);

  const auth = getAuth();
  if (auth?.token) return auth;

  logout();

  try {
    sessionStorage.setItem(SESSION_EXPIRED_FLASH_KEY, "1");
  } catch {
    /* ignore quota / private mode */
  }

  throw redirect({ to: "/login", replace: true });
}
