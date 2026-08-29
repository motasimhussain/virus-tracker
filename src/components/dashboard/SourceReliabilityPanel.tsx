import type { SourceReliabilitySummary } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { PulseDot } from "@/components/motion/PulseDot";
import { METRIC_COPY, formatCompactNumber } from "@/lib/copy";
import { cn } from "@/lib/cn";

export type SourceReliabilityPanelProps = {
  summary: SourceReliabilitySummary;
  /**
   * Optional named per-source rows for callers that have source-level health
   * data. When omitted, falls back to two aggregate rows built from the
   * summary's healthy/unhealthy counts.
   */
  sources?: Array<{ name: string; healthy: boolean }>;
};

/**
 * "Where this data comes from" — reframes the raw healthy/unhealthy source
 * counts as a plain sentence plus status rows, each with a pulsing dot
 * (green = reporting normally, red = down).
 */
export function SourceReliabilityPanel({ summary, sources }: SourceReliabilityPanelProps) {
  const totalSources = summary.healthySources + summary.unhealthySources;
  const rows =
    sources ??
    [
      { name: "Healthy sources", count: summary.healthySources, healthy: true },
      { name: "Sources down", count: summary.unhealthySources, healthy: false },
    ]
      .filter((row) => row.count > 0)
      .map((row) => ({ name: `${row.count} ${row.name.toLowerCase()}`, healthy: row.healthy }));

  const sentence =
    totalSources > 0
      ? `${summary.healthySources} of ${totalSources} sources are reporting normally.`
      : "No sources are configured yet.";

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Where this data comes from</p>
        <p className="mt-1 text-sm text-text-secondary">{sentence}</p>
      </div>

      {rows.length > 0 ? (
        <ul className="space-y-2">
          {rows.map((row, index) => (
            <li
              key={`${row.name}-${index}`}
              className="flex items-center justify-between gap-2 rounded-lg bg-surface-inset px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2 text-text-secondary">
                <PulseDot
                  color={row.healthy ? "trend-falling" : "trend-rising"}
                  label={row.healthy ? `${row.name} reporting normally` : `${row.name} is down`}
                />
                {row.name}
              </span>
              <span className={cn("text-xs font-medium", row.healthy ? "text-trend-falling" : "text-trend-rising")}>
                {row.healthy ? "Healthy" : "Down"}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-border-default bg-surface-inset p-3">
          <dt className="text-xs text-text-muted">{METRIC_COPY.confidence.label}</dt>
          <dd className="mt-1 text-xl font-bold text-text-primary">{(summary.averageConfidence * 100).toFixed(0)}%</dd>
        </div>
        <div className="rounded-lg border border-border-default bg-surface-inset p-3">
          <dt className="text-xs text-text-muted">Confidence-adjusted exposure</dt>
          <dd className="mt-1 text-xl font-bold text-text-primary">
            {formatCompactNumber(summary.confidenceAdjustedExposure)}
          </dd>
        </div>
      </dl>
    </Card>
  );
}
