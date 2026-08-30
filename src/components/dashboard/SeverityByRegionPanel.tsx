import type { SeverityRegionBucket } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { RiskBar } from "@/components/ui/RiskBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { METRIC_COPY, formatCompactNumber } from "@/lib/copy";
import { getRiskLevel } from "@/lib/map-scale";

export type SeverityByRegionPanelProps = {
  buckets: SeverityRegionBucket[];
  /** Optional plain-English panel title override. */
  title?: string;
};

/**
 * Ranks regions by overall threat level using risk-ramp fill bars, so the
 * darkest/reddest bar is the region under the most strain.
 */
export function SeverityByRegionPanel({ buckets, title = "Where it's hitting hardest" }: SeverityByRegionPanelProps) {
  const top = buckets.slice(0, 8);

  if (top.length === 0) {
    return (
      <Card>
        <EmptyState title="No regions yet" message="There's no severity data to rank right now." />
      </Card>
    );
  }

  const maxScore = Math.max(...top.map((item) => item.severityScore), 1);

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{METRIC_COPY.severityScore.label}</p>
        <h3 className="mt-1 text-lg font-bold text-text-primary">{title}</h3>
      </div>
      <ul className="space-y-4">
        {top.map((item) => {
          const level = getRiskLevel(item.severityScore, maxScore);
          return (
            <li key={item.key}>
              <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                <span className="font-medium text-text-secondary">{item.label}</span>
                <span className="text-xs text-text-muted">
                  {formatCompactNumber(item.totalActiveCases)} active &middot; score {item.severityScore.toFixed(1)}
                </span>
              </div>
              <RiskBar value={item.severityScore} max={maxScore} riskLevel={level} label={`Threat level in ${item.label}`} />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
