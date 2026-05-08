import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getDashboardSnapshot } from "@/server/dashboard-service";

type RegionVirusPageProps = {
  params: Promise<{ countryCode: string; virusSlug: string }>;
};

export async function generateMetadata({ params }: RegionVirusPageProps): Promise<Metadata> {
  const { countryCode, virusSlug } = await params;
  return {
    title: `${virusSlug} in ${countryCode.toUpperCase()}`,
    description: `${virusSlug} metrics and threat analysis for ${countryCode.toUpperCase()}.`,
    alternates: {
      canonical: `/regions/${countryCode.toLowerCase()}/${virusSlug}`,
    },
  };
}

export default async function RegionVirusPage({ params }: RegionVirusPageProps) {
  const { countryCode, virusSlug } = await params;
  const code = countryCode.toUpperCase();
  const snapshot = await getDashboardSnapshot();
  const rows = snapshot.hotspots.filter(
    (item) => item.countryCode.toUpperCase() === code && item.slug === virusSlug,
  );
  if (rows.length === 0) return notFound();

  const totalActive = rows.reduce((sum, item) => sum + item.activeCases, 0);
  const totalDeaths = rows.reduce((sum, item) => sum + item.deaths, 0);
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-5">
        <h1 className="text-2xl font-bold text-cyan-100">
          {rows[0]!.virus} in {rows[0]!.countryName}
        </h1>
        <p className="mt-2 text-sm text-cyan-100/75">
          {totalActive.toLocaleString()} active cases and {totalDeaths.toLocaleString()} deaths.
        </p>
      </section>
      <section className="grid gap-2 rounded-xl border border-cyan-500/25 bg-slate-900/70 p-5 text-sm text-cyan-100/80">
        {rows.map((item) => (
          <div key={item.locationId} className="flex justify-between border-b border-cyan-700/20 py-2">
            <span>
              {item.locationLevel === "admin1" && item.admin1Name
                ? `${item.admin1Name}, ${item.countryName}`
                : item.region}
            </span>
            <span>{item.activeCases.toLocaleString()} active</span>
          </div>
        ))}
      </section>
      <Link
        href={`/map?virus=${virusSlug}`}
        className="inline-block rounded-md border border-cyan-400/35 px-3 py-1 text-xs text-cyan-200 hover:text-fuchsia-300"
      >
        Open on map
      </Link>
    </div>
  );
}
