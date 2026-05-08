import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NewsFeed } from "@/components/dashboard/NewsFeed";
import { deslugify, slugify } from "@/lib/seo";
import { getDashboardSnapshot } from "@/server/dashboard-service";

type NewsSourcePageProps = {
  params: Promise<{ sourceSlug: string }>;
};

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
  if (items.length === 0) return notFound();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${deslugify(sourceSlug)} source feed`,
    description: `Source-specific emerging threat headlines from ${deslugify(sourceSlug)}.`,
  };

  return (
    <div className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-5">
        <h1 className="text-2xl font-bold text-cyan-100">{deslugify(sourceSlug)} source feed</h1>
        <p className="mt-2 text-sm text-cyan-100/75">{items.length} stories from this source.</p>
      </section>
      <NewsFeed items={items} />
    </div>
  );
}
