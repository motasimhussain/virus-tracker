import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type BadgeVariant = "neutral" | "accent" | "highlight" | "risk" | "trend" | "outline";
type Trend = "rising" | "stable" | "falling";

export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  variant?: BadgeVariant;
  /** Required when `variant="risk"`. 1 (lowest) - 6 (critical), maps to `bg-risk-N`. */
  riskLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Required when `variant="trend"`. */
  trend?: Trend;
  children: ReactNode;
};

const baseClasses =
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium leading-none whitespace-nowrap";

const staticVariantClasses: Record<Exclude<BadgeVariant, "risk" | "trend">, string> = {
  neutral: "bg-surface-inset text-text-secondary border border-border-default",
  accent: "bg-accent-soft text-accent border border-border-accent",
  highlight: "bg-highlight/15 text-highlight border border-highlight/30",
  outline: "bg-transparent text-text-secondary border border-border-default",
};

/** Risk levels 4-6 are dark enough that dark badge text reads better than the page's light text. */
const riskDarkText = new Set([4, 5, 6]);

const trendClasses: Record<Trend, string> = {
  rising: "bg-trend-rising/15 text-trend-rising border border-trend-rising/30",
  stable: "bg-trend-stable/15 text-trend-stable border border-trend-stable/30",
  falling: "bg-trend-falling/15 text-trend-falling border border-trend-falling/30",
};

/**
 * Small label chip. Use `variant="risk"` with `riskLevel` to render a swatch
 * from the risk heat ramp, or `variant="trend"` with `trend` for a
 * rising/stable/falling tinted chip.
 */
export function Badge({ variant = "neutral", riskLevel, trend, className, children, ...rest }: BadgeProps) {
  if (variant === "risk") {
    const level = riskLevel ?? 1;
    return (
      <span
        className={cn(
          baseClasses,
          riskDarkText.has(level) ? "text-white" : "text-slate-950",
          className,
        )}
        style={{ backgroundColor: `var(--color-risk-${level})` }}
        {...rest}
      >
        {children}
      </span>
    );
  }

  if (variant === "trend") {
    const resolvedTrend = trend ?? "stable";
    return (
      <span className={cn(baseClasses, trendClasses[resolvedTrend], className)} {...rest}>
        {children}
      </span>
    );
  }

  return (
    <span className={cn(baseClasses, staticVariantClasses[variant], className)} {...rest}>
      {children}
    </span>
  );
}
