/**
 * Risk heat scale.
 *
 * This is the single source of truth for the 6-step risk ramp used across
 * the map, legends, and any other heat-coded UI. The color values below are
 * hardcoded copies of the --color-risk-1..6 OKLCH tokens defined in
 * src/app/globals.css — that file remains the design-authority source; keep
 * these in sync with it if the tokens ever change.
 */
export type RiskLevel = 1 | 2 | 3 | 4 | 5 | 6;

export const RISK_SCALE: { level: RiskLevel; cssVar: string; color: string; label: string }[] = [
  { level: 1, cssVar: "--color-risk-1", color: "oklch(87% 0.17 100)", label: "Very low" },
  { level: 2, cssVar: "--color-risk-2", color: "oklch(80% 0.18 75)", label: "Low" },
  { level: 3, cssVar: "--color-risk-3", color: "oklch(73% 0.19 55)", label: "Moderate" },
  { level: 4, cssVar: "--color-risk-4", color: "oklch(64% 0.21 38)", label: "High" },
  { level: 5, cssVar: "--color-risk-5", color: "oklch(54% 0.21 26)", label: "Very high" },
  { level: 6, cssVar: "--color-risk-6", color: "oklch(38% 0.17 20)", label: "Critical" },
];

/**
 * Buckets `value` (as a fraction of `max`) into one of the 6 risk levels.
 * Uses even sixths of the value/max ratio (quantile-ish: each step covers a
 * roughly equal slice of the observed range).
 */
export function getRiskLevel(value: number, max: number): RiskLevel {
  if (max <= 0 || value <= 0) return 1;
  const ratio = value / max;
  if (ratio >= 5 / 6) return 6;
  if (ratio >= 4 / 6) return 5;
  if (ratio >= 3 / 6) return 4;
  if (ratio >= 2 / 6) return 3;
  if (ratio >= 1 / 6) return 2;
  return 1;
}

/**
 * Returns the risk-ramp color for `value` relative to `max`.
 * Kept for backwards compatibility with existing callers (e.g. WorldHeatMap);
 * new code should prefer RISK_SCALE + getRiskLevel directly.
 */
export function getHeatColor(value: number, max: number): string {
  const level = getRiskLevel(value, max);
  return RISK_SCALE[level - 1].color;
}

export function projectToWorldMap(latitude: number, longitude: number, width: number, height: number) {
  const x = ((longitude + 180) / 360) * width;
  const y = ((90 - latitude) / 180) * height;
  return { x, y };
}
