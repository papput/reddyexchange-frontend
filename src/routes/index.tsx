import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Shield,
  Zap,
  UserPlus,
  Wallet,
  CreditCard,
  CheckCircle2,
  Sparkles,
  Clock,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SitePageLayout } from "@/components/site/SitePageLayout";
import { LiveTransactionsFeed } from "@/components/site/LiveTransactionsFeed";
import { HomeReviewsSection } from "@/components/site/HomeReviewsSection";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth, type Network, type PayMethod } from "@/lib/store";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { site } from "@/config/site";
import {
  getSupportChannels,
  openSupportChannel,
  resolveSupportAction,
} from "@/lib/contact-links";
import {
  SupportChannelChooser,
  SupportChannelIcons,
} from "@/components/site/SupportContact";
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
  const delayMsg = "Hi, my order has not been delivered within 15 minutes. Please help.";
  const bannerChannels = getSupportChannels(settings, {
    whatsappMessage: delayMsg,
    telegramMessage: delayMsg,
  });
  const heroChannels = getSupportChannels(settings);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    const timer = window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <SitePageLayout>
      <SiteHeader announcementChannels={bannerChannels} />
      <main className="flex-1">
        <Hero rate={rate} channels={heroChannels} />
        <LiveTransactionsFeed />
        <HomeReviewsSection />
        <Steps />
        <WhyChoose />
      </main>
      <SiteFooter />
    </SitePageLayout>
  );
}

function LiveRateBadge({ rate, variant }: { rate: number; variant: "mobile" | "desktop" }) {
  const isMobile = variant === "mobile";
  return (
    <div className={isMobile ? "lg:hidden w-full mb-2 sm:mb-3" : "hidden lg:flex w-full max-w-md mb-3"}>
      <div
        className={cn(
          "relative w-full min-w-0 flex flex-nowrap items-center whitespace-nowrap rounded-xl",
          "border-2 border-primary/30 bg-primary/5 px-3 py-2.5 sm:px-4 sm:py-3",
          "shadow-inner shadow-primary/5",
          isMobile ? "justify-between gap-2 text-sm font-semibold" : "justify-center gap-3 text-base font-bold",
        )}
      >
        <span className="inline-flex min-w-0 items-center gap-2">
          <Sparkles className={cn("text-primary shrink-0", isMobile ? "h-4 w-4" : "h-5 w-5")} />
          <span className="text-muted-foreground truncate uppercase text-[10px] sm:text-xs tracking-wider font-bold">
            Live market rate
          </span>
        </span>
        <span className="text-foreground shrink-0">
          <InrPerUsdtRate
            inr={rate}
            size={isMobile ? "xs" : "sm"}
            className="flex-nowrap whitespace-nowrap"
          />
        </span>
      </div>
    </div>
  );
}

