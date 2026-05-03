import { Link, useLocation } from "@tanstack/react-router";
import { Home, ArrowDownToLine, ArrowUpFromLine, User, MoreHorizontal, Wallet } from "lucide-react";

const items = [
  { to: "/app", label: "Home", icon: Home, exact: true },
  { to: "/app/buy", label: "Buy", icon: ArrowDownToLine },
  { to: "/app/sell", label: "Sell", icon: ArrowUpFromLine },
  { to: "/app/withdraw", label: "Withdraw", icon: Wallet },
  { to: "/app/profile", label: "Profile", icon: User },
  { to: "/app/more", label: "More", icon: MoreHorizontal },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  const isActive = (to: string, exact?: boolean) => exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden">
      <div className="mx-auto max-w-md px-3 pb-3 pt-1">
        <div className="glass-strong rounded-2xl px-2 py-1.5 flex items-center justify-between shadow-[var(--shadow-card)]">
          {items.map((it) => {
            const active = isActive(it.to, "exact" in it ? it.exact : false);
            return (
              <Link key={it.to} to={it.to} className="relative flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl transition-colors">
                {active && <span className="absolute inset-1 rounded-xl gradient-primary opacity-15" />}
                <it.icon className={`h-5 w-5 transition-colors ${active ? "text-accent" : "text-muted-foreground"}`} strokeWidth={active ? 2.4 : 2} />
                <span className={`text-[10px] font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>{it.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export function SideNav() {
  const { pathname } = useLocation();
  const isActive = (to: string, exact?: boolean) => exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 sticky top-16 h-[calc(100vh-4rem)] py-6 pr-4 gap-1">
      {items.map((it) => {
        const active = isActive(it.to, "exact" in it ? it.exact : false);
        return (
          <Link key={it.to} to={it.to} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${active ? "bg-primary/15 text-foreground" : "text-secondary hover:bg-surface hover:text-foreground"}`}>
            <it.icon className={`h-4 w-4 ${active ? "text-accent" : ""}`} />
            {it.label}
          </Link>
        );
      })}
    </aside>
  );
}
