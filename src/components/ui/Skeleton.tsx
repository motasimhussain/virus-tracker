import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type SkeletonVariant = "text" | "card" | "chart";

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  /** `text` = a single line, `card` = a panel-shaped block, `chart` = a taller block for chart placeholders. */
  variant?: SkeletonVariant;
};

const variantClasses: Record<SkeletonVariant, string> = {
  text: "h-3 w-full rounded-md",
  card: "h-24 w-full rounded-xl",
  chart: "h-64 w-full rounded-xl",
};

/** Shimmering loading placeholder. Uses the shared `.animate-shimmer` sheen from globals.css. */
export function Skeleton({ variant = "text", className, ...rest }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-shimmer bg-surface-inset",
        variantClasses[variant],
        className,
      )}
      {...rest}
    />
  );
}
