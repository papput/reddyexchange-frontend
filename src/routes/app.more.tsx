import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy route — bottom nav now opens Transactions directly. */
export const Route = createFileRoute("/app/more")({
  beforeLoad: () => {
    throw redirect({ to: "/app/transactions", replace: true });
  },
  component: () => null,
});
