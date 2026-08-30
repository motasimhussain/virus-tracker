import type { ElementType, HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type CardVariant = "default" | "raised" | "overlay";
type CardPadding = "none" | "sm" | "md" | "lg";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Which surface token to use. `default` = surface-raised on a border, `raised` = a step brighter with elevation shadow, `overlay` = modal/popover-level surface. */
  variant?: CardVariant;
  /** Inner padding scale. */
  padding?: CardPadding;
  /** Adds the accent glow shadow (resting `shadow-glow`, stronger on hover). */
  glow?: boolean;
  /** Render as a different element (e.g. "section", "article"). Defaults to "div". */
  as?: ElementType;
  children?: ReactNode;
};

const variantClasses: Record<CardVariant, string> = {
  default: "bg-surface-raised border border-border-default shadow-card",
  raised: "bg-surface-raised border border-border-strong shadow-elevated",
  overlay: "bg-surface-overlay border border-border-default shadow-elevated",
};

const paddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

/**
 * Base surface card used across the dashboard for panels, tiles, and grouped
 * content. Replaces the repeated `rounded-xl border border-cyan-500/25
 * bg-slate-900/70 p-4` literal with the shared design tokens.
 */
export function Card({
  variant = "default",
  padding = "md",
  glow = false,
  as: Component = "div",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <Component
      className={cn(
        "rounded-xl transition-shadow duration-200",
        variantClasses[variant],
        paddingClasses[padding],
        glow && "shadow-glow hover:shadow-glow-strong",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
