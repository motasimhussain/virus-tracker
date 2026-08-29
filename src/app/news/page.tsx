import type { Metadata } from "next";

import Link from "next/link";
import { Newspaper } from "lucide-react";

import { Reveal } from "@/components/motion";
import { NewsCard } from "@/components/news/NewsCard";
import { NewsFilters } from "@/components/news/NewsFilters";
import { Badge, EmptyState, SectionHeader } from "@/components/ui";
import { env } from "@/lib/config";
import { slugify } from "@/lib/seo";
import { getDashboardSnapshot } from "@/server/dashboard-service";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Outbreak News",
  description:
    "Latest emerging threat and virus updates aggregated from WHO, ReliefWeb, and other trusted public sources.",
  alternates: {
    canonical: "/news",
  },
};

export default async function NewsPage() {
  const snapshot = await getDashboardSnapshot();
  const items = snapshot.news;
  const topSources = Array.from(new Set(items.map((item) => item.source))).slice(0, 14);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Outbreak News Stream",
    description: "Curated emerging threat news from trusted global feeds.",
    url: `${env.APP_URL}/news`,
  };

  return (
    <div className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />

      <SectionHeader
        eyebrow="Live feed"
        title="Outbreak news, all in one stream"
        description="Headlines are aggregated from WHO, ReliefWeb, and other public health and open intelligence sources, then tagged by pathogen so you can filter to what matters."
      />

      <NewsFilters />

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
          title="No news available"
          message="We couldn't load any stories from our sources right now. Check back shortly."
        />
      )}

      {topSources.length > 0 ? (
        <section aria-labelledby="news-sources-heading" className="space-y-3">
          <h2 id="news-sources-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
            Browse by source
          </h2>
          <div className="flex flex-wrap gap-2">
            {topSources.map((source) => (
              <Link key={source} href={`/news/source/${slugify(source)}`}>
                <Badge variant="outline" className="transition-colors hover:border-border-accent hover:text-accent">
                  {source}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
