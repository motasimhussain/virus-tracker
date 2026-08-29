"use client";

import { Children, isValidElement, type ElementType, type ReactNode } from "react";
import { m, useReducedMotion } from "motion/react";

import { cn } from "@/lib/cn";

/** Tags Reveal is allowed to render as — keep this to plain block/inline containers. */
type RevealTag = "div" | "section" | "article" | "li" | "span" | "header" | "footer";

export type RevealProps = {
  children: ReactNode;
  /** HTML tag to render. Defaults to "div". */
  as?: RevealTag;
  className?: string;
  /** Stagger delay in seconds before the reveal animation starts. */
  delay?: number;
};

function warnIfAdSlotChild(children: ReactNode) {
  if (process.env.NODE_ENV === "production") return;
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const type = child.type as { displayName?: string; name?: string } | string;
    const name = typeof type === "string" ? type : (type?.displayName ?? type?.name);
    if (name === "AdSlot") {
      console.warn(
        "[Reveal] Found an <AdSlot> child. Ads must never be wrapped in animated containers — " +
          "render AdSlot as a sibling of Reveal, not inside it.",
      );
    }
  });
}

/**
 * Viewport-entry reveal: fades in and translates up (12px) the first time
 * this element scrolls into view, then never re-animates (`viewport.once`).
 * Animates `opacity`/`transform` only — zero layout shift.
 *
 * IMPORTANT: never wrap an `<AdSlot>` in `Reveal` (or any animated
 * container). Ad networks measure a slot's layout/visibility on mount, and
 * an animated wrapper can produce bad viewability signals or CLS. In dev,
 * Reveal detects an `AdSlot` child by displayName/name and warns via
 * `console.warn` — it does not block rendering, so fix the warning, don't
 * rely on it.
 *
 * Becomes a static no-op (content always visible, no animation) under
 * `prefers-reduced-motion: reduce`.
 */
export function Reveal({ children, as = "div", className, delay = 0 }: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  warnIfAdSlotChild(children);

  if (prefersReducedMotion) {
    const StaticTag = as as ElementType;
    return <StaticTag className={className}>{children}</StaticTag>;
  }

  const MotionTag = m[as];

  return (
    <MotionTag
      className={cn(className)}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  );
}
