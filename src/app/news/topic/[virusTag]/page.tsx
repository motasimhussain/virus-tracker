import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NewsFeed } from "@/components/dashboard/NewsFeed";
import { deslugify, slugify } from "@/lib/seo";
import { getDashboardSnapshot } from "@/server/dashboard-service";

type NewsTopicPageProps = {
  params: Promise<{ virusTag: string }>;
};

export async function generateMetadata({ params }: NewsTopicPageProps): Promise<Metadata> {
  const { virusTag } = await params;
  const readable = deslugify(virusTag);
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
  const normalizedTag = deslugify(virusTag);
  const snapshot = await getDashboardSnapshot();
  const items = snapshot.news.filter((item) => item.virusTags.some((tag) => slugify(tag) === virusTag));

  if (items.length === 0) return notFound();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${normalizedTag} news topic`,
    description: `News topic hub for ${normalizedTag} outbreak and threat updates.`,
  };

  return (
    <div className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-5">
        <h1 className="text-2xl font-bold text-cyan-100">{normalizedTag} topic feed</h1>
        <p className="mt-2 text-sm text-cyan-100/75">{items.length} curated stories tagged for this topic.</p>
      </section>
      <NewsFeed items={items} />
    </div>
  );
}
