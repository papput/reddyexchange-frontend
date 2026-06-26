import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Shield,
  Zap,
  BadgeCheck,
  UserPlus,
  Wallet,
  CreditCard,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { HomeTopBanner } from "@/components/site/HomeTopBanner";
import { LiveTransactionsFeed } from "@/components/site/LiveTransactionsFeed";
import { CasinoStatValue } from "@/components/site/CasinoStatValue";
import { SiteFooter } from "@/components/site/SiteFooter";
import { HeroBrandWordmark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useAuth, type Network, type PayMethod } from "@/lib/store";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { site } from "@/config/site";
import { buildWhatsAppUrl, defaultWhatsAppMessage } from "@/lib/contact-links";
import whatsappIcon from "@/assets/whatsapp.svg";
import { InrPerUsdtRate, UsdtWord } from "@/components/app/UsdtMark";
import {
  BuyFlowStepChoosePayAndToken,
  type BuyAsset,
} from "@/components/app/BuyFlowStepChoosePayAndToken";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${site.siteName} — Buy USDT Instantly in India | Fast, Secure, Trusted` },
      {
        name: "description",
        content: `Buy and sell USDT instantly in India with ${site.siteName}. Live INR↔USDT rate, UPI & bank transfer, multiple networks (TRC20, ERC20, BEP20).`,
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { data: settings } = usePublicSettings();
  const rate = settings?.price ?? 91;
  const wa = buildWhatsAppUrl(settings?.whatsappNumber ?? "", defaultWhatsAppMessage(settings));
  const orderDelayWa = buildWhatsAppUrl(
    settings?.whatsappNumber ?? "",
    "Hi, my order has not been delivered within 5 minutes. Please help.",
  );

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    const timer = window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <HomeTopBanner whatsappUrl={orderDelayWa || wa} />
      <SiteHeader />
      <main className="flex-1">
        <Hero rate={rate} whatsappUrl={wa} />
        <Steps />
        <LiveTransactionsFeed />
        <Trust />
      </main>
      <SiteFooter />
    </div>
  );
}

function LiveRateBadge({ rate, variant }: { rate: number; variant: "mobile" | "desktop" }) {
  const isMobile = variant === "mobile";
  return (
    <div
      className={
        isMobile
          ? "lg:hidden flex w-full justify-center mb-1 sm:mb-2"
          : "hidden lg:inline-flex"
      }
    >
      <div
        className={
          isMobile
            ? "inline-flex items-center gap-3 px-6 py-3.5 rounded-full glass text-lg font-bold animate-live-rate-bounce animate-sell-price-glow shadow-[0_0_28px_-6px] shadow-primary/40"
            : "inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass text-sm font-semibold animate-sell-price-glow"
        }
      >
        <Sparkles className={isMobile ? "h-5 w-5 text-accent shrink-0" : "h-4 w-4 text-accent"} />
        <span className="text-secondary">Live rate today</span>
        <span className="text-foreground inline-flex items-center gap-1">
          <InrPerUsdtRate inr={rate} size={isMobile ? "sm" : "xs"} />
        </span>
      </div>
    </div>
  );
}

function Hero({ rate, whatsappUrl }: { rate: number; whatsappUrl: string }) {
  return (
    <section className="relative isolate scroll-mt-[4.5rem] sm:scroll-mt-20" id="exchange">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-3xl opacity-30 gradient-primary" />
      </div>
      <div className="container mx-auto px-3 sm:px-4 pt-4 sm:pt-12 md:pt-24 pb-5 sm:pb-10 md:pb-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start lg:items-center">
          <div className="order-2 lg:order-1 space-y-4 sm:space-y-6 animate-fade-up">
            <HeroBrandWordmark className="hidden lg:flex" />
            <LiveRateBadge rate={rate} variant="desktop" />
            <h1 className="hidden md:block text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
              fast & Secure{" "}
              <span className="gradient-text">currency Exchange</span>
            </h1>
            <p className="hidden md:block text-lg text-secondary max-w-xl">
              Fast · Secure · Trusted. The premium gateway for digital assets — built for speed,
              designed for trust.
            </p>
            <div className="hidden md:flex flex-wrap gap-3 cta-shadow-zone">
              <Button
                asChild
                size="lg"
                className="gradient-primary border-0 hover-glow text-base h-12 px-7"
              >
                <Link to="/register">
                  Get Started <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-7 glass border-border/60"
              >
                <Link to="/login">I have an account</Link>
              </Button>
            </div>
            <div className="hidden md:flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-success" /> Bank-grade security
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-accent" /> Instant settlement
              </span>
              <Link to="/contact" className="text-accent hover:underline">
                Contact us
              </Link>
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-400 hover:underline"
                >
                  <img src={whatsappIcon} alt="" className="h-3.5 w-3.5" width={14} height={14} />
                  WhatsApp
                </a>
              ) : null}
            </div>
          </div>
          <div className="order-1 lg:order-2 w-full min-w-0 max-w-full">
            <LiveRateBadge rate={rate} variant="mobile" />
            <LandingBuyStepCard rate={rate} />
          </div>
        </div>
      </div>
    </section>
  );
}

const LANDING_MIN_INR_FALLBACK = 2000;

function LandingBuyStepCard({ rate }: { rate: number }) {
  const nav = useNavigate();
  const auth = useAuth();
  const { data: settings } = usePublicSettings();
  const price = settings?.price ?? rate;
  const minInr = settings?.minInrLimit ?? LANDING_MIN_INR_FALLBACK;
  const fees = settings?.exchangeFees ?? { TRC20: 0.5, ERC20: 1, BEP20: 0.7 };

  const [payMethod, setPayMethod] = useState<PayMethod>("upi");
  const [network, setNetwork] = useState<Network>("BEP20");
  const [buyAsset, setBuyAsset] = useState<BuyAsset>("standard");

  const goExchange = () => {
    nav({ to: auth?.token ? "/app/buy" : "/register" });
  };

  return (
    <div className="relative z-0 w-full min-w-0 max-w-full overflow-visible pb-4 sm:pb-6">
      <BuyFlowStepChoosePayAndToken
          payMethod={payMethod}
          setPayMethod={setPayMethod}
          network={network}
          setNetwork={setNetwork}
          buyAsset={buyAsset}
          setBuyAsset={setBuyAsset}
          fees={fees}
          price={price}
          minInr={minInr}
          onStartExchange={goExchange}
      />
    </div>
  );
}

function Steps() {
  const items: { icon: LucideIcon; title: string; desc: ReactNode }[] = [
    {
      icon: UserPlus,
      title: "Create Account",
      desc: "Sign up in 60 seconds with your email & mobile.",
    },
    {
      icon: Wallet,
      title: "Enter Amount",
      desc: (
        <>
          Type INR — see <UsdtWord size="xs" className="font-semibold text-foreground" /> instantly
          at the live rate.
        </>
      ),
    },
    { icon: CreditCard, title: "Make Payment", desc: "Pay via UPI or bank transfer in one tap." },
    {
      icon: CheckCircle2,
      title: "Receive Funds",
      desc: (
        <>
          <UsdtWord size="xs" className="font-semibold text-foreground" /> lands in your wallet on
          the chosen network.
        </>
      ),
    },
  ];
  return (
    <section className="container mx-auto px-4 pt-6 sm:pt-10 pb-6 sm:pb-8 scroll-mt-[4.5rem] sm:scroll-mt-20" id="deposit">
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <div className="text-xs uppercase tracking-widest text-accent mb-3">How it works</div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Four steps. Done in minutes.
        </h2>
        <p className="text-secondary mt-3">
          A streamlined flow built for first-time and power users alike.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((it, i) => (
          <div
            key={it.title}
            className="glass rounded-2xl p-6 hover-lift hover-lift-safe relative group"
          >
            <div className="absolute top-3 right-4 text-5xl font-bold text-foreground/5">
              {i + 1}
            </div>
            <div className="h-11 w-11 rounded-xl gradient-primary grid place-items-center mb-4 group-hover:scale-105 transition-transform">
              <it.icon className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold mb-1">{it.title}</h3>
            <p className="text-sm text-secondary">{it.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Trust() {
  const stats = [
    { icon: Shield, label: "Bank-grade security", value: "256-bit" },
    { icon: Zap, label: "Average settlement", value: "< 5 min" },
    { icon: BadgeCheck, label: "Verified users", value: "10,000+" },
    { icon: TrendingUp, label: "Volume processed", value: "17 + Cr" },
  ];
  return (
    <section className="container mx-auto px-4 pt-6 sm:pt-8 pb-6 sm:pb-8 scroll-mt-[4.5rem] sm:scroll-mt-20" id="reviews">
      <div className="glass-strong rounded-3xl p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-7">
          <h2 className="text-[1.65rem] sm:text-3xl font-bold leading-tight">
            Trusted by 10,000+ users across India
          </h2>
          <p className="text-secondary mt-2 text-base sm:text-lg">
            Built on a foundation of speed, security, and reliability.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-surface p-4 sm:p-5 text-center hover-lift border border-border/40"
            >
              <div className="h-10 w-10 mx-auto rounded-xl bg-primary/10 grid place-items-center mb-3">
                <s.icon className="h-5 w-5 text-accent" />
              </div>
              <CasinoStatValue value={s.value} />
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="text-center mt-6 sm:mt-7">
          <Link
            to="/reviews"
            className="inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold text-accent hover:underline"
          >
            Read all customer reviews →
          </Link>
        </div>
      </div>
    </section>
  );
}
