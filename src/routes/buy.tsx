import { createFileRoute, redirect } from "@tanstack/react-router";
import { captureGatewayReturnIfPresent } from "@/lib/buyGateway";
import { isBuyGatewayResumeAccess } from "@/lib/authGuard";
import { getAuth } from "@/lib/store";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SitePageLayout } from "@/components/site/SitePageLayout";
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
    <SitePageLayout>
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-3xl w-full">
        <BuyFlow variant="public-return" />
      </main>
    </SitePageLayout>
  );
}
