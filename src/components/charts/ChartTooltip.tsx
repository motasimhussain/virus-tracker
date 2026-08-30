"use client";

import type { ReactNode } from "react";

import { CHART_COLORS } from "@/components/charts/chart-theme";
import { formatCompactNumber, formatFullDate } from "@/components/charts/format";

export type ChartTooltipPayloadEntry = {
  name?: string | number;
  value?: number | string | Array<number | string>;
  color?: string;
  stroke?: string;
  fill?: string;
  unit?: string | number;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
};

export type ChartTooltipProps = {
  /** Injected by Recharts when used as the `content` prop of `<Tooltip />`. */
  active?: boolean;
  payload?: ChartTooltipPayloadEntry[];
  label?: string | number;
  /**
   * Format the header row (usually a date). Defaults to a long-form date
   * (`formatFullDate`) when `label` parses as an ISO date, otherwise the
   * raw label is shown as-is.
   */
  labelFormatter?: (label: string | number) => ReactNode;
  /** Format each row's value. Defaults to `formatCompactNumber` for numeric values, otherwise the raw value. */
  valueFormatter?: (value: number | string | Array<number | string>, entry: ChartTooltipPayloadEntry) => ReactNode;
  /** Hide rows whose `dataKey`/`name` matches one of these — e.g. a helper series used only to build a confidence band. */
  hideKeys?: Array<string | number>;
};

/**
 * Shared custom tooltip for every chart in this kit: a dark raised surface,
 * a date/label header, and plain-English "Label: value" rows (colored dot +
 * name on the left, formatted value on the right). Use as
 * `<Tooltip content={<ChartTooltip />} />` (or with formatter overrides).
 */
export function ChartTooltip({ active, payload, label, labelFormatter, valueFormatter, hideKeys }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const rows = hideKeys
    ? payload.filter((entry) => !hideKeys.includes(entry.dataKey ?? entry.name ?? ""))
    : payload;

  if (rows.length === 0) {
    return null;
  }

  const header =
    label === undefined
      ? null
      : labelFormatter
        ? labelFormatter(label)
        : typeof label === "string" && !Number.isNaN(new Date(label).getTime())
          ? formatFullDate(label)
          : label;

  return (
    <div
      className="min-w-[10rem] rounded-lg border px-3 py-2 shadow-elevated"
      style={{
        backgroundColor: CHART_COLORS.tooltipSurface,
        borderColor: CHART_COLORS.tooltipBorder,
      }}
    >
      {header !== null ? (
        <p className="mb-1.5 text-xs font-semibold" style={{ color: CHART_COLORS.textPrimary }}>
          {header}
        </p>
      ) : null}
      <dl className="space-y-1">
        {rows.map((entry, index) => {
          const swatch = entry.color ?? entry.stroke ?? entry.fill ?? CHART_COLORS.accent;
          const rawValue = entry.value;
          const value = valueFormatter
            ? valueFormatter(rawValue ?? 0, entry)
            : typeof rawValue === "number"
              ? formatCompactNumber(rawValue)
              : rawValue;

          return (
            <div
              key={`${entry.dataKey ?? entry.name ?? index}`}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <dt className="flex items-center gap-1.5" style={{ color: CHART_COLORS.textMuted }}>
                <span
                  className="inline-block size-2 rounded-full"
                  style={{ backgroundColor: swatch }}
                  aria-hidden="true"
                />
                {entry.name ?? "Value"}
              </dt>
              <dd className="font-mono font-medium" style={{ color: CHART_COLORS.textPrimary }}>
                {value}
                {entry.unit ? <span style={{ color: CHART_COLORS.textFaint }}> {entry.unit}</span> : null}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
