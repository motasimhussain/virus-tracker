import type { Metadata } from "next";
import { Newspaper } from "lucide-react";

import { Reveal } from "@/components/motion";
import { NewsCard } from "@/components/news/NewsCard";
import { Button, EmptyState, SectionHeader } from "@/components/ui";
import { deslugify, slugify } from "@/lib/seo";
import { getDashboardSnapshot } from "@/server/dashboard-service";

type NewsSourcePageProps = {
  params: Promise<{ sourceSlug: string }>;
};

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function generateMetadata({ params }: NewsSourcePageProps): Promise<Metadata> {
  const { sourceSlug } = await params;
  const readable = deslugify(sourceSlug);
  return {
    title: `${readable} Source Feed`,
    description: `Emerging threat headlines collected from ${readable}.`,
    alternates: {
      canonical: `/news/source/${sourceSlug}`,
    },
  };
}

export default async function NewsSourcePage({ params }: NewsSourcePageProps) {
  const { sourceSlug } = await params;
  const snapshot = await getDashboardSnapshot();
  const items = snapshot.news.filter((item) => slugify(item.source) === sourceSlug);
  // Prefer the source's own byline casing from a matched item; fall back to a
  // title-cased version of the slug when nothing currently matches.
  const sourceName = items[0]?.source ?? titleCase(deslugify(sourceSlug));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${sourceName} source feed`,
    description: `Source-specific emerging threat headlines from ${sourceName}.`,
  };

  return (
    <div className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <SectionHeader
        eyebrow="Source feed"
        title={sourceName}
        description={`Stories from ${sourceName}.`}
        action={
          <Button href="/news" variant="ghost" size="sm">
            All news
          </Button>
        }
      />

      {items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <Reveal key={item.id} delay={Math.min(index, 8) * 0.04}>
              <NewsCard item={item} />
            </Reveal>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Newspaper className="size-5" aria-hidden="true" />}
          title="No stories yet"
          message={`No recent stories from ${sourceName}.`}
          actionLabel="Back to all news"
          actionHref="/news"
        />
      )}
    </div>
  );
}
