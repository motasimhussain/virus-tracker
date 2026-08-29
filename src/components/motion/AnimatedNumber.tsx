"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

import { formatCompactNumber } from "@/lib/copy";

export type AnimatedNumberProps = {
  /** Target numeric value to display. */
  value: number;
  /** "compact" -> formatCompactNumber ("1.2M"); "plain" -> full comma-grouped integer. Default "plain". */
  format?: "compact" | "plain";
  /** Count-up duration in milliseconds. Default 900. */
  durationMs?: number;
  className?: string;
};

function formatValue(v: number, format: "compact" | "plain"): string {
  const rounded = Math.round(v);
  return format === "compact" ? formatCompactNumber(rounded) : new Intl.NumberFormat("en-US").format(rounded);
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Counts up to `value` on mount and whenever it changes, using a rAF-driven
 * ease-out (no layout/library spring dependency needed).
 *
 * The very first render (server and pre-hydration client) renders the
 * FINAL formatted value as text — never "0" — so there's no hydration
 * mismatch and no layout shift. The count-up animation only starts once
 * mounted, counting up from 0 on first mount, or from the previous value
 * on subsequent changes.
 *
 * Pass a fixed-width `className` (e.g. `tabular-nums`) so the digit count
 * doesn't reflow the surrounding layout as the number animates.
 *
 * Becomes a static no-op (renders the final value immediately, no
 * animation) under `prefers-reduced-motion: reduce`.
 */
export function AnimatedNumber({ value, format = "plain", durationMs = 900, className }: AnimatedNumberProps) {
  const prefersReducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(() => formatValue(value, format));
  const prevValueRef = useRef<number | null>(null);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const from = prevValueRef.current ?? 0;
    const to = value;
    prevValueRef.current = value;

    if (prefersReducedMotion || from === to) {
      setDisplay(formatValue(to, format));
      return;
    }

    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / durationMs);
      const eased = easeOutCubic(t);
      setDisplay(formatValue(from + (to - from) * eased, format));
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current);
    };
  }, [value, format, durationMs, prefersReducedMotion]);

  return <span className={className}>{display}</span>;
}
