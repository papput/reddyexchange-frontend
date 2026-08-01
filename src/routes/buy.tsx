import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { captureGatewayReturnIfPresent } from "@/lib/buyGateway";
import { isBuyGatewayResumeAccess } from "@/lib/authGuard";
import { getAuth } from "@/lib/store";
import { Logo } from "@/components/brand/Logo";
import { BuyFlow } from "@/routes/app.buy";

/**
 * Payment gateway return URL (short path, e.g. https://reddyexchs.com/buy).
 * SilkPay → gaming bridge → here (step 4 proof). Logged-in users continue on /app/buy.
 */
export const Route = createFileRoute("/buy")({
  beforeLoad: ({ location }) => {
    if (typeof window === "undefined") return;
    captureGatewayReturnIfPresent(location.pathname, location.search);

    if (getAuth()?.token) {
      throw redirect({
        to: "/app/buy",
        search: location.search,
        replace: true,
      });
    }

    if (!isBuyGatewayResumeAccess(location.pathname, location.search)) {
      throw redirect({ to: "/login", replace: true });
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
