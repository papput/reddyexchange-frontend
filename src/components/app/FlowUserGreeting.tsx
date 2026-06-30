import { useAuth } from "@/lib/store";
import { cn } from "@/lib/utils";

function GreetingText({ firstName }: { firstName: string | null }) {
  const hour = new Date().getHours();
  const name = firstName ? (
    <span className="font-semibold text-foreground">{firstName}</span>
  ) : null;

  if (!firstName) {
    if (hour < 12) return <>Good morning</>;
    if (hour < 17) return <>Good afternoon</>;
    if (hour < 21) return <>Good evening</>;
    return <>Hey there</>;
  }

  if (hour < 12) return <>Good morning, {name}</>;
  if (hour < 17) return <>Hey {name}</>;
  if (hour < 21) return <>Good evening, {name}</>;
  return <>Dear {name}</>;
}

export function FlowUserGreeting({
  title,
  className,
}: {
  title: React.ReactNode;
  className?: string;
}) {
  const auth = useAuth();
  const firstName = auth?.user.fullName?.trim().split(/\s+/)[0] ?? null;

  return (
    <div className={cn("mb-5 sm:mb-6", className)}>
      <p className="text-sm sm:text-[15px] text-secondary leading-relaxed">
        <GreetingText firstName={firstName} />
      </p>
      <h1 className="mt-1 text-2xl sm:text-[1.75rem] font-bold tracking-tight text-foreground leading-tight">
        {title}
      </h1>
    </div>
  );
}
