"use client";

import { useId, useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ChartTooltip, type ChartTooltipPayloadEntry } from "@/components/charts/ChartTooltip";
import {
  CHART_ANIMATION_DURATION,
  CHART_COLORS,
  CHART_DEFAULT_HEIGHT,
  CHART_FONT_SIZE,
  CHART_MARGIN,
  CHART_STROKE_WIDTH,
  usePrefersReducedMotion,
} from "@/components/charts/chart-theme";
import { formatCompactNumber, formatCompactTick, formatShortDateTick } from "@/components/charts/format";
import type { TrajectoryPoint } from "@/lib/types";

export type TrajectoryLineChartProps = {
  points: TrajectoryPoint[];
  virusName: string;
  /** Plain-English one-liner used as the chart's accessible name and sr-only description. */
  plainSummary: string;
  /** Container height in px. Defaults to `CHART_DEFAULT_HEIGHT` (280). */
  height?: number;
};

type TrajectoryRow = {
  date: string;
  projectedCases: number;
  confidenceLow: number;
  /** `confidenceHigh - confidenceLow`, stacked on top of the (invisible) `confidenceLow` area to render a per-point confidence band — Recharts has no native "ranged area" data key, so this is the standard two-area stacking trick. */
  confidenceBand: number;
};

function trajectoryTooltipValueFormatter(
  value: number | string | Array<number | string>,
  entry: ChartTooltipPayloadEntry,
): string {
  if (entry.dataKey === "confidenceBand") {
    const row = entry.payload as Partial<TrajectoryRow> | undefined;
    if (typeof row?.confidenceLow === "number" && typeof row?.confidenceBand === "number") {
      const high = row.confidenceLow + row.confidenceBand;
      return `${formatCompactNumber(row.confidenceLow)} – ${formatCompactNumber(high)}`;
    }
  }
  return typeof value === "number" ? formatCompactNumber(value) : String(value);
}

/**
 * Projected-case trajectory: a soft accent confidence band behind an
 * animated accent line, in a Recharts `ComposedChart`. When the leading
 * point is flagged `isSynthetic`, a small "Illustrative estimate" badge
 * appears in the corner so readers know the series is a modeled estimate
 * rather than reported data.
 */
export function TrajectoryLineChart({ points, virusName, plainSummary, height = CHART_DEFAULT_HEIGHT }: TrajectoryLineChartProps) {
  const gradientId = useId();
  const prefersReducedMotion = usePrefersReducedMotion();

  const chartData = useMemo<TrajectoryRow[]>(
    () =>
      points.map((point) => ({
        date: point.date,
        projectedCases: point.projectedCases,
        confidenceLow: point.confidenceLow,
        confidenceBand: Math.max(0, point.confidenceHigh - point.confidenceLow),
      })),
    [points],
  );

  if (chartData.length === 0) {
    return (
      <EmptyState
        title="No trajectory data yet"
        message={`We don't have a projected case trajectory for ${virusName} right now.`}
      />
    );
  }

  const isSynthetic = points[0]?.isSynthetic === true;
  // Thin X-axis ticks to roughly 6 labels regardless of series length.
  const tickInterval = Math.max(0, Math.floor(chartData.length / 6) - 1);

  return (
    <div className="relative" style={{ height }} role="img" aria-label={plainSummary}>
      <p className="sr-only">{plainSummary}</p>
      {isSynthetic ? (
        <Badge variant="accent" className="absolute right-0 top-0 z-10">
          Illustrative estimate
        </Badge>
      ) : null}
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={CHART_MARGIN}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.accent} stopOpacity={0.28} />
              <stop offset="100%" stopColor={CHART_COLORS.accent} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatShortDateTick}
            interval={tickInterval}
            tick={{ fill: CHART_COLORS.axis, fontSize: CHART_FONT_SIZE }}
            stroke={CHART_COLORS.grid}
            tickLine={false}
            axisLine={{ stroke: CHART_COLORS.grid }}
          />
          <YAxis
            tickFormatter={formatCompactTick}
            tick={{ fill: CHART_COLORS.axis, fontSize: CHART_FONT_SIZE }}
            stroke={CHART_COLORS.grid}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            content={<ChartTooltip valueFormatter={trajectoryTooltipValueFormatter} hideKeys={["confidenceLow"]} />}
          />
          <Area
            dataKey="confidenceLow"
            stackId="confidence-band"
            stroke="none"
            fill="transparent"
            name="Confidence low"
            isAnimationActive={!prefersReducedMotion}
            animationDuration={CHART_ANIMATION_DURATION}
          />
          <Area
            dataKey="confidenceBand"
            stackId="confidence-band"
            stroke="none"
            fill={`url(#${gradientId})`}
            name="Confidence range"
            isAnimationActive={!prefersReducedMotion}
            animationDuration={CHART_ANIMATION_DURATION}
          />
          <Line
            type="monotone"
            dataKey="projectedCases"
            name="Projected cases"
            stroke={CHART_COLORS.accent}
            strokeWidth={CHART_STROKE_WIDTH}
            dot={false}
            activeDot={{ r: 4, fill: CHART_COLORS.accent, stroke: CHART_COLORS.tooltipSurface, strokeWidth: 2 }}
            isAnimationActive={!prefersReducedMotion}
            animationDuration={CHART_ANIMATION_DURATION}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
