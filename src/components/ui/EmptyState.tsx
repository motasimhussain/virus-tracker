import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

export type EmptyStateProps = {
  /** Defaults to a generic inbox icon. Pass any lucide icon element, e.g. `<SearchX />`. */
  icon?: ReactNode;
  title: string;
  /** Plain-English message explaining why there's nothing here / what to do next. */
  message: string;
  /** Optional action link, e.g. "Clear filters" or "Go to dashboard". */
  actionLabel?: string;
  actionHref?: string;
  className?: string;
};

/** Placeholder shown when a list/panel has no data — icon, title, plain-English message, optional action. */
export function EmptyState({ icon, title, message, actionLabel, actionHref, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-default bg-surface-inset px-6 py-10 text-center",
        className,
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-surface-raised text-text-faint">
        {icon ?? <Inbox className="size-5" aria-hidden="true" />}
      </span>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="max-w-sm text-sm text-text-muted">{message}</p>
      </div>
      {actionLabel && actionHref ? (
        <Button href={actionHref} variant="outline" size="sm" className="mt-1">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
