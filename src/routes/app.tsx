import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { BottomNav, SideNav } from "@/components/app/AppNav";
import { Logo } from "@/components/brand/Logo";
import { useAuth, useHydrated, logout, refreshProfile } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { buildWhatsAppUrl, defaultWhatsAppMessage } from "@/lib/contact-links";
import whatsappIcon from "@/assets/whatsapp.svg";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const auth = useAuth();
  const hydrated = useHydrated();
  const nav = useNavigate();
  const redirected = useRef(false);
  const { data: settings } = usePublicSettings();
  const wa = buildWhatsAppUrl(
    settings?.whatsappNumber ?? "",
    defaultWhatsAppMessage(settings)
  );

  useEffect(() => {
    if (!hydrated || !auth?.token) return;
    refreshProfile().catch(() => {});
  }, [hydrated, auth?.token]);

  useEffect(() => {
    if (!hydrated || auth || redirected.current) return;
    redirected.current = true;
    nav({ to: "/login", replace: true });
  }, [hydrated, auth, nav]);

  if (!hydrated || !auth) {
    return null;
  }

  const firstName = auth?.user.fullName?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo to="/app" />
          <div className="flex items-center gap-2">
            {wa ? (
              <Button asChild size="sm" variant="ghost" className="text-emerald-400 hover:text-emerald-300 px-2">
                <a href={wa} target="_blank" rel="noopener noreferrer" title="WhatsApp support">
                  <img src={whatsappIcon} alt="" className="h-5 w-5" width={20} height={20} />
                </a>
              </Button>
            ) : (
              <Button asChild size="sm" variant="ghost" className="text-secondary hidden sm:inline-flex">
                <Link to="/contact">Help</Link>
              </Button>
            )}
            <span className="hidden sm:inline text-sm text-secondary">
              Hi, <span className="text-foreground">{firstName}</span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { logout(); nav({ to: "/" }); }}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <div className="flex-1 container mx-auto px-4 flex gap-6">
        <SideNav />
        <main className="flex-1 py-6 pb-32 lg:pb-12 max-w-3xl mx-auto w-full animate-fade-up">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
