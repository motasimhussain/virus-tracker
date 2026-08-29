import type { Metadata } from "next";

import { AdSlot } from "@/components/ads/AdSlot";
import { HeatList } from "@/components/dashboard/HeatList";
import { HeroStatus } from "@/components/dashboard/HeroStatus";
import { NewsFeed } from "@/components/dashboard/NewsFeed";
import { SeverityByRegionPanel } from "@/components/dashboard/SeverityByRegionPanel";
import { SourceReliabilityPanel } from "@/components/dashboard/SourceReliabilityPanel";
import { TopThreatCards } from "@/components/dashboard/TopThreatCards";
import { ThreatMatrixPanel } from "@/components/dashboard/ThreatMatrixPanel";
import { ThreatFilters } from "@/components/dashboard/ThreatFilters";
import { TrajectoryChart } from "@/components/dashboard/TrajectoryChart";
import { AnimatedNumber, Reveal } from "@/components/motion";
import { Button, InfoTip, SectionHeader, StatCard } from "@/components/ui";
import { env } from "@/lib/config";
import { METRIC_COPY } from "@/lib/copy";
import { slugify } from "@/lib/seo";
import { getDashboardSnapshot, getFilteredDashboardView } from "@/server/dashboard-service";

export const revalidate = 1800;

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

  // Hero stats reflect the full, unfiltered snapshot — the filtered metrics
  // below respond to the virus/threat query params instead.
  const countryCount = new Set(snapshot.hotspots.map((item) => item.countryCode)).size;
  const snapshotActiveTotal = snapshot.hotspots.reduce((sum, item) => sum + item.activeCases, 0);

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
    <div className="space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />

      <HeroStatus
        virusCount={snapshot.viruses.length}
        countryCount={countryCount}
        activeTotal={snapshotActiveTotal}
        generatedAt={snapshot.generatedAt}
      />

      <Reveal as="section" className="space-y-4">
        <SectionHeader
          eyebrow="Snapshot"
          title="Today's numbers"
          description="A quick read on how big this outbreak picture is right now, for your current filter."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label={METRIC_COPY.trackedViruses.label}
            infoTip={<InfoTip label="What does tracked viruses mean?">{METRIC_COPY.trackedViruses.explainer}</InfoTip>}
            hint={METRIC_COPY.trackedViruses.plain(snapshot.viruses.length)}
          >
            <AnimatedNumber value={snapshot.viruses.length} className="tabular-nums" />
          </StatCard>
          <StatCard
            label={METRIC_COPY.activeCases.label}
            infoTip={<InfoTip label="What does active cases mean?">{METRIC_COPY.activeCases.explainer}</InfoTip>}
            hint={METRIC_COPY.activeCases.plain(totalActive)}
          >
            <AnimatedNumber value={totalActive} format="compact" className="tabular-nums" />
          </StatCard>
          <StatCard
            label={METRIC_COPY.deaths.label}
            infoTip={<InfoTip label="What does deaths mean?">{METRIC_COPY.deaths.explainer}</InfoTip>}
            hint={METRIC_COPY.deaths.plain(totalDeaths)}
          >
            <AnimatedNumber value={totalDeaths} format="compact" className="tabular-nums" />
          </StatCard>
          <StatCard
            label="Top threat right now"
            infoTip={<InfoTip label="How is the top threat picked?">{METRIC_COPY.growthRate.explainer}</InfoTip>}
            hint={leadVirus ? METRIC_COPY.growthRate.plain(leadVirus.latestGrowthRate) : "No data available yet."}
          >
            {leadVirus?.name ?? "N/A"}
          </StatCard>
        </div>
      </Reveal>

      <Reveal as="section" delay={0.05} className="space-y-4">
        <SectionHeader
          title="Where attention is needed most"
          description="The hotspots combining the highest case counts with the fastest growth, worth a closer look first."
        />
        <TopThreatCards threats={filteredView.topThreats} maxCards={6} />
      </Reveal>

      <Reveal as="section" delay={0.1} className="space-y-4">
        <SectionHeader
          title="Jump to a threat"
          description="Pick a hotspot below to see its full profile — cases, trend, and sources, in one place."
        />
        <div className="flex flex-wrap gap-2">
          {filteredView.topThreats.slice(0, 6).map((threat) => (
            <Button
              key={`landing-${threat.key}`}
              href={`/threats/${threat.virusSlug}/${slugify(`${threat.region}-${threat.countryCode}`)}`}
              variant="outline"
              size="sm"
            >
              {threat.label}
            </Button>
          ))}
        </div>
      </Reveal>

      <AdSlot placement="top-banner" slotName="Top Banner 970x90" className="w-full" />

      <Reveal as="section" delay={0.15} className="space-y-4">
        <SectionHeader
          title="Filter the dashboard"
          description="Narrow every chart below to a single virus or hotspot."
        />
        <ThreatFilters
          virusOptions={filteredView.virusOptions}
          topThreats={filteredView.topThreats}
          selectedVirusSlug={filteredView.selectedVirusSlug}
          selectedThreatKey={filteredView.selectedThreatKey}
        />
      </Reveal>

      <Reveal as="section" delay={0.2} className="space-y-4">
        <SectionHeader
          title="How this threat is behaving"
          description="Severity, spread, and how much we trust the numbers, for your current filter."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label={METRIC_COPY.cfr.label}
            infoTip={<InfoTip label="What does how deadly mean?">{METRIC_COPY.cfr.explainer}</InfoTip>}
            hint={METRIC_COPY.cfr.plain(filteredView.threatMetricsSummary.caseFatalityRatio)}
          >
            {filteredView.threatMetricsSummary.caseFatalityRatio.toFixed(2)}%
          </StatCard>
          <StatCard
            label={METRIC_COPY.pressure.label}
            infoTip={<InfoTip label="What does outbreak activity mean?">{METRIC_COPY.pressure.explainer}</InfoTip>}
            hint={METRIC_COPY.pressure.plain(filteredView.threatMetricsSummary.pressureIndex)}
          >
            {filteredView.threatMetricsSummary.pressureIndex.toFixed(4)}
          </StatCard>
          <StatCard
            label={METRIC_COPY.recoveryRatio.label}
            infoTip={<InfoTip label="What does recovery rate mean?">{METRIC_COPY.recoveryRatio.explainer}</InfoTip>}
            hint={METRIC_COPY.recoveryRatio.plain(filteredView.threatMetricsSummary.recoveryRatio)}
          >
            {filteredView.threatMetricsSummary.recoveryRatio.toFixed(2)}%
          </StatCard>
          <StatCard
            label={METRIC_COPY.confidence.label}
            infoTip={<InfoTip label="What does data reliability mean?">{METRIC_COPY.confidence.explainer}</InfoTip>}
            hint={`${METRIC_COPY.confidence.technical}: ${filteredView.threatMetricsSummary.confidenceAdjustedExposure.toLocaleString()}`}
          >
            <AnimatedNumber
              value={filteredView.threatMetricsSummary.confidenceAdjustedExposure}
              format="compact"
              className="tabular-nums"
            />
          </StatCard>
          <StatCard
            label={METRIC_COPY.staleness.label}
            infoTip={<InfoTip label="What does outdated data areas mean?">{METRIC_COPY.staleness.explainer}</InfoTip>}
            hint={METRIC_COPY.staleness.plain(filteredView.threatMetricsSummary.staleDataZones)}
          >
            {filteredView.threatMetricsSummary.staleDataZones}
          </StatCard>
        </div>
      </Reveal>

      <Reveal as="section" delay={0.25} className="space-y-4">
        <SectionHeader
          title="Severity vs. confidence"
          description="How dangerous each hotspot looks, plotted against how much we trust the data behind it."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ThreatMatrixPanel points={filteredView.threatMatrixPoints} />
          </div>
          <SourceReliabilityPanel summary={filteredView.sourceReliabilitySummary} />
        </div>
      </Reveal>

      <Reveal as="section" delay={0.3} className="space-y-4">
        <SectionHeader
          title="Severity by region"
          description="Which regions carry the heaviest overall threat level right now."
        />
        <SeverityByRegionPanel buckets={filteredView.severityByRegion} />
      </Reveal>

      <Reveal as="section" delay={0.35} className="space-y-4">
        <SectionHeader
          title="Trajectory and hotspots"
          description="Where the leading threat is headed next, and the places seeing the most active cases today."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TrajectoryChart points={leadVirus?.trajectory ?? []} />
          </div>
          <HeatList items={filteredView.filteredHotspots.slice(0, 20)} />
        </div>
      </Reveal>

      <section className="space-y-4">
        <SectionHeader title="Latest news" description="Recent coverage from public health sources, as it comes in." />
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <Reveal delay={0.4}>
            <NewsFeed items={snapshot.news.slice(0, 20)} />
          </Reveal>
          <div className="space-y-4">
            <AdSlot placement="sidebar" slotName="Sidebar Rail 300x600" />
            <AdSlot placement="in-feed" slotName="In-Feed 336x280" />
          </div>
        </div>
      </section>
    </div>
  );
}
