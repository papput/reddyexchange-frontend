import { Link } from "@tanstack/react-router";
import { BadgeCheck, Shield, Sparkles, TrendingUp, Zap } from "lucide-react";
import { Logo, HeroBrandWordmark } from "@/components/brand/Logo";
import { InrPerUsdtRate } from "@/components/app/UsdtMark";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { buildWhatsAppUrl, defaultWhatsAppMessage, mailtoSupport } from "@/lib/contact-links";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";
import whatsappIcon from "@/assets/whatsapp.svg";

const TRUST_ITEMS = [
  {
    icon: Shield,
    label: "Secure by design",
    desc: "Encrypted sessions and verified payouts",
  },
  {
    icon: Zap,
    label: "Instant settlement",
    desc: "UPI, bank transfer & multiple networks",
  },
  {
    icon: BadgeCheck,
    label: "Trusted platform",
    desc: "Built for Indian crypto traders",
  },
] as const;

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  variant,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  variant?: "login" | "register";
}) {
  const { data: settings } = usePublicSettings();
  const rate = settings?.price ?? 91;
  const wa = buildWhatsAppUrl(settings?.whatsappNumber ?? "", defaultWhatsAppMessage(settings));

  const titleNode =
    variant === "register" ? (
      <>
        Create your <span className="gradient-text">account</span>
      </>
    ) : variant === "login" ? (
      <>
        Welcome <span className="gradient-text">back</span>
      </>
    ) : (
      title
    );

  const isLoginStack = variant === "login";

  const marketingAside = (
    <aside
      className={cn(
        "hidden lg:flex flex-col gap-10 animate-fade-up",
        isLoginStack && "w-full max-w-2xl mx-auto",
      )}
    >
      <div className="relative">
        <div
          className="absolute inset-0 rounded-3xl gradient-primary opacity-40 blur-2xl scale-105"
          aria-hidden
        />
        <div className="relative p-6 sm:p-7 rounded-3xl glass border border-white/[0.08] space-y-4">
          <HeroBrandWordmark />
          <p className="text-sm text-secondary max-w-sm leading-relaxed">
            India&apos;s premium USDT exchange — fast, transparent, and secure.
          </p>
        </div>
      </div>

      <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full glass text-sm font-semibold w-fit animate-sell-price-glow">
        <Sparkles className="h-4 w-4 text-accent shrink-0" />
        <span className="text-secondary">Live rate</span>
        <InrPerUsdtRate inr={rate} size="xs" />
        <TrendingUp className="h-3.5 w-3.5 text-success ml-0.5" />
      </div>

      <ul className="space-y-3">
        {TRUST_ITEMS.map(({ icon: Icon, label, desc }) => (
          <li
            key={label}
            className="flex gap-4 p-4 rounded-2xl glass border border-white/[0.06] hover:border-primary/25 transition-colors duration-300"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-accent/15 border border-primary/20">
              <Icon className="h-5 w-5 text-accent" />
            </span>
            <div>
              <p className="font-semibold text-foreground text-sm">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );

  const formSection = (
    <div
      className={cn(
        "w-full max-w-[440px] animate-fade-up",
        isLoginStack ? "mx-auto" : "mx-auto lg:max-w-none lg:mx-0 [animation-delay:80ms]",
      )}
    >
      <div className={cn("mb-4 sm:mb-7", isLoginStack ? "text-center" : "lg:mb-8 text-center lg:text-left")}>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-semibold uppercase tracking-wider text-accent mb-2 sm:mb-4">
          <Sparkles className="h-3 w-3" />
          {variant === "register" ? "Free signup" : variant === "login" ? "Member access" : site.siteName}
        </div>
        <h1 className="text-2xl sm:text-[2rem] font-bold tracking-tight text-foreground leading-tight">
          {titleNode}
        </h1>
        <p
          className={cn(
            "hidden sm:block text-secondary text-sm sm:text-[15px] mt-3 leading-relaxed max-w-md",
            isLoginStack ? "mx-auto" : "mx-auto lg:mx-0",
          )}
        >
          {subtitle}
        </p>
      </div>

      <div className="relative auth-card-glow">
        <div
          className="absolute -inset-[1px] rounded-[1.35rem] sm:rounded-[1.65rem] opacity-80 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--brand-violet) 48%, transparent), color-mix(in oklab, var(--brand-blue) 34%, transparent), color-mix(in oklab, var(--brand-pink) 10%, transparent))",
          }}
          aria-hidden
        />
        <div
          className={cn(
            "relative glass-strong rounded-[1.3rem] sm:rounded-[1.6rem] border border-white/[0.08] shadow-[var(--shadow-card)]",
            variant === "login"
              ? "p-7 sm:p-9 pb-8 sm:pb-10"
              : "p-6 sm:p-8 pb-7 sm:pb-9",
          )}
        >
          {children}
        </div>
      </div>

      <div
        className={cn(
          "mt-6 px-4 py-3.5 rounded-2xl text-center text-sm text-secondary leading-relaxed",
          "glass border border-border/40",
          !isLoginStack && "lg:text-left",
        )}
      >
        {footer}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col relative isolate">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute top-[8%] right-[-10%] w-[min(800px,95vw)] h-[min(560px,75vh)] rounded-full blur-[100px] opacity-30 gradient-primary animate-float" />
        <div className="absolute bottom-[-5%] left-[-15%] w-[520px] h-[420px] rounded-full blur-[90px] opacity-20 bg-accent/40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[120px] opacity-[0.07] gradient-primary" />
      </div>

      <header className="relative z-10 border-b border-white/[0.06] bg-background/30 backdrop-blur-2xl">
        <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between gap-4">
          <Logo />
          <nav className="flex items-center gap-0.5 sm:gap-1 text-sm">
            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all"
              >
                <img src={whatsappIcon} alt="" className="h-4 w-4" width={16} height={16} />
                WhatsApp
              </a>
            ) : null}
            <a
              href={mailtoSupport()}
              className="hidden md:inline-flex px-3 py-2 rounded-xl text-secondary hover:text-foreground hover:bg-white/[0.04] transition-colors"
            >
              Support
            </a>
            <Link
              to="/contact"
              className="hidden sm:inline-flex px-3 py-2 rounded-xl text-secondary hover:text-foreground hover:bg-white/[0.04] transition-colors"
            >
              Contact
            </Link>
            <Link
              to="/"
              className="px-3 py-2 rounded-xl text-secondary hover:text-foreground hover:bg-white/[0.04] transition-colors whitespace-nowrap"
            >
              Home
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-3 sm:py-10 lg:py-14">
        <div
          className={cn(
            "max-w-6xl mx-auto",
            isLoginStack
              ? "flex flex-col gap-10 lg:gap-12"
              : "grid lg:grid-cols-[1.05fr,minmax(0,440px)] gap-12 lg:gap-20 items-center",
          )}
        >
          {isLoginStack ? (
            <>
              {formSection}
              {marketingAside}
            </>
          ) : (
            <>
              {marketingAside}
              {formSection}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export function AuthFooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="font-semibold text-accent hover:text-accent/90 underline-offset-4 hover:underline transition-colors"
    >
      {children}
    </Link>
  );
}

export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="relative flex items-center gap-3 py-1">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
        {label}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}
