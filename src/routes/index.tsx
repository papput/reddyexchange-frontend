import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
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
import { SiteFooter } from "@/components/site/SiteFooter";
import { HeroBrandWordmark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useAuth, type Network, type PayMethod } from "@/lib/store";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { site } from "@/config/site";
import { buildWhatsAppUrl, defaultWhatsAppMessage } from "@/lib/contact-links";
import whatsappIcon from "@/assets/whatsapp.svg";
import { InrPerUsdtRate, UsdtWord } from "@/components/app/UsdtMark";
import { BuyFlowStepChoosePayAndToken, type BuyAsset } from "@/components/app/BuyFlowStepChoosePayAndToken";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${site.siteName} — Buy USDT Instantly in India | Fast, Secure, Trusted` },
      { name: "description", content: `Buy and sell USDT instantly in India with ${site.siteName}. Live INR↔USDT rate, UPI & bank transfer, multiple networks (TRC20, ERC20, BEP20).` },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { data: settings } = usePublicSettings();
  const rate = settings?.price ?? 91;
  const wa = buildWhatsAppUrl(
    settings?.whatsappNumber ?? "",
    defaultWhatsAppMessage(settings)
  );
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero rate={rate} whatsappUrl={wa} />
        <Steps />
        <Trust />
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero({ rate, whatsappUrl }: { rate: number; whatsappUrl: string }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-3xl opacity-30 gradient-primary" />
      </div>
      <div className="container mx-auto px-4 pt-16 md:pt-24 pb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-up">
            <HeroBrandWordmark />
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span className="text-secondary">Live rate today</span>
              <span className="text-foreground inline-flex items-center gap-1">
                <InrPerUsdtRate inr={rate} size="xs" />
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
              Buy{" "}
              <span className="gradient-text inline-flex items-center gap-1.5">
                <UsdtWord size="lg" className="font-bold" />
              </span>{" "}
              Instantly in India
            </h1>
            <p className="text-lg text-secondary max-w-xl">
              Fast · Secure · Trusted. The premium gateway for digital assets — built for speed, designed for trust.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="gradient-primary border-0 hover-glow text-base h-12 px-7">
                <Link to="/register">Get Started <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-7 glass border-border/60">
                <Link to="/login">I have an account</Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-success" /> Bank-grade security</span>
              <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-accent" /> Instant settlement</span>
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
          <LandingBuyStepCard rate={rate} />
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
  const [network, setNetwork] = useState<Network>("TRC20");
  const [buyAsset, setBuyAsset] = useState<BuyAsset>("pex");

  const goExchange = () => {
    nav({ to: auth?.token ? "/app/buy" : "/register" });
  };

  return (
    <div className="relative animate-scale-in">
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-primary/30 to-accent/20 blur-2xl opacity-60" />
      <div className="relative rounded-3xl shadow-[var(--shadow-elegant)]">
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
    </div>
  );
}

function Steps() {
  const items: { icon: LucideIcon; title: string; desc: ReactNode }[] = [
    { icon: UserPlus, title: "Create Account", desc: "Sign up in 60 seconds with your email & mobile." },
    {
      icon: Wallet,
      title: "Enter Amount",
      desc: (
        <>
          Type INR — see <UsdtWord size="xs" className="font-semibold text-foreground" /> instantly at the live rate.
        </>
      ),
    },
    { icon: CreditCard, title: "Make Payment", desc: "Pay via UPI or bank transfer in one tap." },
    {
      icon: CheckCircle2,
      title: "Receive Funds",
      desc: (
        <>
          <UsdtWord size="xs" className="font-semibold text-foreground" /> lands in your wallet on the chosen network.
        </>
      ),
    },
  ];
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="text-xs uppercase tracking-widest text-accent mb-3">How it works</div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Four steps. Done in minutes.</h2>
        <p className="text-secondary mt-3">A streamlined flow built for first-time and power users alike.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((it, i) => (
          <div key={it.title} className="glass rounded-2xl p-6 hover-lift relative overflow-hidden group">
            <div className="absolute top-3 right-4 text-5xl font-bold text-foreground/5">{i + 1}</div>
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
    { icon: TrendingUp, label: "Volume processed", value: "₹250 Cr+" },
  ];
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="glass-strong rounded-3xl p-8 sm:p-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">Trusted by 10,000+ users across India</h2>
          <p className="text-secondary mt-2 text-sm">Built on a foundation of speed, security, and reliability.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-surface p-5 text-center hover-lift border border-border/40">
              <div className="h-10 w-10 mx-auto rounded-xl bg-primary/10 grid place-items-center mb-3">
                <s.icon className="h-5 w-5 text-accent" />
              </div>
              <div className="text-2xl font-bold gradient-text">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
