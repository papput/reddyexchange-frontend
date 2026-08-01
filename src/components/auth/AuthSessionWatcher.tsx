import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { isBuyGatewayResumeAccess, isGatewayReturnFlowActive, isPublicPath } from "@/lib/authGuard";
import { getAuth, logout } from "@/lib/store";
import { SESSION_EXPIRED_FLASH_KEY } from "@/lib/constants";

/** While on a protected route, re-check JWT validity and sign out if missing or expired. */
export function AuthSessionWatcher() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search });

  useEffect(() => {
    if (isPublicPath(pathname)) return;
    if (pathname === "/buy" && isBuyGatewayResumeAccess(pathname, search)) return;
    if (isGatewayReturnFlowActive()) return;

    const checkSession = () => {
      const path = window.location.pathname;
      if (isPublicPath(path)) return;
      if (path === "/buy" && isBuyGatewayResumeAccess(path, window.location.search)) return;
      if (isGatewayReturnFlowActive()) return;
      if (getAuth()?.token) return;

      logout();
      try {
        sessionStorage.setItem(SESSION_EXPIRED_FLASH_KEY, "1");
      } catch {
        /* ignore */
      }
      window.location.assign("/login");
    };

    checkSession();
    const id = window.setInterval(checkSession, 30_000);
    window.addEventListener("focus", checkSession);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", checkSession);
    };
  }, [pathname, search]);

  return null;
}
