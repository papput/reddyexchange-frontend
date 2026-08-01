import { redirect } from "@tanstack/react-router";
import { SESSION_EXPIRED_FLASH_KEY } from "@/lib/constants";
import {
  captureGatewayReturnIfPresent,
  hasPendingBuyResume,
  isGatewayReturnPending,
  parseGatewayReturn,
} from "@/lib/buyGateway";
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

export function isBuyPath(pathname: string): boolean {
  return pathname === "/buy" || pathname === "/app/buy" || pathname.endsWith("/buy");
}

/**
 * Post-SilkPay/Cowpay return or pending proof upload — `/buy` may load without a JWT.
 * Auth is still required to submit proof (step 4 submit handler).
 */
export function isBuyGatewayResumeAccess(pathname: string, search: unknown): boolean {
  if (!isBuyPath(pathname)) return false;
  const parsed = parseGatewayReturn(search);
  if (parsed.isGatewayReturn) return true;
  if (isGatewayReturnPending()) return true;
  return hasPendingBuyResume();
}

export function isGatewayReturnFlowActive(): boolean {
  return isGatewayReturnPending() || hasPendingBuyResume();
}

/**
 * Enforce a valid JWT on protected routes. Clears invalid sessions and redirects to login.
 * Gateway return on `/buy` is captured before any auth check.
 */
export function guardRouteAuth(pathname: string, search: unknown): AuthState {
  if (typeof window === "undefined") return null;
  if (isPublicPath(pathname)) return getAuth();

  if (isBuyPath(pathname)) {
    captureGatewayReturnIfPresent(pathname, search);
  }

  const auth = getAuth();
  if (auth?.token) return auth;

  // Public gateway-return landing — step 4 proof (sign-in required only to submit).
  if (pathname === "/buy" && isBuyGatewayResumeAccess(pathname, search)) {
    return null;
  }

  // Unauthenticated gateway return must not hit /app/* guards — use public /buy.
  if (pathname === "/app/buy" && isBuyGatewayResumeAccess(pathname, search)) {
    throw redirect({ to: "/buy", search, replace: true });
  }

  logout();

  try {
    sessionStorage.setItem(SESSION_EXPIRED_FLASH_KEY, "1");
  } catch {
    /* ignore quota / private mode */
  }

  throw redirect({ to: "/login", replace: true });
}
