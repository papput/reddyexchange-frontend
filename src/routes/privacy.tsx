import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";
import { site } from "@/config/site";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: `Privacy Policy — ${site.siteName}` }] }),
  component: () => (
    <InfoPage title="Privacy Policy" kicker="Effective today">
      <p>We collect only the information needed to operate your account and process transactions: name, email, mobile, and payment details. We never sell your data.</p>
      <h2>Storage</h2><p>Sensitive data is encrypted at rest. Sessions use industry-standard token security.</p>
      <h2>Sharing</h2><p>We share data only with regulators, payment partners, and providers necessary to fulfill our service.</p>
      <h2>Your rights</h2><p>You can request export or deletion of your data at any time from your profile.</p>
    </InfoPage>
  ),
});
