import type { Metadata } from "next";

import { VirusWikiIndexNav } from "@/components/wiki/VirusWikiIndexNav";
import { getVirusWiki } from "@/data/virus-wiki";
import { env } from "@/lib/config";
import { getDashboardSnapshot } from "@/server/dashboard-service";

export const revalidate = 1800;

const PAGE_DESCRIPTION =
  "Browse Virus Tracker wiki pages: outbreak context, transmission, symptoms, global infection heat maps, and analytics for each tracked pathogen.";

export const metadata: Metadata = {
  title: "Virus Wiki — pathogen guides & heat maps",
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: "/viruses",
  },
  openGraph: {
    title: "Virus Wiki — pathogen guides & heat maps",
    description:
      "Select a virus to read curated wiki content, view regional metrics, and explore the global infection heat map.",
    url: `${env.APP_URL}/viruses`,
    type: "website",
    siteName: "Virus Tracker",
  },
  twitter: {
    card: "summary_large_image",
    title: "Virus Wiki — pathogen guides & heat maps",
    description:
      "Select a virus to read curated wiki content, view regional metrics, and explore the global infection heat map.",
  },
};

export default async function VirusWikiIndexPage() {
  const snapshot = await getDashboardSnapshot();
  const viruses = [...snapshot.viruses].sort((a, b) => a.name.localeCompare(b.name));

  const items = viruses.map((v) => {
    const wiki = getVirusWiki(v.slug);
    return {
      slug: v.slug,
      name: v.name,
      summary: wiki?.lead ?? v.summary,
    };
  });

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Virus Tracker — pathogen wiki index",
    description: PAGE_DESCRIPTION,
    url: `${env.APP_URL}/viruses`,
    numberOfItems: viruses.length,
    publisher: {
      "@type": "Organization",
      name: "Virus Tracker",
      url: env.APP_URL,
    },
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Tracked viruses",
    numberOfItems: viruses.length,
    itemListElement: viruses.map((v, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: v.name,
      url: `${env.APP_URL}/viruses/${v.slug}`,
    })),
  };

  return (
    <div className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <header className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Navigation</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-cyan-50">Virus wiki</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-cyan-100/80">
          Choose a pathogen to open its full wiki: clinical and surveillance context, live regional metrics, trajectory
          charts, threat visuals, and an embedded global infection heat map. Updated from the same snapshot as the
          dashboard.
        </p>
      </header>
      <VirusWikiIndexNav viruses={items} />
    </div>
  );
}
