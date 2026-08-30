"use client";

import { CartesianGrid, Cell, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";

import type { ThreatMatrixPoint } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CHART_ANIMATION_DURATION, CHART_COLORS, CHART_FONT_SIZE, usePrefersReducedMotion } from "@/components/charts/chart-theme";
import { formatCompactNumber } from "@/lib/copy";

export type ThreatMatrixPanelProps = {
  points: ThreatMatrixPoint[];
};

type MatrixTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: ThreatMatrixPoint }>;
};

/** Plain-row tooltip for a single bubble: name + the three plotted quantities, in everyday language. */
function MatrixTooltip({ active, payload }: MatrixTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }
  const point = payload[0]!.payload;

  return (
    <div
      className="min-w-[13rem] rounded-lg border px-3 py-2 shadow-elevated"
      style={{ backgroundColor: CHART_COLORS.tooltipSurface, borderColor: CHART_COLORS.tooltipBorder }}
    >
      <p className="mb-1.5 text-xs font-semibold" style={{ color: CHART_COLORS.textPrimary }}>
        {point.label}
      </p>
      <dl className="space-y-1 text-xs">
        <div className="flex items-center justify-between gap-3">
          <dt style={{ color: CHART_COLORS.textMuted }}>How fast it&apos;s spreading</dt>
          <dd className="font-mono" style={{ color: CHART_COLORS.textPrimary }}>
            {point.pressure.toFixed(2)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt style={{ color: CHART_COLORS.textMuted }}>How deadly</dt>
          <dd className="font-mono text-right" style={{ color: CHART_COLORS.textPrimary }}>
            ~{point.caseFatalityRatio.toFixed(1)} of 100 died
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt style={{ color: CHART_COLORS.textMuted }}>People currently sick</dt>
          <dd className="font-mono" style={{ color: CHART_COLORS.textPrimary }}>
            {formatCompactNumber(point.activeCases)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

/**
 * Quadrant chart comparing how fast each threat is spreading against how
 * deadly it is, with bubble size showing how many people are currently
 * sick. Replaces the old hand-rolled SVG bubble chart with a Recharts
 * `ScatterChart` built directly in this file (kept as a private client
 * component here rather than a new file, per the component-ownership rule
 * for this directory).
 */
export function ThreatMatrixPanel({ points }: ThreatMatrixPanelProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const data = points.slice(0, 24);

  if (data.length === 0) {
    return (
      <Card>
        <EmptyState
          title="No threats to compare"
          message="There isn't enough data yet to plot how fast threats are spreading against how deadly they are."
        />
      </Card>
    );
  }

  const maxPressure = Math.max(...data.map((point) => point.pressure), 0.01);
  const maxCfr = Math.max(...data.map((point) => point.caseFatalityRatio), 0.01);

  return (
    <Card>
      <div className="mb-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Threat matrix</p>
        <h3 className="mt-1 text-lg font-bold text-text-primary">How fast vs. how deadly</h3>
        <p className="mt-1 text-sm text-text-secondary">
          Each bubble is a threat. Bigger bubbles mean more people are currently sick.
        </p>
      </div>
      <div
        className="relative mt-3"
        style={{ height: 320 }}
        role="img"
        aria-label="Scatter chart comparing how fast each threat is spreading against how deadly it is; bubble size shows how many people are currently sick"
      >
        <span className="pointer-events-none absolute right-1 top-1 z-10 rounded-full border border-border-accent bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
          Watch closely
        </span>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 16, right: 16, bottom: 28, left: 8 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="pressure"
              name="How fast it's spreading"
              domain={[0, maxPressure * 1.1]}
              tick={{ fill: CHART_COLORS.axis, fontSize: CHART_FONT_SIZE }}
              stroke={CHART_COLORS.grid}
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.grid }}
              label={{
                value: "How fast it's spreading →",
                position: "insideBottom",
                offset: -18,
                fill: CHART_COLORS.axisLabel,
                fontSize: CHART_FONT_SIZE,
              }}
            />
            <YAxis
              type="number"
              dataKey="caseFatalityRatio"
              name="How deadly"
              domain={[0, maxCfr * 1.1]}
              tick={{ fill: CHART_COLORS.axis, fontSize: CHART_FONT_SIZE }}
              stroke={CHART_COLORS.grid}
              tickLine={false}
              axisLine={false}
              width={40}
              label={{
                value: "↑ How deadly",
                angle: -90,
                position: "insideLeft",
                fill: CHART_COLORS.axisLabel,
                fontSize: CHART_FONT_SIZE,
              }}
            />
            <ZAxis type="number" dataKey="activeCases" range={[60, 900]} name="People currently sick" />
            <Tooltip cursor={{ strokeDasharray: "3 3", stroke: CHART_COLORS.grid }} content={<MatrixTooltip />} />
            <Scatter
              data={data}
              isAnimationActive={!prefersReducedMotion}
              animationDuration={CHART_ANIMATION_DURATION}
            >
              {data.map((point) => (
                <Cell
                  key={point.key}
                  fill={CHART_COLORS.highlight}
                  fillOpacity={Math.max(0.35, point.confidence)}
                  stroke={CHART_COLORS.accent}
                  strokeOpacity={0.4}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
