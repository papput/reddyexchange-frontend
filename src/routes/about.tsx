import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";
import { site } from "@/config/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About — ${site.siteName}` },
      { name: "description", content: `${site.siteName} is India's premium gateway for instant USDT exchange.` },
    ],
  }),
  component: () => (
    <InfoPage title={`About ${site.siteName}`} kicker="Our story">
      <p>
        {site.siteName} is built by a team of fintech veterans focused on one mission: making digital asset exchange in India effortless, instant, and trustworthy.
      </p>
      <h2>Why {site.siteName}</h2>
      <p>We combine bank-grade security with an interface so simple your first transaction takes under two minutes. No jargon. No surprises.</p>
      <h2>The team</h2>
      <p>Engineers and operators from leading payments and fintech companies, building the rails for a new financial era.</p>
    </InfoPage>
  ),
});
