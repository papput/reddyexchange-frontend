import { Link, useRouterState } from "@tanstack/react-router";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { buildWhatsAppUrl, defaultWhatsAppMessage } from "@/lib/contact-links";
import whatsappIcon from "@/assets/whatsapp.svg";
import { cn } from "@/lib/utils";

/**
 * Global floating WhatsApp (admin-configured number + message). Falls back to /contact.
 */
export function FloatingContact() {
  const { data: settings } = usePublicSettings();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const inAppShell = pathname.startsWith("/app");
  const wa = buildWhatsAppUrl(
    settings?.whatsappNumber ?? "",
    defaultWhatsAppMessage(settings)
  );

  const href = wa || "/contact";
  const isExternal = href.startsWith("http");

  const className = cn(
    "fixed z-[100] flex items-center justify-center overflow-visible p-1",
    "transition hover:scale-105 focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full",
    "animate-float bg-transparent",
    inAppShell ? "bottom-24 right-4 md:bottom-8 md:right-6" : "bottom-5 right-4 md:bottom-8 md:right-6"
  );

  /** Full SVG visible — no overflow:hidden or rounded clip on the graphic (icon has its own shadow in SVG). */
  const img = (
    <img
      src={whatsappIcon}
      alt=""
      className="h-16 w-16 max-h-none max-w-none object-contain drop-shadow-[0_4px_14px_rgba(0,0,0,0.45)] pointer-events-none select-none"
      width={64}
      height={64}
      decoding="async"
    />
  );

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        title="Chat on WhatsApp"
        aria-label="Chat on WhatsApp"
      >
        {img}
      </a>
    );
  }

  return (
    <Link to={href} className={className} title="Contact us" aria-label="Contact us">
      {img}
    </Link>
  );
}
