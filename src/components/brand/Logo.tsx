import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { site } from "@/config/site";
import brandMark from "@/assets/brand/reddy-exchange-logo.png";

export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src={brandMark}
      alt=""
      aria-hidden
      draggable={false}
      className={cn("object-contain shrink-0", className)}
      width={128}
      height={128}
    />
  );
}

function SiteNameText({ className }: { className?: string }) {
  const words = site.siteName.trim().split(/\s+/);
  const first = words[0] ?? site.siteName;
  const rest = words.slice(1).join(" ");
  return (
    <span className={className}>
      {first}
      {rest ? <span className="gradient-text"> {rest}</span> : null}
    </span>
  );
}

/** Logo + site name for hero / marketing (not a link). */
export function HeroBrandWordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <BrandMark className="h-10 w-10 sm:h-12 sm:w-12" />
      <SiteNameText className="font-semibold tracking-tight text-xl sm:text-2xl text-foreground" />
    </div>
  );
}

export function Logo({ to = "/", className = "" }: { to?: string; className?: string }) {
  return (
    <Link to={to} className={cn("flex items-center gap-2 group", className)}>
      <BrandMark className="h-8 w-8 group-hover:opacity-90 transition-opacity" />
      <SiteNameText className="font-semibold tracking-tight text-lg" />
    </Link>
  );
}
