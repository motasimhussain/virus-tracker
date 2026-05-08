import type { Metadata } from "next";
import Link from "next/link";

import { AdSlot } from "@/components/ads/AdSlot";
import { HeatList } from "@/components/dashboard/HeatList";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { NewsFeed } from "@/components/dashboard/NewsFeed";
import { SeverityByRegionPanel } from "@/components/dashboard/SeverityByRegionPanel";
import { SourceReliabilityPanel } from "@/components/dashboard/SourceReliabilityPanel";
import { TopThreatCards } from "@/components/dashboard/TopThreatCards";
import { ThreatMatrixPanel } from "@/components/dashboard/ThreatMatrixPanel";
import { ThreatFilters } from "@/components/dashboard/ThreatFilters";
import { TrajectoryChart } from "@/components/dashboard/TrajectoryChart";
import { env } from "@/lib/config";
import { slugify } from "@/lib/seo";
import { getDashboardSnapshot, getFilteredDashboardView } from "@/server/dashboard-service";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Global Emerging Threat Dashboard",
  description:
    "Monitor emerging viruses and threats worldwide with live severity metrics, confidence signals, and outbreak trajectory intelligence.",
  alternates: {
    canonical: "/",
  },
};

type HomePageProps = {
  searchParams: Promise<{ virus?: string | string[]; threat?: string | string[] }>;
};

function getSingleParam(value: string | string[] | undefined): string | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export default async function Home({ searchParams }: HomePageProps) {
  const query = await searchParams;
  const snapshot = await getDashboardSnapshot();
  const filteredView = getFilteredDashboardView(
    snapshot,
    getSingleParam(query.virus),
    getSingleParam(query.threat),
  );
  const totalActive = filteredView.filteredHotspots.reduce((sum, item) => sum + item.activeCases, 0);
  const totalDeaths = filteredView.filteredHotspots.reduce((sum, item) => sum + item.deaths, 0);
  const leadVirus = filteredView.leadVirus;
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Virus Tracker",
    url: env.APP_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${env.APP_URL}/news?query={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Virus Tracker",
    url: env.APP_URL,
    description: "Global emerging threat intelligence platform for virus spread and severity tracking.",
  };

  return (
    <div className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <section className="rounded-2xl border border-cyan-400/20 bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.2),_rgba(2,6,23,1))] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Global Outbreak Intelligence</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-cyan-50">Virus Tracker Command Center</h1>
            <p className="mt-2 text-sm text-cyan-100/80">
              Realtime disease monitoring, spread analysis, and forecast trajectory signals.
            </p>
          </div>
          <Link href="/map" className="rounded-lg border border-cyan-300/40 px-4 py-2 text-sm text-cyan-200 hover:text-fuchsia-300">
            Open Heat Map
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Tracked Viruses" value={String(snapshot.viruses.length)} hint={`Updated ${new Date(snapshot.generatedAt).toLocaleTimeString()}`} />
        <MetricCard label="Active Cases (Filtered)" value={totalActive.toLocaleString()} />
        <MetricCard label="Reported Deaths (Filtered)" value={totalDeaths.toLocaleString()} />
        <MetricCard label="Lead Threat" value={leadVirus?.name ?? "N/A"} hint={`${leadVirus?.latestGrowthRate ?? 0}% pressure index`} />
      </section>

      <TopThreatCards threats={filteredView.topThreats} maxCards={6} />

      <section className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-4">
        <h3 className="text-sm uppercase tracking-[0.2em] text-cyan-300">Threat Landing Pages</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {filteredView.topThreats.slice(0, 6).map((threat) => (
            <Link
              key={`landing-${threat.key}`}
              href={`/threats/${threat.virusSlug}/${slugify(`${threat.region}-${threat.countryCode}`)}`}
              className="rounded-md border border-cyan-400/35 px-2 py-1 text-xs text-cyan-200 hover:text-fuchsia-300"
            >
              {threat.label}
            </Link>
          ))}
        </div>
      </section>

      <AdSlot slotName="Top Banner 970x90" className="w-full" />

      <ThreatFilters
        virusOptions={filteredView.virusOptions}
        topThreats={filteredView.topThreats}
        selectedVirusSlug={filteredView.selectedVirusSlug}
        selectedThreatKey={filteredView.selectedThreatKey}
      />

      <section className="grid gap-4 md:grid-cols-5">
        <MetricCard label="CFR" value={`${filteredView.threatMetricsSummary.caseFatalityRatio.toFixed(2)}%`} />
        <MetricCard label="Pressure" value={filteredView.threatMetricsSummary.pressureIndex.toFixed(4)} />
        <MetricCard label="Recovery" value={`${filteredView.threatMetricsSummary.recoveryRatio.toFixed(2)}%`} />
        <MetricCard
          label="Confidence Exposure"
          value={filteredView.threatMetricsSummary.confidenceAdjustedExposure.toLocaleString()}
        />
        <MetricCard label="Stale Zones" value={filteredView.threatMetricsSummary.staleDataZones.toString()} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ThreatMatrixPanel points={filteredView.threatMatrixPoints} />
        </div>
        <SourceReliabilityPanel summary={filteredView.sourceReliabilitySummary} />
      </section>

      <SeverityByRegionPanel buckets={filteredView.severityByRegion} />

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrajectoryChart points={leadVirus?.trajectory ?? []} />
        </div>
        <HeatList items={filteredView.filteredHotspots.slice(0, 20)} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <NewsFeed items={snapshot.news.slice(0, 20)} />
        <div className="space-y-4">
          <AdSlot slotName="Sidebar Rail 300x600" />
          <AdSlot slotName="In-Feed 336x280" />
        </div>
      </section>
    </div>
  );
}
