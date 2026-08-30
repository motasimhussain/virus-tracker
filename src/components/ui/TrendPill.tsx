import { TrendingDown, TrendingUp, Minus } from "lucide-react";

import { cn } from "@/lib/cn";

export type Trend = "rising" | "stable" | "falling";

export type TrendPillProps = {
  trend: Trend;
  /** Optional plain-text suffix, e.g. "vs last week". */
  suffix?: string;
  className?: string;
};

const config: Record<Trend, { label: string; icon: typeof TrendingUp; colorClass: string }> = {
  rising: { label: "Rising", icon: TrendingUp, colorClass: "text-trend-rising" },
  stable: { label: "Stable", icon: Minus, colorClass: "text-trend-stable" },
  falling: { label: "Falling", icon: TrendingDown, colorClass: "text-trend-falling" },
};

/** Arrow + word trend indicator ("Rising"/"Stable"/"Falling") using the trend color tokens. */
export function TrendPill({ trend, suffix, className }: TrendPillProps) {
  const { label, icon: Icon, colorClass } = config[trend];

  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", colorClass, className)}>
      <Icon className="size-3.5" aria-hidden="true" />
      <span>{label}</span>
      {suffix ? <span className="font-normal text-text-faint">{suffix}</span> : null}
    </span>
  );
}
