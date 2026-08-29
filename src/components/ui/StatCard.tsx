import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";

export type StatCardProps = {
  /** Plain-English label, e.g. "Active cases today". */
  label: string;
  /**
   * The big headline value. Takes children (rather than a string prop) so
   * pages can drop in an `AnimatedNumber` or other rich content.
   */
  children: ReactNode;
  /** Small supporting line under the value, e.g. "as of 6:00 AM UTC". */
  hint?: string;
  /** Optional slot rendered next to the label, typically an `<InfoTip>`. */
  infoTip?: ReactNode;
  /** Optional slot rendered next to the value, typically a `<TrendPill>`. */
  trend?: ReactNode;
  className?: string;
};

/**
 * KPI tile: label + big value + optional hint, info tooltip, and trend pill.
 * The headline value is passed as `children` so callers can render an
 * animated counter or other custom markup.
 */
export function StatCard({ label, children, hint, infoTip, trend, className }: StatCardProps) {
  return (
    <Card className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-text-muted">{label}</p>
        {infoTip}
      </div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <p className="text-2xl font-bold text-text-primary sm:text-3xl">{children}</p>
        {trend}
      </div>
      {hint ? <p className="text-xs text-text-faint">{hint}</p> : null}
    </Card>
  );
}
