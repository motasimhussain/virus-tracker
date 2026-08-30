"use client";

import { useMemo } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { EmptyState } from "@/components/ui/EmptyState";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import {
  CHART_ANIMATION_DURATION,
  CHART_CATEGORICAL_PALETTE,
  CHART_COLORS,
  CHART_DEFAULT_HEIGHT,
  CHART_FONT_SIZE,
  CHART_RISK_COLORS,
  usePrefersReducedMotion,
} from "@/components/charts/chart-theme";
import { formatCompactNumber } from "@/components/charts/format";

export type DonutChartSegment = {
  label: string;
  value: number;
  /** Optional risk level (1 lowest - 6 critical). When set, the slice is colored from the risk heat ramp instead of the categorical palette. */
  riskLevel?: 1 | 2 | 3 | 4 | 5 | 6;
};

export type DonutChartProps = {
  segments: DonutChartSegment[];
  /** Plain-English one-liner used as the chart's accessible name and sr-only description. */
  plainSummary: string;
  /** Container height in px. Defaults to `CHART_DEFAULT_HEIGHT` (280). */
  height?: number;
};

function segmentColor(segment: DonutChartSegment, index: number): string {
  if (segment.riskLevel) {
    return CHART_RISK_COLORS[segment.riskLevel];
  }
  return CHART_CATEGORICAL_PALETTE[index % CHART_CATEGORICAL_PALETTE.length];
}

/**
 * Donut chart with a centered running total and a plain-text legend below
 * the ring. Slice colors come from the risk heat ramp when a segment
 * specifies `riskLevel`, otherwise cycle through the shared categorical
 * palette (`CHART_CATEGORICAL_PALETTE`).
 */
export function DonutChart({ segments, plainSummary, height = CHART_DEFAULT_HEIGHT }: DonutChartProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const total = useMemo(() => segments.reduce((sum, segment) => sum + segment.value, 0), [segments]);

  if (segments.length === 0 || total === 0) {
    return <EmptyState title="No data yet" message="There's nothing to break down right now." />;
  }

  return (
    <div className="relative" style={{ height }} role="img" aria-label={plainSummary}>
      <p className="sr-only">{plainSummary}</p>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8">
        <span className="text-lg font-semibold" style={{ color: CHART_COLORS.textPrimary }}>
          {formatCompactNumber(total)}
        </span>
        <span className="text-[11px]" style={{ color: CHART_COLORS.textFaint }}>
          Total
        </span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<ChartTooltip />} />
          <Pie
            data={segments}
            dataKey="value"
            nameKey="label"
            innerRadius="60%"
            outerRadius="85%"
            paddingAngle={2}
            isAnimationActive={!prefersReducedMotion}
            animationDuration={CHART_ANIMATION_DURATION}
          >
            {segments.map((segment, index) => (
              <Cell key={segment.label} fill={segmentColor(segment, index)} stroke="none" />
            ))}
          </Pie>
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: CHART_FONT_SIZE, color: CHART_COLORS.axisLabel }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
