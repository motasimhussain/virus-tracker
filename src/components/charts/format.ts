import { formatCompactNumber } from "@/lib/copy";

export { formatCompactNumber };

/**
 * Y-axis / value-label tick formatter for compact numbers, e.g. "1.2M".
 * Thin wrapper around `formatCompactNumber` so chart components import
 * everything number/date-related from one place.
 */
export function formatCompactTick(value: number): string {
  return formatCompactNumber(value);
}

/**
 * Format a percentage value (0-100 scale by default) as "12.3%".
 * Pass `fromRatio: true` when the input is a 0-1 ratio instead.
 */
export function formatPercent(value: number, options?: { fromRatio?: boolean; digits?: number }): string {
  const { fromRatio = false, digits = 1 } = options ?? {};
  const pct = fromRatio ? value * 100 : value;
  return `${pct.toFixed(digits)}%`;
}

function parseChartDate(date: string): Date | null {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * X-axis tick formatter for short dates, e.g. "Jan 5". Falls back to the
 * raw string if it isn't a parseable date (keeps thinned axis ticks from
 * silently disappearing on malformed data).
 */
export function formatShortDateTick(date: string): string {
  const parsed = parseChartDate(date);
  if (!parsed) {
    return date;
  }
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Tooltip/header date formatter for weekly-bucketed series, e.g.
 * "Week of Jan 5".
 */
export function formatWeekOfTick(date: string): string {
  const parsed = parseChartDate(date);
  if (!parsed) {
    return date;
  }
  return `Week of ${parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

/**
 * Full tooltip date header, e.g. "January 5, 2026".
 */
export function formatFullDate(date: string): string {
  const parsed = parseChartDate(date);
  if (!parsed) {
    return date;
  }
  return parsed.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
