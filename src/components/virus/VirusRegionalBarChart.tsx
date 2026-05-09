import type { RegionMetric } from "@/lib/types";

type VirusRegionalBarChartProps = {
  metrics: RegionMetric[];
  virusName: string;
  topN?: number;
};

function regionLabel(metric: RegionMetric): string {
  if (metric.locationLevel === "admin1" && metric.admin1Name) {
    return `${metric.admin1Name}, ${metric.countryName}`;
  }
  return `${metric.region} (${metric.countryCode})`;
}

export function VirusRegionalBarChart({ metrics, virusName, topN = 10 }: VirusRegionalBarChartProps) {
  const sorted = [...metrics].sort((a, b) => b.activeCases - a.activeCases).slice(0, topN);
  const maxActive =
    sorted.length > 0 ? Math.max(...sorted.map((m) => m.activeCases), 1) : 1;
  const labelWidth = 220;
  const barMaxWidth = 200;
  const rowHeight = 26;
  const padding = 12;
  const width = labelWidth + barMaxWidth + padding * 2;
  const height = padding * 2 + sorted.length * rowHeight;

  return (
    <div className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-4">
      <h3 className="text-sm uppercase tracking-[0.2em] text-cyan-300">Top regions by active cases</h3>
      <p className="mt-1 text-xs text-cyan-100/70">
        Top {sorted.length} tracked locations for {virusName} by active cases in the current dataset.
      </p>
      <div className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto min-w-[320px] w-full" role="img" aria-label={`Bar chart of top regions for ${virusName}`}>
          {sorted.map((metric, index) => {
            const y = padding + index * rowHeight;
            const barWidth = (metric.activeCases / maxActive) * barMaxWidth;
            const label = regionLabel(metric);
            const truncated = label.length > 36 ? `${label.slice(0, 34)}…` : label;
            return (
              <g key={`${metric.locationId}-${metric.slug}`}>
                <text x={padding} y={y + 16} className="fill-cyan-100/90 text-[11px]">
                  {truncated}
                </text>
                <rect
                  x={labelWidth}
                  y={y + 6}
                  width={barWidth}
                  height={14}
                  rx={3}
                  fill="url(#barGrad)"
                  opacity={0.92}
                />
                <text
                  x={labelWidth + barWidth + 6}
                  y={y + 17}
                  className="fill-cyan-200/90 text-[10px] font-mono"
                >
                  {metric.activeCases.toLocaleString()}
                </text>
                <title>{`${label}: ${metric.activeCases.toLocaleString()} active`}</title>
              </g>
            );
          })}
          <defs>
            <linearGradient id="barGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(6,182,212)" />
              <stop offset="100%" stopColor="rgb(217,70,239)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
