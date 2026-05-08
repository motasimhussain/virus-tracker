import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { env } from "@/lib/config";
import { getDashboardSnapshot } from "@/server/dashboard-service";

type RegionPageProps = {
  params: Promise<{ countryCode: string }>;
};

export async function generateMetadata({ params }: RegionPageProps): Promise<Metadata> {
  const { countryCode } = await params;
  return {
    title: `${countryCode.toUpperCase()} Threat Dashboard`,
    description: `Country-level emerging threat and virus monitoring for ${countryCode.toUpperCase()}.`,
    alternates: {
      canonical: `/regions/${countryCode.toLowerCase()}`,
    },
  };
}

export default async function RegionPage({ params }: RegionPageProps) {
  const { countryCode } = await params;
  const code = countryCode.toUpperCase();
  const snapshot = await getDashboardSnapshot();
  const regions = snapshot.hotspots.filter((item) => item.countryCode.toUpperCase() === code);
  if (regions.length === 0) return notFound();

  const countryName = regions[0]!.countryName;
  const virusLinks = Array.from(new Set(regions.map((item) => item.slug)));
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: env.APP_URL },
      { "@type": "ListItem", position: 2, name: "Regions", item: `${env.APP_URL}/` },
      { "@type": "ListItem", position: 3, name: countryName, item: `${env.APP_URL}/regions/${countryCode}` },
    ],
  };

  return (
    <div className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <section className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-5">
        <h1 className="text-2xl font-bold text-cyan-100">{countryName} threat overview</h1>
        <p className="mt-2 text-sm text-cyan-100/75">
          Active threats tracked in {countryName}:{" "}
          {regions.reduce((sum, item) => sum + item.activeCases, 0).toLocaleString()} active cases.
        </p>
      </section>
      <section className="grid gap-2 rounded-xl border border-cyan-500/25 bg-slate-900/70 p-5 text-sm text-cyan-100/80">
        {regions.slice(0, 20).map((item) => (
          <div key={`${item.locationId}-${item.slug}`} className="flex justify-between border-b border-cyan-700/20 py-2">
            <span>{item.virus}</span>
            <span>{item.activeCases.toLocaleString()} active</span>
          </div>
        ))}
      </section>
      <section className="flex flex-wrap gap-2">
        {virusLinks.map((slug) => (
          <Link
            key={slug}
            href={`/regions/${countryCode.toLowerCase()}/${slug}`}
            className="rounded-md border border-cyan-400/35 px-3 py-1 text-xs text-cyan-200 hover:text-fuchsia-300"
          >
            {slug}
          </Link>
        ))}
      </section>
    </div>
  );
}
