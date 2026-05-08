import type { SeverityRegionBucket } from "@/lib/types";

type SeverityByRegionPanelProps = {
  buckets: SeverityRegionBucket[];
};

export function SeverityByRegionPanel({ buckets }: SeverityByRegionPanelProps) {
  const top = buckets.slice(0, 8);
  const maxScore = Math.max(...top.map((item) => item.severityScore), 1);

  return (
    <div className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-4">
      <h3 className="text-sm uppercase tracking-[0.2em] text-cyan-300">Severity by Region</h3>
      <div className="mt-4 space-y-3">
        {top.map((item) => (
          <div key={item.key}>
            <div className="mb-1 flex items-center justify-between text-xs text-cyan-100/75">
              <span>{item.label}</span>
              <span>score {item.severityScore.toFixed(1)}</span>
            </div>
            <div className="h-2 w-full rounded bg-slate-800">
              <div
                className="h-2 rounded bg-gradient-to-r from-cyan-500 to-fuchsia-500"
                style={{ width: `${Math.max(8, (item.severityScore / maxScore) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
