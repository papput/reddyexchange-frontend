import { usePublicSettings } from "@/hooks/use-public-settings";
import { getSupportChannels } from "@/lib/contact-links";
import telegramIcon from "@/assets/telegram.png";
import whatsappIcon from "@/assets/whatsapp.svg";
import { cn } from "@/lib/utils";

type InviteItem = {
  key: "telegram" | "whatsapp";
  href: string;
  title: string;
  subtitle: string;
  icon: string;
  tone: "telegram" | "whatsapp";
};

/**
 * Soft invite cards (Telegram first, then WhatsApp) for login/register —
 * placed after the auth form card to draw attention without competing with the form.
 */
export function AuthChannelInvite() {
  const { data: settings } = usePublicSettings();
  const channels = getSupportChannels(settings);

  const items: InviteItem[] = [];
  if (channels.telegramUrl) {
    items.push({
      key: "telegram",
      href: channels.telegramUrl,
      title: "Join us on Telegram",
      subtitle: "Updates, support & help.",
      icon: telegramIcon,
      tone: "telegram",
    });
  }
  if (channels.whatsappUrl) {
    items.push({
      key: "whatsapp",
      href: channels.whatsappUrl,
      title: "Chat on WhatsApp",
      subtitle: "Quick help from our team.",
      icon: whatsappIcon,
      tone: "whatsapp",
    });
  }

  if (!items.length) return null;

  return (
    <div className="mt-5 sm:mt-6 space-y-3 animate-fade-up [animation-delay:120ms]">
      {items.map((item, i) => (
        <a
          key={item.key}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "auth-channel-invite group relative flex items-center gap-3.5 sm:gap-4",
            "rounded-2xl px-3.5 py-3.5 sm:px-4 sm:py-4",
            "border transition-transform duration-300",
            "hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
            item.tone === "telegram"
              ? "auth-channel-invite--tg border-primary/25 bg-primary/[0.08] hover:border-primary/45 hover:bg-primary/[0.12]"
              : "auth-channel-invite--wa border-emerald-400/25 bg-emerald-500/[0.08] hover:border-emerald-400/45 hover:bg-emerald-500/[0.12]",
          )}
          style={{ animationDelay: `${i * 0.35}s` }}
        >
          <span
            className={cn(
              "auth-channel-invite__icon relative flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl",
              item.tone === "telegram"
                ? "bg-primary/15 border border-primary/25"
                : "bg-emerald-500/15 border border-emerald-400/25",
            )}
          >
            <img
              src={item.icon}
              alt=""
              width={24}
              height={24}
              className={cn(
                "h-6 w-6 object-contain",
                item.tone === "telegram" && "rounded-full",
              )}
            />
          </span>
          <span className="min-w-0 text-left">
            <span className="block text-sm sm:text-[15px] font-semibold tracking-tight text-foreground">
              {item.title}
            </span>
            <span className="block text-xs sm:text-[13px] text-secondary mt-0.5 leading-snug">
              {item.subtitle}
            </span>
          </span>
        </a>
      ))}
    </div>
  );
}
