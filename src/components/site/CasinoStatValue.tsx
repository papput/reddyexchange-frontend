import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const DURATION_MS = 2400;

function useInViewOnce(threshold = 0.25) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -6% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

function parseStatValue(value: string) {
  const match = value.match(/^([^0-9]*)([0-9][0-9,]*)(.*)$/);
  if (!match) {
    return { prefix: value, digits: null as string | null, suffix: "", target: null as number | null };
  }
  const [, prefix, digits, suffix] = match;
  return {
    prefix,
    digits,
    suffix,
    target: parseInt(digits.replace(/,/g, ""), 10),
  };
}

function formatCount(current: number, digits: string) {
  if (!digits.includes(",")) return String(current);
  return current.toLocaleString("en-IN");
}

function useCountUp(target: number | null, start: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start || target === null) return;

    const t0 = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - t0) / DURATION_MS, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target]);

  return value;
}

export function CasinoStatValue({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const { ref, inView } = useInViewOnce();
  const { prefix, digits, suffix, target } = parseStatValue(value);
  const count = useCountUp(target, inView);

  if (target === null || !digits) {
    return (
      <div
        ref={ref}
        className={cn(
          "text-2xl sm:text-3xl font-bold gradient-text tabular-nums tracking-tight",
          className,
        )}
      >
        {value}
      </div>
    );
  }

  const display = inView ? formatCount(count, digits) : "0";

  return (
    <div
      ref={ref}
      className={cn(
        "text-2xl sm:text-3xl font-bold gradient-text tabular-nums tracking-tight",
        className,
      )}
      aria-label={value}
    >
      {prefix}
      {display}
      {suffix}
    </div>
  );
}
