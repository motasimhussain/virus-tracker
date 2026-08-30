import { ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import type { NewsItem } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export type NewsFeedProps = {
  items: NewsItem[];
};

/** News list: source badge, relative time, and an external-link affordance on hover. */
export function NewsFeed({ items }: NewsFeedProps) {
  if (items.length === 0) {
    return (
      <Card>
        <EmptyState title="No stories yet" message="There's no news to show right now." />
      </Card>
    );
  }

  return (
    <Card padding="none" className="divide-y divide-border-default overflow-hidden">
      {items.map((item) => {
        const publishedDate = new Date(item.publishedAt);
        const relative = Number.isNaN(publishedDate.getTime())
          ? null
          : formatDistanceToNow(publishedDate, { addSuffix: true });

        return (
          <a
            key={item.id}
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="group flex min-w-0 items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-surface-inset"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-primary transition-colors group-hover:text-accent">
                {item.title}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-text-secondary">{item.summary}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline">{item.source}</Badge>
                {relative ? <span className="text-[11px] text-text-faint">{relative}</span> : null}
              </div>
            </div>
            <ExternalLink
              className="mt-0.5 size-4 shrink-0 text-text-faint transition-colors group-hover:text-accent"
              aria-hidden="true"
            />
          </a>
        );
      })}
    </Card>
  );
}
