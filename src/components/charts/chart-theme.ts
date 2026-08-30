"use client";

import { useEffect, useState } from "react";

/**
 * chart-theme.ts — shared visual constants for the Recharts-based chart kit
 * in this directory. Every color is either a `var(--color-*)` string (works
 * directly as an SVG `fill`/`stroke` value or inline style) that resolves
 * against the tokens defined in `src/app/globals.css`, or — where Recharts
 * needs a literal (some internal gradient/opacity calculations don't like
 * `var()` inputs) — the literal value is set here ONCE with a comment
 * pointing back at the token it mirrors. No other file in `charts/` should
 * contain a raw hex/oklch literal; add it here instead.
 */

/** Accent + surface colors, as CSS var() strings — valid directly as SVG fill/stroke. */
export const CHART_COLORS = {
  accent: "var(--color-accent)",
  accentStrong: "var(--color-accent-strong)",
  accentSoft: "var(--color-accent-soft)",
  highlight: "var(--color-highlight)",
  grid: "var(--color-border-default)",
  axis: "var(--color-text-muted)",
  axisLabel: "var(--color-text-secondary)",
  tooltipSurface: "var(--color-surface-overlay)",
  tooltipBorder: "var(--color-border-strong)",
  textPrimary: "var(--color-text-primary)",
  textMuted: "var(--color-text-muted)",
  textFaint: "var(--color-text-faint)",
} as const;

/** Risk heat ramp, 1 (lowest) - 6 (critical), mirrors `--color-risk-1..6`. */
export const CHART_RISK_COLORS: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: "var(--color-risk-1)",
  2: "var(--color-risk-2)",
  3: "var(--color-risk-3)",
  4: "var(--color-risk-4)",
  5: "var(--color-risk-5)",
  6: "var(--color-risk-6)",
};

/** Trend semantics, mirrors `--color-trend-*`. */
export const CHART_TREND_COLORS = {
  rising: "var(--color-trend-rising)",
  stable: "var(--color-trend-stable)",
  falling: "var(--color-trend-falling)",
} as const;

/**
 * Ordered categorical palette for multi-series charts (e.g. donut segments
 * with no explicit riskLevel). Literal values mirror the accent/highlight/
 * risk tokens above — Recharts' Pie/Cell fill resolves `var()` fine, but this
 * array is also used for legend swatch ordering where a stable literal read
 * order is easier to reason about than re-parsing CSS vars at runtime.
 */
export const CHART_CATEGORICAL_PALETTE: readonly string[] = [
  CHART_COLORS.accent,
  CHART_COLORS.highlight,
  CHART_RISK_COLORS[2],
  CHART_RISK_COLORS[4],
  CHART_COLORS.accentStrong,
  CHART_RISK_COLORS[1],
];

/** Numeric pixel font size for axis ticks/legends — Recharts requires a number, not a CSS var. Mirrors `text-xs` (0.75rem / 12px) at a slightly tighter 11px for chart density. */
export const CHART_FONT_SIZE = 11;

/** Default outer margins for cartesian charts — tight but leaves room for rotated/compact tick labels. */
export const CHART_MARGIN = { top: 8, right: 12, bottom: 0, left: 0 } as const;

/** Default height (px) used when a chart's `height` prop is omitted. */
export const CHART_DEFAULT_HEIGHT = 280;

/** Shared stroke width for the primary data line/area border. */
export const CHART_STROKE_WIDTH = 2;

/** Shared animation duration (ms) for draw-in / bar-grow animations. */
export const CHART_ANIMATION_DURATION = 900;

/**
 * True once the browser reports `prefers-reduced-motion: reduce`. Charts use
 * this to disable Recharts' `isAnimationActive` so nothing animates for
 * users who've asked for reduced motion. Defaults to `false` during SSR/
 * first paint (matchMedia isn't available server-side) and syncs on mount.
 */
function getInitialReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(getInitialReducedMotion);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return reduced;
}
