"use client";

import { useId, useMemo } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { EmptyState } from "@/components/ui/EmptyState";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import {
  CHART_ANIMATION_DURATION,
  CHART_COLORS,
  CHART_FONT_SIZE,
  usePrefersReducedMotion,
} from "@/components/charts/chart-theme";
import { formatCompactNumber, formatCompactTick } from "@/components/charts/format";

export type RegionBarChartDatum = {
  name: string;
  value: number;
};

export type RegionBarChartProps = {
  data: RegionBarChartDatum[];
  /** Plain-English one-liner used as the chart's accessible name and sr-only description. */
  plainSummary: string;
  /** How many top rows (by value, descending) to plot. Defaults to 10. */
  topN?: number;
  /** Container height in px. Defaults to a value derived from row count. */
  height?: number;
};

const ROW_HEIGHT = 34;
const MIN_HEIGHT = 160;
const CHART_PADDING = 40;

/**
 * Horizontal bar chart ranking regions/categories by value, with an
 * accent-to-highlight gradient fill. The gradient's `<linearGradient>` id
 * is generated per-instance with `useId` — the old hand-rolled SVG version
 * of this chart hardcoded `id="barGrad"`, which collided whenever two
 * instances rendered on the same page.
 */
export function RegionBarChart({ data, plainSummary, topN = 10, height }: RegionBarChartProps) {
  const gradientId = useId();
  const prefersReducedMotion = usePrefersReducedMotion();

  const sorted = useMemo(
    () =>
      [...data]
        .sort((a, b) => b.value - a.value)
        .slice(0, topN),
    [data, topN],
  );

  if (sorted.length === 0) {
    return <EmptyState title="No regions yet" message="There's no regional data to rank right now." />;
  }

  const resolvedHeight = height ?? Math.max(MIN_HEIGHT, sorted.length * ROW_HEIGHT + CHART_PADDING);

  return (
    <div style={{ height: resolvedHeight }} role="img" aria-label={plainSummary}>
      <p className="sr-only">{plainSummary}</p>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sorted} layout="vertical" margin={{ top: 8, right: 48, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={CHART_COLORS.accent} />
              <stop offset="100%" stopColor={CHART_COLORS.highlight} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={formatCompactTick}
            tick={{ fill: CHART_COLORS.axis, fontSize: CHART_FONT_SIZE }}
            stroke={CHART_COLORS.grid}
            tickLine={false}
            axisLine={{ stroke: CHART_COLORS.grid }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            tick={{ fill: CHART_COLORS.axisLabel, fontSize: CHART_FONT_SIZE }}
            stroke={CHART_COLORS.grid}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip cursor={{ fill: CHART_COLORS.accentSoft }} content={<ChartTooltip />} />
          <Bar
            dataKey="value"
            name="Value"
            fill={`url(#${gradientId})`}
            radius={[0, 4, 4, 0]}
            isAnimationActive={!prefersReducedMotion}
            animationDuration={CHART_ANIMATION_DURATION}
          >
            <LabelList
              dataKey="value"
              position="right"
              formatter={(value: unknown) => formatCompactNumber(Number(value))}
              fill={CHART_COLORS.textMuted}
              fontSize={CHART_FONT_SIZE}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
