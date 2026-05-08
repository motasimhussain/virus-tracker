import type { Metadata } from "next";

import { ThreatFilters } from "@/components/dashboard/ThreatFilters";
import { HeatList } from "@/components/dashboard/HeatList";
import { WorldHeatMap } from "@/components/map/WorldHeatMap";
import { env } from "@/lib/config";
import { getDashboardSnapshot, getFilteredDashboardView } from "@/server/dashboard-service";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Global Heat Map",
  description:
    "Track global and regional outbreak intensity with a live emerging-threat heat map and selectable virus filters.",
  alternates: {
    canonical: "/map",
  },
};

type MapPageProps = {
  searchParams: Promise<{ virus?: string | string[]; threat?: string | string[] }>;
};

function getSingleParam(value: string | string[] | undefined): string | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export default async function MapPage({ searchParams }: MapPageProps) {
  const query = await searchParams;
  const snapshot = await getDashboardSnapshot();
  const filteredView = getFilteredDashboardView(
    snapshot,
    getSingleParam(query.virus),
    getSingleParam(query.threat),
  );
  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Global Emerging Threat Heat Map Dataset",
    description:
      "Continuously updated outbreak intensity dataset used to render the Virus Tracker global heat map.",
    url: `${env.APP_URL}/map`,
    creator: {
      "@type": "Organization",
      name: "Virus Tracker",
    },
    variableMeasured: ["activeCases", "deaths", "recovered", "sourceConfidence", "locationLevel"],
  };

  return (
    <div className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }} />
      <section className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-5">
        <h1 className="text-2xl font-bold text-cyan-100">Global Heat Map</h1>
        <p className="mt-2 text-sm text-cyan-100/70">
          Region intensity derived from active case density across a world SVG heat surface.
        </p>
      </section>

      <ThreatFilters
        virusOptions={filteredView.virusOptions}
        topThreats={filteredView.topThreats}
        selectedVirusSlug={filteredView.selectedVirusSlug}
        selectedThreatKey={filteredView.selectedThreatKey}
      />

      <WorldHeatMap items={filteredView.filteredHotspots} />

      <div className="grid gap-4 lg:grid-cols-2">
        <HeatList items={filteredView.filteredHotspots} />
        <div className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-4">
          <h3 className="text-sm uppercase tracking-[0.2em] text-cyan-300">Coordinates Feed</h3>
          <div className="mt-4 max-h-[480px] space-y-2 overflow-auto text-sm">
            {filteredView.filteredHotspots.map((item) => (
              <div key={`${item.slug}-${item.countryCode}-${item.region}`} className="flex justify-between border-b border-cyan-700/20 py-2 text-cyan-100/80">
                <span>
                  {item.locationLevel === "admin1" && item.admin1Name
                    ? `${item.admin1Name}, ${item.countryName}`
                    : `${item.region} (${item.countryCode})`}
                </span>
                <span className="font-mono text-xs">
                  {item.latitude.toFixed(2)}, {item.longitude.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
