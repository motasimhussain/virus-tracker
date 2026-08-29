"use client";

import { cn } from "@/lib/cn";

export type PulseDotProps = {
  /**
   * Design token name (without the `--color-` prefix), e.g. "accent",
   * "trend-rising", "risk-4". Resolved via `var(--color-<token>)`.
   * Defaults to "accent".
   */
  color?: string;
  /** Accessible label describing what's live, e.g. "Live data". Required. */
  label: string;
  className?: string;
};

/**
 * Small live/status indicator dot. Pulses via the CSS `pulse-dot` keyframe
 * defined in globals.css — CSS-only, no JS animation loop, and the utility
 * already disables itself under `prefers-reduced-motion: reduce` (see
 * globals.css), so the dot just sits still and stays visible there.
 */
export function PulseDot({ color = "accent", label, className }: PulseDotProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn("inline-block h-2 w-2 shrink-0 rounded-full animate-pulse-dot", className)}
      style={{ backgroundColor: `var(--color-${color})` }}
    />
  );
}
