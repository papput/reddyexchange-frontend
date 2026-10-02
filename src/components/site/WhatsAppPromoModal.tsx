import { useEffect, useMemo, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { buildWhatsAppUrl } from "@/lib/contact-links";
import { WHATSAPP_PROMO_PENDING_KEY } from "@/lib/constants";
import { useAuth } from "@/lib/store";
import { site } from "@/config/site";
import whatsappIcon from "@/assets/whatsapp.svg";

const CONFETTI_COLORS = ["#2dd4bf", "#34d399", "#a78bfa", "#facc15", "#f472b6", "#60a5fa"];
const CONFETTI_COUNT = 42;

/** Shown once after login: invites the user to WhatsApp for the best price. */
export function WhatsAppPromoModal() {
  const auth = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: settings } = usePublicSettings();
  const [open, setOpen] = useState(false);

  const whatsappUrl =
    settings?.whatsappEnabled !== false
      ? buildWhatsAppUrl(
          settings?.whatsappNumber ?? "",
          `Hi ${site.siteName}, I want the best USDT price. Please share today's rate.`,
        )
      : "";

  useEffect(() => {
    if (!auth?.token || !whatsappUrl) return;
    try {
      if (sessionStorage.getItem(WHATSAPP_PROMO_PENDING_KEY) !== "1") return;
      sessionStorage.removeItem(WHATSAPP_PROMO_PENDING_KEY);
    } catch {
      return;
    }
    const t = window.setTimeout(() => setOpen(true), 600);
    return () => window.clearTimeout(t);
  }, [auth?.token, whatsappUrl, pathname]);

  const pieces = useMemo(
    () =>
      Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 2.2 + Math.random() * 1.6,
        drift: (Math.random() - 0.5) * 160,
        rotate: Math.random() * 720 - 360,
        size: 6 + Math.random() * 6,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        round: Math.random() > 0.6,
      })),
    // Regenerate a fresh burst each time the modal opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open],
  );

  if (!whatsappUrl) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="wa-promo-modal max-w-[min(92vw,420px)] overflow-hidden rounded-3xl border border-emerald-400/25 bg-[var(--site-card)] p-0 sm:rounded-3xl">
        {open && (
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
            {pieces.map((p, i) => (
              <span
                key={i}
                className="wa-confetti-piece"
                style={
                  {
                    left: `${p.left}%`,
                    width: p.size,
                    height: p.round ? p.size : p.size * 0.45,
                    background: p.color,
                    borderRadius: p.round ? "9999px" : "2px",
                    animationDelay: `${p.delay}s`,
                    animationDuration: `${p.duration}s`,
                    "--wa-drift": `${p.drift}px`,
                    "--wa-rotate": `${p.rotate}deg`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        )}

        <div className="relative z-10 px-6 pb-6 pt-8 text-center">
          <div
            className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-emerald-500/20 via-primary/10 to-transparent"
            aria-hidden
          />
          <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-emerald-500/25 wa-promo-ring" aria-hidden />
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/15 wa-promo-icon">
              <img src={whatsappIcon} alt="" width={44} height={44} className="h-11 w-11" />
            </span>
          </div>

          <div className="relative inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
            <Sparkles className="h-3 w-3" />
            Exclusive rates
          </div>

          <DialogTitle className="relative mt-3 text-2xl font-bold tracking-tight text-foreground">
            Want the <span className="gradient-text">best price?</span>
          </DialogTitle>
          <DialogDescription className="relative mx-auto mt-2 max-w-xs text-sm leading-relaxed text-secondary">
            Connect with us on WhatsApp and get the best USDT rate, faster order processing and priority support.
          </DialogDescription>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="relative mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-[15px] font-semibold text-white shadow-[0_10px_28px_-10px_rgba(16,185,129,0.8)] transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            <img src={whatsappIcon} alt="" width={20} height={20} className="h-5 w-5 brightness-0 invert" />
            Connect on WhatsApp
          </a>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="relative mt-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
