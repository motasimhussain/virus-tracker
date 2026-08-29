import { StatCard } from "@/components/ui/StatCard";

export type MetricCardProps = {
  /** Plain-English label, e.g. "Active cases" — prefer METRIC_COPY labels over technical names. */
  label: string;
  /** Pre-formatted display value, e.g. "1.2M" or "N/A". */
  value: string;
  /** Optional supporting line under the value. */
  hint?: string;
};

/**
 * KPI tile used across the dashboard and virus pages. Thin wrapper around
 * `ui/StatCard` — kept as its own component so callers have a stable,
 * string-in/string-out API without needing to know about StatCard's
 * children-as-content convention.
 */
export function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <StatCard label={label} hint={hint}>
      {value}
    </StatCard>
  );
}
