export {
  CHART_COLORS,
  CHART_RISK_COLORS,
  CHART_TREND_COLORS,
  CHART_CATEGORICAL_PALETTE,
  CHART_FONT_SIZE,
  CHART_MARGIN,
  CHART_DEFAULT_HEIGHT,
  CHART_STROKE_WIDTH,
  CHART_ANIMATION_DURATION,
  usePrefersReducedMotion,
} from "@/components/charts/chart-theme";

export {
  formatCompactNumber,
  formatCompactTick,
  formatPercent,
  formatShortDateTick,
  formatWeekOfTick,
  formatFullDate,
} from "@/components/charts/format";

export { ChartTooltip } from "@/components/charts/ChartTooltip";
export type { ChartTooltipProps, ChartTooltipPayloadEntry } from "@/components/charts/ChartTooltip";

export { TrajectoryLineChart } from "@/components/charts/TrajectoryLineChart";
export type { TrajectoryLineChartProps } from "@/components/charts/TrajectoryLineChart";

export { RegionBarChart } from "@/components/charts/RegionBarChart";
export type { RegionBarChartProps, RegionBarChartDatum } from "@/components/charts/RegionBarChart";

export { TrendAreaChart } from "@/components/charts/TrendAreaChart";
export type { TrendAreaChartProps, TrendAreaPoint } from "@/components/charts/TrendAreaChart";

export { DonutChart } from "@/components/charts/DonutChart";
export type { DonutChartProps, DonutChartSegment } from "@/components/charts/DonutChart";
