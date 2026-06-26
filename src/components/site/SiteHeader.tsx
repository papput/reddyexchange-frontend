import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  ChevronDown,
  Headphones,
  LogIn,
  Menu,
  Star,
  UserPlus,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useAuth, useHydrated } from "@/lib/store";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  icon: LucideIcon;
  hash?: string;
  to?: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Exchange", icon: ArrowLeftRight, hash: "exchange" },
  { label: "Deposit", icon: Wallet, hash: "deposit" },
  { label: "Reviews", icon: Star, to: "/reviews" },
  { label: "Contact", icon: Headphones, to: "/contact" },
];

function scrollToHash(hash: string) {
  const el = document.getElementById(hash);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function NavLinkButton({
  item,
  onNavigate,
  variant = "desktop",
}: {
  item: NavItem;
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const Icon = item.icon;

  const go = useCallback(() => {
    if (item.to) {
      navigate({ to: item.to });
      onNavigate?.();
      return;
    }
    if (item.hash) {
      if (location.pathname === "/") {
        scrollToHash(item.hash);
      } else {
        navigate({ to: "/", hash: item.hash });
      }
      onNavigate?.();
    }
  }, [item.hash, item.to, location.pathname, navigate, onNavigate]);

  if (variant === "mobile") {
    return (
      <button
        type="button"
        onClick={go}
        className={cn(
          "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left",
          "border border-white/[0.08] bg-surface/50",
          "hover:border-primary/30 hover:bg-surface/80 transition-all duration-200",
        )}
      >
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            "bg-gradient-to-br from-primary/25 via-primary/15 to-accent/15",
            "border border-primary/25",
            "shadow-[0_0_20px_-8px_rgba(108,76,255,0.45)]",
            "group-hover:shadow-[0_0_24px_-6px_rgba(108,76,255,0.55)] transition-shadow",
          )}
        >
          <Icon className="h-4 w-4 text-accent" strokeWidth={2} />
        </span>
        <span className="text-sm font-semibold text-foreground">{item.label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={go}
      className={cn(
        "group flex items-center gap-2 rounded-xl px-2.5 py-2",
        "text-secondary hover:text-foreground",
        "border border-transparent hover:border-primary/20 hover:bg-white/[0.05]",
        "transition-all duration-200",
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg",
          "bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20",
          "group-hover:shadow-[0_0_16px_-4px_rgba(108,76,255,0.45)] transition-shadow",
        )}
      >
        <Icon className="h-4 w-4 text-accent" strokeWidth={2} />
      </span>
      <span className="text-sm font-semibold tracking-tight">{item.label}</span>
    </button>
  );
}

function MobileNavPanel({
  open,
  menuTop,
  onClose,
  children,
}: {
  open: boolean;
  menuTop: number;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <>
      <div
        role="presentation"
        aria-hidden
        className="fixed left-0 right-0 bottom-0 z-[120] w-full max-w-full bg-black/50 lg:hidden"
        style={{ top: menuTop }}
        onClick={onClose}
      />
      <nav
        aria-label="Mobile"
        className={cn(
          "fixed left-0 right-0 z-[130] w-full max-w-full lg:hidden",
          "border-b border-primary/25 bg-surface-2/95 backdrop-blur-xl",
          "shadow-[0_16px_48px_-12px_rgba(0,0,0,0.55)]",
          "animate-in fade-in slide-in-from-top-2 duration-200",
        )}
        style={{ top: menuTop }}
      >
        {children}
      </nav>
    </>,
    document.body,
  );
}

export function SiteHeader() {
  const auth = useAuth();
  const hydrated = useHydrated();
  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(68);

  const syncMenuTop = useCallback(() => {
    if (!headerRef.current) return;
    setMenuTop(headerRef.current.getBoundingClientRect().bottom);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    syncMenuTop();
    const onLayout = () => syncMenuTop();
    window.addEventListener("resize", onLayout);
    window.addEventListener("scroll", onLayout, true);
    return () => {
      window.removeEventListener("resize", onLayout);
      window.removeEventListener("scroll", onLayout, true);
    };
  }, [menuOpen, syncMenuTop]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => {
    setMenuOpen((open) => {
      if (!open) syncMenuTop();
      return !open;
    });
  };

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "sticky top-0 isolate overflow-visible",
          menuOpen ? "z-[140]" : "z-50",
        )}
      >
        <div className="relative overflow-visible border-b border-white/[0.08] bg-background/65 backdrop-blur-2xl">
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"
            aria-hidden
          />

          <div className="container relative mx-auto flex h-[4.25rem] items-center justify-between gap-3 overflow-visible px-4 sm:h-[4.75rem] sm:px-5">
            <Logo />

            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1" aria-label="Main">
              {NAV_ITEMS.map((item) => (
                <NavLinkButton key={item.label} item={item} />
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-2.5">
              {hydrated && auth ? (
                <div className="cta-shadow-zone hidden sm:block">
                  <Button
                    asChild
                    className="h-10 border-0 px-4 sm:px-5 text-sm sm:text-base gradient-primary hover-glow"
                  >
                    <Link to="/app">Open App</Link>
                  </Button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Button
                    asChild
                    variant="ghost"
                    className="h-10 px-4 text-sm sm:text-base text-secondary hover:text-foreground"
                  >
                    <Link to="/login" className="inline-flex items-center gap-1.5">
                      <LogIn className="h-4 w-4" />
                      Login
                    </Link>
                  </Button>
                  <div className="cta-shadow-zone">
                    <Button
                      asChild
                      className="h-10 border-0 px-5 text-sm sm:text-base gradient-primary hover-glow"
                    >
                      <Link to="/register" className="inline-flex items-center gap-1.5">
                        <UserPlus className="h-4 w-4" />
                        Sign up
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                aria-expanded={menuOpen}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                onClick={toggleMenu}
                className={cn(
                  "lg:hidden relative z-[1] h-10 w-10 sm:h-10 sm:w-auto sm:px-3.5 p-0",
                  "glass border-primary/25 hover:border-primary/45",
                  menuOpen && "border-primary/50 bg-primary/10",
                )}
              >
                {menuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <>
                    <Menu className="h-5 w-5 sm:mr-1.5" />
                    <ChevronDown className="hidden sm:block h-4 w-4 text-muted-foreground" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <MobileNavPanel open={menuOpen} menuTop={menuTop} onClose={closeMenu}>
        <div className="w-full max-w-full px-4 py-3 sm:px-5 space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent px-1 mb-2">
            Navigate
          </p>
          {NAV_ITEMS.map((item) => (
            <NavLinkButton key={item.label} item={item} variant="mobile" onNavigate={closeMenu} />
          ))}

          <div className="h-px my-3 bg-gradient-to-r from-transparent via-border to-transparent" />

          {hydrated && auth ? (
            <div className="cta-shadow-zone pt-1">
              <Button
                asChild
                className="w-full h-11 border-0 gradient-primary hover-glow text-base font-semibold"
              >
                <Link to="/app" onClick={closeMenu}>
                  Open App
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <Button
                asChild
                variant="outline"
                className="h-11 glass border-border/60 text-base font-semibold"
              >
                <Link to="/login" onClick={closeMenu} className="inline-flex items-center gap-1.5">
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              </Button>
              <div className="cta-shadow-zone">
                <Button
                  asChild
                  className="w-full h-11 border-0 gradient-primary hover-glow text-base font-semibold"
                >
                  <Link to="/register" onClick={closeMenu} className="inline-flex items-center gap-1.5">
                    <UserPlus className="h-4 w-4" />
                    Sign up
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </MobileNavPanel>
    </>
  );
}
