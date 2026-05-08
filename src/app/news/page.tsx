import type { Metadata } from "next";

import Link from "next/link";

import { NewsFeed } from "@/components/dashboard/NewsFeed";
import { env } from "@/lib/config";
import { slugify } from "@/lib/seo";
import { getDashboardSnapshot } from "@/server/dashboard-service";

export const revalidate = 180;

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
  const topTags = Array.from(new Set(snapshot.news.flatMap((item) => item.virusTags))).slice(0, 12);
  const topSources = Array.from(new Set(snapshot.news.map((item) => item.source))).slice(0, 12);
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
      <section className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-5">
        <h1 className="text-2xl font-bold text-cyan-100">Outbreak News Stream</h1>
        <p className="mt-2 text-sm text-cyan-100/70">Aggregated from public RSS and open intelligence sources.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {topTags.map((tag) => (
            <Link
              key={tag}
              href={`/news/topic/${slugify(tag)}`}
              className="rounded-md border border-cyan-400/35 px-2 py-1 text-xs text-cyan-200 hover:text-fuchsia-300"
            >
              {tag}
            </Link>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {topSources.map((source) => (
            <Link
              key={source}
              href={`/news/source/${slugify(source)}`}
              className="rounded-md border border-cyan-400/35 px-2 py-1 text-xs text-cyan-200 hover:text-fuchsia-300"
            >
              {source}
            </Link>
          ))}
        </div>
      </section>
      <NewsFeed items={snapshot.news} />
    </div>
  );
}
