import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useAuth, useHydrated } from "@/lib/store";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { buildWhatsAppUrl, defaultWhatsAppMessage } from "@/lib/contact-links";
import whatsappIcon from "@/assets/whatsapp.svg";

export function SiteHeader() {
  const auth = useAuth();
  const hydrated = useHydrated();
  const { data: settings } = usePublicSettings();
  const wa = buildWhatsAppUrl(
    settings?.whatsappNumber ?? "",
    defaultWhatsAppMessage(settings)
  );

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-7 text-sm text-secondary">
          <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground" }} className="hover:text-foreground transition-colors">Home</Link>
          <Link to="/about" activeProps={{ className: "text-foreground" }} className="hover:text-foreground transition-colors">About</Link>
          <Link to="/contact" activeProps={{ className: "text-foreground" }} className="hover:text-foreground transition-colors">Contact</Link>
        </nav>
        <div className="flex items-center gap-2">
          {wa ? (
            <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10">
              <a href={wa} target="_blank" rel="noopener noreferrer" title="WhatsApp">
                <img src={whatsappIcon} alt="" className="h-4 w-4 mr-1.5" width={16} height={16} />
                WhatsApp
              </a>
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
              <Link to="/contact">Support</Link>
            </Button>
          )}
          {hydrated && auth ? (
            <Button asChild size="sm" className="gradient-primary border-0 hover-glow">
              <Link to="/app">Open App</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm" className="gradient-primary border-0 hover-glow">
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
