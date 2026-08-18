import { useRouterState } from "@tanstack/react-router";
import { usePublicSettings } from "@/hooks/use-public-settings";
import {
  buildTelegramUrl,
  buildWhatsAppUrl,
  defaultTelegramMessage,
  defaultWhatsAppMessage,
} from "@/lib/contact-links";
import whatsappIcon from "@/assets/whatsapp.svg";
import telegramIcon from "@/assets/telegram.png";
import { cn } from "@/lib/utils";

/**
 * Global floating WhatsApp / Telegram buttons (admin-configured). Hidden when disabled in admin.
 */
export function FloatingContact() {
  const { data: settings } = usePublicSettings();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const inAppShell = pathname.startsWith("/app");

  const showWhatsApp = settings?.whatsappEnabled !== false;
  const showTelegram = Boolean(settings?.telegramEnabled);

  const wa = showWhatsApp
    ? buildWhatsAppUrl(settings?.whatsappNumber ?? "", defaultWhatsAppMessage(settings))
    : "";
  const tg = showTelegram
    ? buildTelegramUrl(settings?.telegramHandle ?? "", defaultTelegramMessage(settings))
    : "";

  const buttons: Array<{
    href: string;
    title: string;
    icon: string;
    key: string;
    linkClass?: string;
    imgClass?: string;
  }> = [];
  if (showTelegram && tg) {
    buttons.push({
      href: tg,
      title: "Chat on Telegram",
      icon: telegramIcon,
      key: "telegram",
      linkClass: "overflow-hidden p-0 rounded-full",
      imgClass: "rounded-full object-cover",
    });
  }
  if (showWhatsApp && wa) {
    buttons.push({
      href: wa,
      title: "Chat on WhatsApp",
      icon: whatsappIcon,
      key: "whatsapp",
      linkClass: "overflow-visible p-1",
    });
  }

  if (!buttons.length) return null;

  const stackClass = cn(
    "fixed z-[100] flex flex-col items-center gap-3",
    inAppShell ? "bottom-24 right-4 md:bottom-8 md:right-6" : "bottom-5 right-4 md:bottom-8 md:right-6"
  );

  return (
    <div className={stackClass}>
      {buttons.map((b) => (
        <a
          key={b.key}
          href={b.href}
          target="_blank"
          rel="noopener noreferrer"
          title={b.title}
          aria-label={b.title}
          className={cn(
            "flex items-center justify-center",
            "transition hover:scale-105 focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "animate-float bg-transparent",
            b.linkClass
          )}
        >
          <img
            src={b.icon}
            alt=""
            className={cn(
              "h-16 w-16 max-h-none max-w-none object-contain drop-shadow-[0_4px_14px_rgba(0,0,0,0.45)] pointer-events-none select-none",
              b.imgClass
            )}
            width={64}
            height={64}
            decoding="async"
          />
        </a>
      ))}
    </div>
  );
}
