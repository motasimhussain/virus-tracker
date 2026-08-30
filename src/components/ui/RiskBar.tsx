import { cn } from "@/lib/cn";

export type RiskBarProps = {
  /** Current value, e.g. an intensity score or active case count. */
  value: number;
  /** Maximum possible value the bar represents (fill = value / max). */
  max: number;
  /** 1 (lowest) - 6 (critical); selects the fill color from the risk heat ramp. */
  riskLevel: 1 | 2 | 3 | 4 | 5 | 6;
  /** Accessible label describing what this bar measures, e.g. "Outbreak intensity". */
  label: string;
  className?: string;
};

/** Horizontal intensity bar filled from the risk heat ramp tokens. */
export function RiskBar({ value, max, riskLevel, label, className }: RiskBarProps) {
  const safeMax = max > 0 ? max : 1;
  const percent = Math.min(100, Math.max(0, (value / safeMax) * 100));

  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-inset", className)}
    >
      <div
        className="h-full rounded-full transition-[width] duration-300"
        style={{ width: `${percent}%`, backgroundColor: `var(--color-risk-${riskLevel})` }}
      />
    </div>
  );
}
