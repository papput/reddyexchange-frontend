import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";
import { site } from "@/config/site";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: `Terms of Service — ${site.siteName}` }] }),
  component: () => (
    <InfoPage title="Terms of Service" kicker="Please read carefully">
      <p>
        By creating an account you agree to these terms. {site.siteName} provides a platform for exchanging INR and digital assets — you are responsible for the wallet addresses you provide.
      </p>
      <h2>Eligibility</h2>
      <p>You must be 18+ and a resident of India.</p>
      <h2>Compliance</h2>
      <p>We comply with applicable Indian law and may request KYC documents for higher-value transactions.</p>
      <h2>Liability</h2>
      <p>{site.siteName} is not liable for losses arising from incorrect wallet addresses, network selection, or third-party failures.</p>
    </InfoPage>
  ),
});
