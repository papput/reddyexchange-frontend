import { Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

type HomeTopBannerProps = {
  whatsappUrl?: string;
};

const BANNER_TEXT = "Contact Us On Whatsapp If Your Order Not Delivered Within 5min";

/** Matches exchange card / glass panels — one lightweight border token */
const liteBorder = "border border-border/50";

export function HomeTopBanner({ whatsappUrl }: HomeTopBannerProps) {
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
        Contact Us On{" "}
        <span className="text-accent font-bold">Whatsapp</span> If Your Order Not Delivered Within 5min
      </p>
    </>
  );

  if (whatsappUrl) {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(className, "hover:bg-surface transition-colors")}
        aria-label={`${BANNER_TEXT} — open WhatsApp`}
      >
        {inner}
      </a>
    );
  }

  return <div className={className}>{inner}</div>;
}
