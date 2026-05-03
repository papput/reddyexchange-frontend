import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";
import { site } from "@/config/site";

export const Route = createFileRoute("/refund")({
  head: () => ({ meta: [{ title: `Refund Policy — ${site.siteName}` }] }),
  component: () => (
    <InfoPage title="Refund Policy" kicker="Fair & transparent">
      <p>If a transaction fails on our side, we refund 100% of the INR amount to your original payment method within 24 hours.</p>
      <h2>Non-refundable cases</h2><p>Network fees, transactions sent to incorrect wallet addresses, or completed transfers are non-refundable.</p>
      <h2>How to request</h2><p>Open the failed transaction from your profile and tap "Request refund" — our team responds within 12 hours.</p>
    </InfoPage>
  ),
});
