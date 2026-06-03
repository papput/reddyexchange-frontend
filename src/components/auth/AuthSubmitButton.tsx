import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AuthSubmitButton({
  loading,
  children,
  className,
}: {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Button
      type="submit"
      disabled={loading}
      className={cn(
        "group relative w-full h-12 sm:h-[3.25rem] text-base font-semibold",
        "gradient-primary border-0 hover-glow gap-2",
        "shadow-[0_8px_32px_-8px_color-mix(in_oklab,#6C4CFF_55%,transparent)]",
        "disabled:opacity-70",
        className,
      )}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <span className="inline-flex items-center gap-2">
          {children}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      )}
    </Button>
  );
}
