import { createFileRoute, redirect } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  captureGatewayReturnIfPresent,
  shouldUsePublicBuyReturnRoute,
} from "@/lib/buyGateway";
import { Logo } from "@/components/brand/Logo";
import { BuyFlow } from "@/routes/app.buy";

/**
 * Cowpay return_url (max 30 chars) — e.g. https://reddyexchs.com/buy
 * SilkPay / bridge also land here so we never bounce to /app/buy (auth) before step 4.
 */
export const Route = createFileRoute("/buy")({
  beforeLoad: ({ location }) => {
    if (typeof window === "undefined") return;
    captureGatewayReturnIfPresent(location.pathname, location.search);
    if (!shouldUsePublicBuyReturnRoute(location.search)) {
      throw redirect({
        to: "/app/buy",
        search: location.search,
      });
    }
  },
  head: () => ({ meta: [{ title: "Complete your payment" }] }),
  component: PublicBuyReturnPage,
});

function PublicBuyReturnPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Logo to="/" />
          <Link to="/login" className="text-sm font-medium text-accent hover:underline">
            Sign in
          </Link>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-6 max-w-3xl w-full">
        <BuyFlow variant="public-return" />
      </main>
    </div>
  );
}
