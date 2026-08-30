"use client";

import { useId } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { EmptyState } from "@/components/ui/EmptyState";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import {
  CHART_ANIMATION_DURATION,
  CHART_COLORS,
  CHART_DEFAULT_HEIGHT,
  CHART_FONT_SIZE,
  CHART_MARGIN,
  CHART_STROKE_WIDTH,
  usePrefersReducedMotion,
} from "@/components/charts/chart-theme";
import { formatCompactTick, formatShortDateTick } from "@/components/charts/format";

export type TrendAreaPoint = {
  date: string;
  value: number;
};

export type TrendAreaChartProps = {
  data: TrendAreaPoint[];
  /** Plain-English one-liner used as the chart's accessible name and sr-only description. */
  plainSummary: string;
  /** Legend/tooltip label for the series. Defaults to "Value". */
  seriesName?: string;
  /** Container height in px. Defaults to `CHART_DEFAULT_HEIGHT` (280). */
  height?: number;
};

/**
 * Minimal single-series gradient area chart for generic `{ date, value }`
 * time series (e.g. a metric history that doesn't need a confidence band —
 * see `TrajectoryLineChart` for that case).
 */
export function TrendAreaChart({ data, plainSummary, seriesName = "Value", height = CHART_DEFAULT_HEIGHT }: TrendAreaChartProps) {
  const gradientId = useId();
  const prefersReducedMotion = usePrefersReducedMotion();

  if (data.length === 0) {
    return <EmptyState title="No data yet" message="There's no trend data to chart right now." />;
  }

  const tickInterval = Math.max(0, Math.floor(data.length / 6) - 1);

  return (
    <div style={{ height }} role="img" aria-label={plainSummary}>
      <p className="sr-only">{plainSummary}</p>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={CHART_MARGIN}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.accent} stopOpacity={0.35} />
              <stop offset="100%" stopColor={CHART_COLORS.accent} stopOpacity={0.03} />
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
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            name={seriesName}
            stroke={CHART_COLORS.accent}
            strokeWidth={CHART_STROKE_WIDTH}
            fill={`url(#${gradientId})`}
            isAnimationActive={!prefersReducedMotion}
            animationDuration={CHART_ANIMATION_DURATION}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
