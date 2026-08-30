import type { Metadata } from "next";
import { Newspaper } from "lucide-react";

import { Reveal } from "@/components/motion";
import { NewsCard } from "@/components/news/NewsCard";
import { NewsFilters } from "@/components/news/NewsFilters";
import { Button, EmptyState, SectionHeader } from "@/components/ui";
import { getVirusWiki } from "@/data/virus-wiki";
import { deslugify, slugify } from "@/lib/seo";
import { getVirusDef, VIRUSES, type VirusDefinition } from "@/lib/viruses";
import { getDashboardSnapshot } from "@/server/dashboard-service";

type NewsTopicPageProps = {
  params: Promise<{ virusTag: string }>;
};

/**
 * Resolves a /news/topic/{virusTag} URL slug back to a registry virus
 * definition. News item `virusTags` are free-text display names (e.g.
 * "COVID-19"), not registry slugs, so the topic route slugifies whichever
 * display name/alias matched — try the registry slug itself first, then a
 * slugified display name, then a slugified alias.
 */
function resolveVirusForTag(virusTag: string): VirusDefinition | null {
  return (
    getVirusDef(virusTag) ??
    VIRUSES.find((virus) => slugify(virus.name) === virusTag) ??
    VIRUSES.find((virus) => virus.newsAliases.some((alias) => slugify(alias) === virusTag)) ??
    null
  );
}

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function generateMetadata({ params }: NewsTopicPageProps): Promise<Metadata> {
  const { virusTag } = await params;
  const virusDef = resolveVirusForTag(virusTag);
  const readable = virusDef?.name ?? titleCase(deslugify(virusTag));
  return {
    title: `${readable} News`,
    description: `Latest ${readable} outbreak and emerging threat headlines from trusted sources.`,
    alternates: {
      canonical: `/news/topic/${virusTag}`,
    },
  };
}

export default async function NewsTopicPage({ params }: NewsTopicPageProps) {
  const { virusTag } = await params;
  const virusDef = resolveVirusForTag(virusTag);
  const displayName = virusDef?.name ?? titleCase(deslugify(virusTag));

  const snapshot = await getDashboardSnapshot();
  const items = snapshot.news.filter((item) => item.virusTags.some((tag) => slugify(tag) === virusTag));

  const wikiLead = virusDef ? getVirusWiki(virusDef.slug)?.lead : null;
  const storyCountSentence = `${items.length} curated ${items.length === 1 ? "story is" : "stories are"} tagged for ${displayName}.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${displayName} news topic`,
    description: `News topic hub for ${displayName} outbreak and threat updates.`,
  };

  return (
    <div className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <SectionHeader
        eyebrow="Topic feed"
        title={`${displayName} news`}
        description={wikiLead ?? storyCountSentence}
        action={
          virusDef ? (
            <Button href={`/viruses/${virusDef.slug}`} variant="outline" size="sm">
              Read the {virusDef.name} guide
            </Button>
          ) : undefined
        }
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
          title="No recent news"
          message={`No recent news about ${displayName}. Check the virus guide for background.`}
          actionLabel={virusDef ? `${virusDef.name} guide` : undefined}
          actionHref={virusDef ? `/viruses/${virusDef.slug}` : undefined}
        />
      )}
    </div>
  );
}
