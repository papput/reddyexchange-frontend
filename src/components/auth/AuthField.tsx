import type { LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function AuthField({
  label,
  icon: Icon,
  children,
  className,
  hint,
  size = "default",
}: {
  label: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  hint?: string;
  size?: "default" | "lg";
}) {
  const lg = size === "lg";

  return (
    <div className={cn("space-y-2 group/field", lg && "space-y-2.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <Label className={cn("font-medium text-foreground", lg ? "text-base" : "text-sm")}>
          {label}
        </Label>
        {hint ? (
          <span className={cn("text-muted-foreground", lg ? "text-xs" : "text-[11px]")}>{hint}</span>
        ) : null}
      </div>
      <div
        className={cn(
          "flex items-center gap-0 rounded-xl border border-border/60",
          "bg-surface/40 backdrop-blur-sm",
          "ring-focus overflow-hidden transition-all duration-200",
          "hover:border-primary/30 hover:bg-surface/55",
          "group-focus-within/field:border-primary/40 group-focus-within/field:shadow-[0_0_20px_-6px_color-mix(in_oklab,#6C4CFF_35%,transparent)]",
          lg && "rounded-[0.9rem]",
        )}
      >
        {Icon ? (
          <span
            className={cn(
              "ml-2 flex shrink-0 items-center justify-center rounded-lg",
              "bg-primary/10 border border-primary/15 text-accent",
              "transition-colors duration-200",
              "group-focus-within/field:bg-primary/20 group-focus-within/field:border-primary/30",
              lg ? "h-10 w-10" : "h-9 w-9",
            )}
            aria-hidden
          >
            <Icon className={lg ? "h-5 w-5" : "h-4 w-4"} />
          </span>
        ) : null}
        <div
          className={cn(
            "flex-1 min-w-0 py-0.5",
            "[&_input]:border-0 [&_input]:bg-transparent [&_input]:shadow-none",
            "[&_input]:placeholder:text-muted-foreground/70",
            "[&_input]:focus-visible:ring-0",
            lg
              ? "[&_input]:h-12 [&_input]:sm:h-[3.25rem] [&_input]:text-base [&_input]:sm:text-[17px]"
              : "[&_input]:h-11 [&_input]:sm:h-12 [&_input]:text-[15px]",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
