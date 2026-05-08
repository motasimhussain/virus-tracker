import type { TrajectoryPoint } from "@/lib/types";

type TrajectoryChartProps = {
  points: TrajectoryPoint[];
};

export function TrajectoryChart({ points }: TrajectoryChartProps) {
  if (points.length === 0) {
    return (
      <div className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-4">
        <h3 className="text-sm uppercase tracking-[0.2em] text-cyan-300">Trajectory (14d)</h3>
        <p className="mt-4 text-sm text-cyan-100/70">No trajectory data available.</p>
      </div>
    );
  }

  const max = Math.max(...points.map((point) => point.confidenceHigh), 1);
  const width = 900;
  const height = 220;
  const padding = 24;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const toX = (index: number) =>
    points.length <= 1 ? padding : padding + (index / (points.length - 1)) * innerWidth;
  const toY = (value: number) => padding + innerHeight - (value / max) * innerHeight;

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${toX(index)} ${toY(point.projectedCases)}`)
    .join(" ");

  const bandPath = [
    ...points.map((point, index) => `${index === 0 ? "M" : "L"} ${toX(index)} ${toY(point.confidenceHigh)}`),
    ...[...points]
      .reverse()
      .map((point, reverseIndex) => {
        const index = points.length - 1 - reverseIndex;
        return `L ${toX(index)} ${toY(point.confidenceLow)}`;
      }),
    "Z",
  ].join(" ");

  return (
    <div className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-4">
      <h3 className="text-sm uppercase tracking-[0.2em] text-cyan-300">Trajectory (14d)</h3>
      <div className="mt-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
          <path d={bandPath} fill="rgba(34,211,238,0.15)" stroke="none" />
          <path d={linePath} fill="none" stroke="rgba(217,70,239,0.9)" strokeWidth="3" />
          {points.map((point, index) => (
            <circle
              key={point.date}
              cx={toX(index)}
              cy={toY(point.projectedCases)}
              r="3"
              fill="rgba(103,232,249,0.95)"
            />
          ))}
        </svg>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-cyan-100/75">
        <span>Projected trend</span>
        <span>Confidence band</span>
        <span>{points[0]?.date} to {points[points.length - 1]?.date}</span>
      </div>
    </div>
  );
}
