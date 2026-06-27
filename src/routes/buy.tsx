import { createFileRoute, redirect } from "@tanstack/react-router";
import { captureGatewayReturnIfPresent } from "@/lib/buyGateway";

/** Cowpay return_url (max 30 chars) — e.g. http://127.0.0.1:5015/buy → full buy flow at /app/buy */
export const Route = createFileRoute("/buy")({
  beforeLoad: ({ location }) => {
    if (typeof window !== "undefined") {
      captureGatewayReturnIfPresent(location.pathname, location.search);
    }
    throw redirect({
      to: "/app/buy",
      search: location.search,
    });
  },
});
