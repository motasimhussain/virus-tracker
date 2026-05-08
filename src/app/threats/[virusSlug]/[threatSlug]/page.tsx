import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { env } from "@/lib/config";
import { deslugify, slugify } from "@/lib/seo";
import { getDashboardSnapshot } from "@/server/dashboard-service";

type ThreatPageProps = {
  params: Promise<{ virusSlug: string; threatSlug: string }>;
};

function threatSlugFor(region: string, countryCode: string): string {
  return slugify(`${region}-${countryCode}`);
}

export async function generateMetadata({ params }: ThreatPageProps): Promise<Metadata> {
  const { virusSlug, threatSlug } = await params;
  return {
    title: `${deslugify(threatSlug)} Threat Analysis`,
    description: `Threat intelligence for ${deslugify(threatSlug)} under ${virusSlug} monitoring.`,
    alternates: {
      canonical: `/threats/${virusSlug}/${threatSlug}`,
    },
    openGraph: {
      title: `${deslugify(threatSlug)} Threat Analysis`,
      description: `Threat intelligence for ${deslugify(threatSlug)} under ${virusSlug} monitoring.`,
      url: `${env.APP_URL}/threats/${virusSlug}/${threatSlug}`,
      type: "article",
    },
  };
}

export default async function ThreatPage({ params }: ThreatPageProps) {
  const { virusSlug, threatSlug } = await params;
  const snapshot = await getDashboardSnapshot();
  const threat = snapshot.hotspots.find(
    (item) => item.slug === virusSlug && threatSlugFor(item.region, item.countryCode) === threatSlug,
  );

  if (!threat) return notFound();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: env.APP_URL },
      { "@type": "ListItem", position: 2, name: "Threats", item: `${env.APP_URL}/` },
      {
        "@type": "ListItem",
        position: 3,
        name: `${threat.region} (${threat.countryCode})`,
        item: `${env.APP_URL}/threats/${virusSlug}/${threatSlug}`,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <section className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-5">
        <h1 className="text-2xl font-bold text-cyan-100">
          {threat.region} ({threat.countryCode}) threat profile
        </h1>
        <p className="mt-2 text-sm text-cyan-100/75">
          {threat.virus} threat zone with {threat.activeCases.toLocaleString()} active cases and{" "}
          {threat.deaths.toLocaleString()} deaths.
        </p>
      </section>
      <section className="grid gap-3 rounded-xl border border-cyan-500/25 bg-slate-900/70 p-5 text-sm text-cyan-100/80 md:grid-cols-2">
        <p>Confirmed cases: {threat.confirmedCases.toLocaleString()}</p>
        <p>Recovered cases: {threat.recovered.toLocaleString()}</p>
        <p>Location level: {threat.locationLevel}</p>
        <p>Source confidence: {(threat.sourceConfidence * 100).toFixed(1)}%</p>
      </section>
      <div className="flex gap-3">
        <Link
          href={`/map?virus=${threat.slug}&threat=${encodeURIComponent(`${threat.slug}:${threat.locationId}`)}`}
          className="rounded-md border border-cyan-400/35 px-3 py-1 text-xs text-cyan-200 hover:text-fuchsia-300"
        >
          Open threat on map
        </Link>
        <Link
          href={`/regions/${threat.countryCode.toLowerCase()}/${threat.slug}`}
          className="rounded-md border border-cyan-400/35 px-3 py-1 text-xs text-cyan-200 hover:text-fuchsia-300"
        >
          Region + virus page
        </Link>
      </div>
    </div>
  );
}