function Hero({
  rate,
  channels,
}: {
  rate: number;
  channels: ReturnType<typeof getSupportChannels>;
}) {
  const [chooserOpen, setChooserOpen] = useState(false);
  const action = resolveSupportAction(channels);
  const label =
    action === "chooser"
      ? "Chat with us"
      : action === "telegram"
        ? "Telegram"
        : action === "whatsapp"
          ? "WhatsApp"
          : "";

  const onChat = () => {
    if (action === "chooser") setChooserOpen(true);
    else if (action === "telegram") openSupportChannel(channels.telegramUrl);
    else if (action === "whatsapp") openSupportChannel(channels.whatsappUrl);
  };

  return (
    <section className="relative isolate scroll-mt-24" id="exchange">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute inset-0 grid-bg opacity-30" />
      </div>
      <div className="container mx-auto px-3 sm:px-4 pt-2 sm:pt-4 pb-5 sm:pb-8 lg:pb-10 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-start lg:items-center">
          <div className="order-2 lg:order-1 space-y-4 animate-fade-up">
            <LiveRateBadge rate={rate} variant="desktop" />
            <h1 className="hidden md:block font-display text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight leading-[1.05]">
              <span className="gradient-text">{site.siteName} Exchange</span>
              <span className="block text-foreground mt-1 text-3xl sm:text-4xl lg:text-5xl">
                Fast & secure currency exchange
              </span>
            </h1>
            <p className="hidden md:block text-base lg:text-lg text-muted-foreground max-w-xl">
              The most reliable platform to buy USDT and pay directly from your bank account using
              INR — UPI, IMPS, and multi-chain delivery.
            </p>
            <div className="hidden md:flex flex-wrap gap-3 cta-shadow-zone">
              <Button
                asChild
                size="lg"
                className="gradient-primary border-0 hover-glow text-base h-12 px-7 font-semibold"
              >
                <Link to="/login">
                  Login <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-7 glass-card border-border/60 hover:border-primary/30"
              >
                <Link to="/register">Sign up</Link>
              </Button>
            </div>
            <div className="hidden md:flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-success" /> Bank-grade security
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-primary" /> Instant settlement
              </span>
              <Link to="/contact" className="text-primary hover:underline">
                Contact us
              </Link>
              {action !== "none" ? (
                <button
                  type="button"
                  onClick={onChat}
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <SupportChannelIcons channels={channels} size={14} />
                  {label}
                </button>
              ) : null}
            </div>
          </div>
          <div className="order-1 lg:order-2 w-full min-w-0 max-w-full">
            <LiveRateBadge rate={rate} variant="mobile" />
            <LandingBuyStepCard rate={rate} />
          </div>
        </div>
      </div>
      <SupportChannelChooser open={chooserOpen} onOpenChange={setChooserOpen} channels={channels} />
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
    <div className="relative z-0 w-full min-w-0 max-w-full overflow-visible pb-2 sm:pb-4">
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
    <section
      className="container mx-auto px-3 sm:px-4 pt-2 sm:pt-8 pb-4 sm:pb-8 scroll-mt-24 max-w-6xl"
      id="deposit"
    >
      <div className="text-center max-w-2xl mx-auto mb-3 sm:mb-8">
        <div className="text-[10px] sm:text-xs uppercase tracking-widest text-primary font-bold mb-1 sm:mb-2">
          How it works
        </div>
        <h2 className="font-display text-lg sm:text-3xl font-bold tracking-tight">
          Four steps. Done in minutes.
        </h2>
        <p className="hidden sm:block text-muted-foreground mt-2 text-sm sm:text-base">
          A streamlined flow built for first-time and power users alike.
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {items.map((it, i) => (
          <div
            key={it.title}
            className="glass-card p-3 sm:p-6 hover:border-primary/30 transition-all duration-200 relative group"
          >
            <div className="absolute top-2 right-2 sm:top-3 sm:right-4 text-2xl sm:text-4xl font-bold text-foreground/5 font-display">
              {i + 1}
            </div>
            <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-primary/10 border border-primary/25 grid place-items-center mb-2 sm:mb-4 group-hover:scale-105 transition-transform">
              <it.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <h3 className="font-semibold mb-0.5 sm:mb-1 text-foreground text-xs sm:text-base leading-tight">
              {it.title}
            </h3>
            <p className="text-[11px] sm:text-sm text-muted-foreground leading-snug line-clamp-3 sm:line-clamp-none">
              {it.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function WhyChoose() {
  const items: { icon: LucideIcon; title: string; desc: string }[] = [
    {
      icon: Zap,
      title: "Instant Exchange",
      desc: "Convert INR to USDT in minutes with real-time rates.",
    },
    {
      icon: Shield,
      title: "Secure & Trusted",
      desc: "Bank-grade encryption and 2FA protection for every transaction.",
    },
    {
      icon: Clock,
      title: "24/7 Available",
      desc: "Trade anytime, anywhere with our always-on platform.",
    },
    {
      icon: MapPin,
      title: "Pan-India Coverage",
      desc: "Supports all major Indian banks for seamless payouts.",
    },
  ];

  return (
    <section
      className="container mx-auto px-3 sm:px-4 pt-2 sm:pt-8 pb-4 sm:pb-10 scroll-mt-24 max-w-6xl"
      id="why-choose"
    >
      <div className="text-center max-w-2xl mx-auto mb-3 sm:mb-8">
        <h2 className="font-display text-lg sm:text-3xl font-bold tracking-tight text-foreground">
          Why Choose <span className="gradient-text">{site.siteName}</span>?
        </h2>
        <p className="text-xs sm:text-base text-muted-foreground mt-1.5 sm:mt-2">
          Trade with the platform trusted by thousands
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {items.map((item) => (
          <article
            key={item.title}
            className="site-card rounded-xl sm:rounded-2xl p-3 sm:p-6 hover:border-primary/30 transition-colors group"
          >
            <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-primary/10 border border-primary/25 grid place-items-center mb-2 sm:mb-4 group-hover:scale-105 transition-transform">
              <item.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-foreground text-xs sm:text-lg mb-0.5 sm:mb-1.5 leading-tight">
              {item.title}
            </h3>
            <p className="text-[11px] sm:text-sm text-muted-foreground leading-snug line-clamp-3 sm:line-clamp-none">
              {item.desc}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
