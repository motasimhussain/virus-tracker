import type { Metadata } from "next";

import { VirusWikiIndexNav, type VirusWikiIndexItem } from "@/components/wiki/VirusWikiIndexNav";
import { SectionHeader } from "@/components/ui";
import { getVirusWiki, getVirusWikiFallback } from "@/data/virus-wiki";
import { env } from "@/lib/config";
import { VIRUSES } from "@/lib/viruses";

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

/** Distills a lead paragraph down to its first sentence, for a compact card excerpt. */
function firstSentence(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^.*?[.!?](?=\s|$)/);
  return match ? match[0].trim() : trimmed;
}

export default async function VirusWikiIndexPage() {
  // The index lists every pathogen in the canonical registry (VIRUSES), not
  // just the ones with a live ingested snapshot — most tracked viruses are
  // curated-only, and their wiki pages are still fully browsable.
  const viruses = [...VIRUSES].sort((a, b) => a.name.localeCompare(b.name));

  const items: VirusWikiIndexItem[] = viruses.map((v) => {
    const wiki = getVirusWiki(v.slug) ?? getVirusWikiFallback(v.name, "");
    return {
      slug: v.slug,
      name: v.name,
      shortName: v.shortName,
      category: v.category,
      hasLiveData: v.hasLiveData,
      lead: firstSentence(wiki.lead),
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
      <header className="rounded-2xl border border-border-default bg-surface-raised p-6">
        <SectionHeader
          eyebrow="Navigation"
          title="The plain-English virus guide"
          description="Choose a pathogen to open its full wiki: clinical and surveillance context, live regional metrics where available, trajectory charts, threat visuals, and an embedded global infection heat map. Updated from the same snapshot as the dashboard."
        />
      </header>
      <VirusWikiIndexNav viruses={items} />
    </div>
  );
}
