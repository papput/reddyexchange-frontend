import { createFileRoute, redirect } from "@tanstack/react-router";
import { captureGatewayReturnIfPresent, isGatewayReturnPending, hasPendingBuyResume } from "@/lib/buyGateway";
import { isBuyGatewayResumeAccess } from "@/lib/authGuard";
import { getAuth } from "@/lib/store";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SitePageLayout } from "@/components/site/SitePageLayout";
import { BuyFlow } from "@/routes/app.buy";

/**
 * Payment gateway return URL (short path, e.g. https://reddyexchange.in/buy).
 * Keep gateway returns on /buy (even when logged in) to avoid /app auth hydration races.
 */
export const Route = createFileRoute("/buy")({
  beforeLoad: ({ location }) => {
    if (typeof window === "undefined") return;
    captureGatewayReturnIfPresent(location.pathname, location.search);

    const gatewayResume =
      isBuyGatewayResumeAccess(location.pathname, location.search) ||
      isGatewayReturnPending() ||
      hasPendingBuyResume();

    // Always complete proof on public /buy after gateway — do not bounce through /app.
    if (gatewayResume) return;

    if (getAuth()?.token) {
      throw redirect({
        to: "/app/buy",
        search: location.search,
        replace: true,
      });
    }

    throw redirect({ to: "/login", replace: true });
  },
  head: () => ({ meta: [{ title: "Complete your payment" }] }),
  component: PublicBuyReturnPage,
});

function PublicBuyReturnPage() {
  return (
    <SitePageLayout>
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-3xl w-full">
        <BuyFlow variant="public-return" />
      </main>
    </SitePageLayout>
  );
}
