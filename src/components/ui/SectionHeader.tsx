import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type SectionHeaderProps = {
  /** Small uppercase tracked label rendered above the title, e.g. "Live Data". */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Right-aligned slot for actions, e.g. a `<Button>` or filter control. */
  action?: ReactNode;
  className?: string;
};

/** Consistent heading block for dashboard sections: eyebrow + title + description + optional action. */
export function SectionHeader({ eyebrow, title, description, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
        ) : null}
        <h2 className="mt-1 text-xl font-bold text-text-primary sm:text-2xl">{title}</h2>
        {description ? <p className="mt-1 text-sm text-text-secondary">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
