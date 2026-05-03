import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";
import { ContactChannels } from "@/components/site/ContactChannels";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { site } from "@/config/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `Contact — ${site.siteName}` },
      { name: "description", content: `Get in touch with the ${site.siteName} team.` },
    ],
  }),
  component: ContactRoute,
});

function ContactRoute() {
  const { data: settings } = usePublicSettings();
  return (
    <InfoPage title="Contact us" kicker="We're here to help" showHelpStrip={false}>
      <p>
        Our team uses the channels below. WhatsApp message text is prefilled from your admin settings so we can help you
        faster.
      </p>
      <ContactChannels settings={settings} includeContactPageLink={false} showPaymentChannels />
    </InfoPage>
  );
}
