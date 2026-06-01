import { createFileRoute, redirect } from "@tanstack/react-router";

/** Cowpay return_url (max 30 chars) — e.g. http://127.0.0.1:5015/buy → full buy flow at /app/buy */
export const Route = createFileRoute("/buy")({
  beforeLoad: () => {
    throw redirect({ to: "/app/buy" });
  },
});
