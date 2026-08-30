import type { Metadata } from "next";
import Link from "next/link";

import { ThreatFilters } from "@/components/dashboard/ThreatFilters";
import { WorldHeatMap } from "@/components/map/WorldHeatMap";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { RiskBar } from "@/components/ui/RiskBar";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TrendPill } from "@/components/ui/TrendPill";
import { env } from "@/lib/config";
import { formatCompactNumber } from "@/lib/copy";
import { getRiskLevel } from "@/lib/map-scale";
import { getDashboardSnapshot, getFilteredDashboardView } from "@/server/dashboard-service";

export const revalidate = 1800;

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

  const hotspots = filteredView.filteredHotspots;
  const maxActiveCases = hotspots.length > 0 ? Math.max(...hotspots.map((item) => item.activeCases), 0) : 0;

  return (
    <div className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }} />

      <SectionHeader
        eyebrow="Live data"
        title="Global heat map"
        description="See where people are currently sick around the world. Darker countries have more active cases — hover or tap any country for the numbers, or click through for a full regional breakdown."
      />

      <ThreatFilters
        virusOptions={filteredView.virusOptions}
        topThreats={filteredView.topThreats}
        selectedVirusSlug={filteredView.selectedVirusSlug}
        selectedThreatKey={filteredView.selectedThreatKey}
      />

      {/* Full-bleed breakout so the map centerpiece renders larger than the page's max-w-7xl gutter. */}
      <div className="relative left-1/2 w-screen -translate-x-1/2 px-6">
        <div className="mx-auto max-w-[1600px]">
          <WorldHeatMap items={hotspots} />
        </div>
      </div>

      <SectionHeader title="Hotspot feed" description="Every tracked location behind the map above, ranked by active cases." />

      {hotspots.length === 0 ? (
        <EmptyState
          title="No hotspots match these filters"
          message="Try a different virus or threat filter to see tracked locations here."
          actionLabel="Clear filters"
          actionHref="/map"
        />
      ) : (
        <div className="space-y-2">
          {hotspots.map((item) => {
            const label =
              item.locationLevel === "admin1" && item.admin1Name
                ? `${item.admin1Name}, ${item.countryName}`
                : `${item.region} (${item.countryCode})`;
            const riskLevel = getRiskLevel(item.activeCases, maxActiveCases);

            return (
              <Card key={`${item.slug}-${item.countryCode}-${item.region}`} padding="sm" className="flex flex-wrap items-center gap-4">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/regions/${item.countryCode.toLowerCase()}`}
                    className="text-sm font-semibold text-text-primary hover:text-accent"
                  >
                    {label}
                  </Link>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {item.virus} · {formatCompactNumber(item.activeCases)} people currently sick
                  </p>
                </div>

                <div className="w-32 shrink-0">
                  <RiskBar value={item.activeCases} max={maxActiveCases} riskLevel={riskLevel} label={`${label} outbreak intensity`} />
                </div>

                {item.trend ? <TrendPill trend={item.trend} /> : null}

                <span className="shrink-0 font-mono text-xs text-text-faint">
                  {item.latitude.toFixed(2)}, {item.longitude.toFixed(2)}
                </span>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
