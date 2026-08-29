import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Badge, Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import { slugify } from "@/lib/seo";
import type { NewsItem } from "@/lib/types";

export type NewsCardProps = {
  item: NewsItem;
  className?: string;
};

/** Formats a publish timestamp as "3 hours ago", falling back gracefully for unparsable dates. */
function relativeTime(publishedAt: string): string {
  const parsed = new Date(publishedAt);
  if (Number.isNaN(parsed.getTime())) return "recently";
  return `${formatDistanceToNow(parsed)} ago`;
}

/**
 * Single news story card: source + relative time, external-linked title,
 * a 2-line summary clamp, and virus tag chips (excluding the catch-all
 * "General" tag) linking to the matching /news/topic/{slug} page.
 */
export function NewsCard({ item, className }: NewsCardProps) {
  const tags = item.virusTags.filter((tag) => tag.trim().toLowerCase() !== "general");

  return (
    <Card
      as="article"
      glow
      className={cn(
        "flex h-full flex-col gap-3 transition-transform duration-200 hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="accent">{item.source}</Badge>
        <span className="text-xs text-text-muted">{relativeTime(item.publishedAt)}</span>
      </div>

      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-start gap-1.5 text-sm font-semibold leading-snug text-text-primary transition-colors hover:text-accent"
      >
        <span>{item.title}</span>
        <ExternalLink
          className="mt-0.5 size-3.5 shrink-0 text-text-faint transition-colors group-hover:text-accent"
          aria-hidden="true"
        />
      </a>

      <p className="line-clamp-2 text-sm text-text-secondary">{item.summary}</p>

      {tags.length > 0 ? (
        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {tags.map((tag) => (
            <Link key={tag} href={`/news/topic/${slugify(tag)}`}>
              <Badge variant="outline" className="transition-colors hover:border-border-accent hover:text-accent">
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
      ) : null}
    </Card>
  );
}
