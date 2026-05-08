import type { ThreatMatrixPoint } from "@/lib/types";

type ThreatMatrixPanelProps = {
  points: ThreatMatrixPoint[];
};

export function ThreatMatrixPanel({ points }: ThreatMatrixPanelProps) {
  const width = 520;
  const height = 280;
  const padding = 32;
  const maxPressure = Math.max(...points.map((point) => point.pressure), 0.01);
  const maxCfr = Math.max(...points.map((point) => point.caseFatalityRatio), 0.01);
  const maxActive = Math.max(...points.map((point) => point.activeCases), 1);

  const toX = (pressure: number) => padding + (pressure / maxPressure) * (width - padding * 2);
  const toY = (cfr: number) => height - padding - (cfr / maxCfr) * (height - padding * 2);

  return (
    <div className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-4">
      <h3 className="text-sm uppercase tracking-[0.2em] text-cyan-300">Threat Matrix</h3>
      <p className="mt-1 text-xs text-cyan-100/70">Pressure (x) vs CFR (y) with bubble size by active cases</p>
      <div className="mt-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
          <rect x={padding} y={padding} width={width - padding * 2} height={height - padding * 2} fill="rgba(15,23,42,0.55)" stroke="rgba(34,211,238,0.2)" />
          {points.slice(0, 24).map((point) => (
            <g key={point.key}>
              <circle
                cx={toX(point.pressure)}
                cy={toY(point.caseFatalityRatio)}
                r={Math.max(4, Math.min(22, Math.sqrt(point.activeCases / maxActive) * 22))}
                fill={`rgba(244,114,182,${Math.max(0.25, point.confidence)})`}
                stroke="rgba(224,242,254,0.5)"
              />
              <title>{`${point.label} | CFR ${point.caseFatalityRatio}% | Pressure ${point.pressure}`}</title>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
