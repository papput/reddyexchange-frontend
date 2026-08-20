import { Megaphone } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SupportChannels } from "@/lib/contact-links";
import { openSupportChannel, resolveSupportAction } from "@/lib/contact-links";
import { SupportChannelChooser } from "@/components/site/SupportContact";

type HomeTopBannerProps = {
  channels: SupportChannels;
};

function bannerChannelWord(channels: SupportChannels): string {
  const { whatsappUrl, telegramUrl } = channels;
  if (whatsappUrl && telegramUrl) return "WhatsApp / Telegram";
  if (telegramUrl) return "Telegram";
  if (whatsappUrl) return "WhatsApp";
  return "support";
}

/** Matches exchange card / glass panels — one lightweight border token */
const liteBorder = "border border-border/50";

export function HomeTopBanner({ channels }: HomeTopBannerProps) {
  const [chooserOpen, setChooserOpen] = useState(false);
  const action = resolveSupportAction(channels);
  const channelWord = bannerChannelWord(channels);
  const bannerText = `Contact Us On ${channelWord} If Your Order Not Delivered Within 15min`;

  const className = cn(
    "w-full min-w-0",
    liteBorder,
    "border-x-0 border-t-0",
    "bg-surface/95 backdrop-blur-sm",
    "bg-gradient-to-r from-primary/10 via-surface to-accent/10",
    "text-foreground",
    "relative flex items-center justify-center px-9 sm:px-12 py-2 sm:py-2.5",
  );

  const inner = (
    <>
      <Megaphone
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem] shrink-0 text-accent"
        strokeWidth={2.25}
        aria-hidden
      />
      <p className="text-sm sm:text-base font-semibold leading-snug text-center text-balance max-w-3xl">
        Contact Us On <span className="text-accent font-bold">{channelWord}</span> If Your Order Not
        Delivered Within 15min
      </p>
    </>
  );

  if (action === "none") {
    return <div className={className}>{inner}</div>;
  }

  const onActivate = () => {
    if (action === "chooser") {
      setChooserOpen(true);
      return;
    }
    openSupportChannel(action === "telegram" ? channels.telegramUrl : channels.whatsappUrl);
  };

  return (
    <>
      <button
        type="button"
        onClick={onActivate}
        className={cn(className, "hover:bg-surface transition-colors cursor-pointer")}
        aria-label={bannerText}
      >
        {inner}
      </button>
      <SupportChannelChooser open={chooserOpen} onOpenChange={setChooserOpen} channels={channels} />
    </>
  );
}
