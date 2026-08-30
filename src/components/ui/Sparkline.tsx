import { cn } from "@/lib/cn";

export type SparklineProps = {
  values: number[];
  /** viewBox width in SVG user units; the element itself is responsive (`w-full`). */
  width?: number;
  /** viewBox height in SVG user units. */
  height?: number;
  /** A `--color-*` design token name (without the `text-`/`stroke-` prefix), e.g. "accent", "trend-rising". */
  strokeToken?: string;
  strokeWidth?: number;
  /** Fill the area under the line with a soft wash of the stroke color. */
  filled?: boolean;
  className?: string;
};

/**
 * Tiny inline sparkline: a single polyline plotted from `values`, no axes,
 * labels, or interactivity. Pure server-rendered SVG with a responsive
 * viewBox — no fixed pixel size on the rendered element.
 */
export function Sparkline({
  values,
  width = 100,
  height = 28,
  strokeToken = "accent",
  strokeWidth = 2,
  filled = false,
  className,
}: SparklineProps) {
  if (values.length === 0) {
    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={cn("h-8 w-full", className)}
        role="img"
        aria-label="No trend data available"
      />
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = values.length > 1 ? width / (values.length - 1) : 0;
  const pad = strokeWidth;
  const usableHeight = height - pad * 2;

  const points = values.map((value, index) => {
    const x = values.length > 1 ? index * stepX : width / 2;
    const y = pad + usableHeight - ((value - min) / range) * usableHeight;
    return [x, y] as const;
  });

  const pointsAttr = points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const strokeColor = `var(--color-${strokeToken})`;
  const first = points[0];
  const last = points[points.length - 1];
  const areaPoints = `${first[0].toFixed(2)},${height} ${pointsAttr} ${last[0].toFixed(2)},${height}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn("h-8 w-full overflow-visible", className)}
      role="img"
      aria-label={`Trend sparkline across ${values.length} data points`}
    >
      {filled ? <polygon points={areaPoints} fill={strokeColor} opacity={0.12} stroke="none" /> : null}
      <polyline
        points={pointsAttr}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
