import type { SourceReliabilitySummary } from "@/lib/types";

type SourceReliabilityPanelProps = {
  summary: SourceReliabilitySummary;
};

export function SourceReliabilityPanel({ summary }: SourceReliabilityPanelProps) {
  const totalSources = summary.healthySources + summary.unhealthySources;
  const healthyPct = totalSources > 0 ? Math.round((summary.healthySources / totalSources) * 100) : 0;

  return (
    <div className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-4">
      <h3 className="text-sm uppercase tracking-[0.2em] text-cyan-300">Source Reliability</h3>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-cyan-700/30 p-3">
          <p className="text-cyan-100/70">Healthy sources</p>
          <p className="text-2xl font-bold text-cyan-50">{summary.healthySources}</p>
        </div>
        <div className="rounded-lg border border-cyan-700/30 p-3">
          <p className="text-cyan-100/70">Unhealthy sources</p>
          <p className="text-2xl font-bold text-cyan-50">{summary.unhealthySources}</p>
        </div>
        <div className="rounded-lg border border-cyan-700/30 p-3">
          <p className="text-cyan-100/70">Average confidence</p>
          <p className="text-2xl font-bold text-cyan-50">{(summary.averageConfidence * 100).toFixed(1)}%</p>
        </div>
        <div className="rounded-lg border border-cyan-700/30 p-3">
          <p className="text-cyan-100/70">Confidence exposure</p>
          <p className="text-2xl font-bold text-cyan-50">{summary.confidenceAdjustedExposure.toLocaleString()}</p>
        </div>
      </div>
      <div className="mt-4">
        <p className="mb-1 text-xs text-cyan-100/70">Health ratio</p>
        <div className="h-2 w-full rounded bg-slate-800">
          <div className="h-2 rounded bg-cyan-500" style={{ width: `${healthyPct}%` }} />
        </div>
      </div>
    </div>
  );
}
