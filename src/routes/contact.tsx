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
  const waOn = settings?.whatsappEnabled !== false && Boolean(settings?.whatsappNumber?.trim());
  const tgOn = Boolean(settings?.telegramEnabled && settings?.telegramHandle?.trim());
  const parts = ["email"];
  if (waOn) parts.push("WhatsApp");
  if (tgOn) parts.push("Telegram");
  if (waOn) parts.push("phone");
  const reach =
    parts.length === 1
      ? parts[0]
      : `${parts.slice(0, -1).join(", ")} or ${parts[parts.length - 1]}`;

  return (
    <InfoPage title="Contact us" kicker="We're here to help" showHelpStrip={false}>
      <p>
        Reach us by {reach}. Chat links open with a prefilled message so we can help you faster.
      </p>
      <ContactChannels settings={settings} includeContactPageLink={false} showPaymentChannels={false} />
    </InfoPage>
  );
}
