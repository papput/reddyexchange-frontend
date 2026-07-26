import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Payment gateway return URL (short path, e.g. /buy).
 * Auth is enforced at the root — authenticated users continue on /app/buy.
 */
export const Route = createFileRoute("/buy")({
  beforeLoad: ({ location }) => {
    if (typeof window === "undefined") return;
    throw redirect({
      to: "/app/buy",
      search: location.search,
      replace: true,
    });
  },
});
