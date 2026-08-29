import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RegionBarChart, TrajectoryLineChart } from "@/components/charts";
import { AnimatedNumber, Reveal } from "@/components/motion";
import { Badge, Button, Card, EmptyState, InfoTip, SectionHeader, StatCard, TrendPill } from "@/components/ui";
import { getVirusWiki, getVirusWikiFallback } from "@/data/virus-wiki";
import { formatCompactNumber, METRIC_COPY, TREND_COPY } from "@/lib/copy";
import { byAlpha2 } from "@/lib/iso-countries";
import { getVirusDef } from "@/lib/viruses";
import { getDashboardSnapshot } from "@/server/dashboard-service";

type RegionVirusPageProps = {
  params: Promise<{ countryCode: string; virusSlug: string }>;
};

/** Country flag from its ISO alpha-2 code, via the regional indicator symbol pair. */
function flagEmoji(alpha2: string): string {
  const code = alpha2.toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "\u{1F310}";
  const points = [...code].map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...points);
}

export async function generateMetadata({ params }: RegionVirusPageProps): Promise<Metadata> {
  const { countryCode, virusSlug } = await params;
  const countryName = byAlpha2(countryCode)?.name ?? countryCode.toUpperCase();
  const virusName = getVirusDef(virusSlug)?.name ?? virusSlug;
  return {
    title: `${virusName} in ${countryName}`,
    description: `${virusName} metrics and threat analysis for ${countryName}.`,
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

  const countryEntry = byAlpha2(code);
  const countryName = countryEntry?.name ?? rows[0]!.countryName;
  const flag = flagEmoji(code);
  const virusName = rows[0]!.virus;

  const totalActive = rows.reduce((sum, item) => sum + item.activeCases, 0);
  const totalConfirmed = rows.reduce((sum, item) => sum + item.confirmedCases, 0);
  const totalDeaths = rows.reduce((sum, item) => sum + item.deaths, 0);
  const totalRecovered = rows.reduce((sum, item) => sum + item.recovered, 0);

  const countryRow = rows.find((item) => item.locationLevel === "country");
  const trend = countryRow?.trend ?? rows.find((item) => item.trend)?.trend;

  const statusLine = trend
    ? TREND_COPY[trend].sentence(virusName, countryName)
    : `${virusName} in ${countryName}: about ${formatCompactNumber(totalActive)} people currently sick.`;

  const virusSnapshot = snapshot.viruses.find((virus) => virus.slug === virusSlug);

  const otherVirusSlugs = Array.from(
    new Set(
      snapshot.hotspots
        .filter((item) => item.countryCode.toUpperCase() === code && item.slug !== virusSlug)
        .map((item) => item.slug),
    ),
  );
  const otherViruses = otherVirusSlugs.map(
    (slug) => snapshot.hotspots.find((item) => item.countryCode.toUpperCase() === code && item.slug === slug)!,
  );

  const otherCountryTotals = new Map<string, number>();
  for (const item of snapshot.hotspots) {
    if (item.slug !== virusSlug || item.countryCode.toUpperCase() === code) continue;
    otherCountryTotals.set(item.countryName, (otherCountryTotals.get(item.countryName) ?? 0) + item.activeCases);
  }
  const otherCountriesData = Array.from(otherCountryTotals.entries()).map(([name, value]) => ({ name, value }));

  const wiki = getVirusWiki(virusSlug) ?? getVirusWikiFallback(virusName, virusSnapshot?.summary ?? "");

  return (
    <div className="space-y-6">
      <Reveal>
        <Card className="p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-4xl leading-none" aria-hidden="true">
              {flag}
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">{countryName}</h1>
            <Badge variant="accent">{virusName}</Badge>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">{statusLine}</p>
        </Card>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label={METRIC_COPY.activeCases.label}
            infoTip={<InfoTip label="What are active cases?">{METRIC_COPY.activeCases.explainer}</InfoTip>}
            trend={trend ? <TrendPill trend={trend} /> : undefined}
          >
            <AnimatedNumber value={totalActive} format="compact" />
          </StatCard>
          <StatCard
            label={METRIC_COPY.confirmedCases.label}
            infoTip={<InfoTip label="What are confirmed cases?">{METRIC_COPY.confirmedCases.explainer}</InfoTip>}
          >
            <AnimatedNumber value={totalConfirmed} format="compact" />
          </StatCard>
          <StatCard
            label={METRIC_COPY.deaths.label}
            infoTip={<InfoTip label="What does deaths mean?">{METRIC_COPY.deaths.explainer}</InfoTip>}
          >
            <AnimatedNumber value={totalDeaths} format="compact" />
          </StatCard>
          <StatCard
            label={METRIC_COPY.recovered.label}
            infoTip={<InfoTip label="What does recovered mean?">{METRIC_COPY.recovered.explainer}</InfoTip>}
          >
            <AnimatedNumber value={totalRecovered} format="compact" />
          </StatCard>
        </div>
      </Reveal>

      {virusSnapshot && virusSnapshot.trajectory.length > 1 ? (
        <Reveal delay={0.1}>
          <Card className="p-5">
            <SectionHeader
              eyebrow="Outlook"
              title="Case trajectory"
              description={`Projected ${virusName} case trend, based on the current dataset.`}
            />
            <div className="mt-4">
              <TrajectoryLineChart
                points={virusSnapshot.trajectory}
                virusName={virusName}
                plainSummary={`${statusLine} Chart shows the projected case trajectory over time.`}
              />
            </div>
          </Card>
        </Reveal>
      ) : null}

      <Reveal delay={0.15}>
        <Card className="space-y-3 p-5">
          <SectionHeader eyebrow="Regional context" title={`Other viruses tracked in ${countryName}`} />
          {otherViruses.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {otherViruses.map((item) => (
                <Link key={item.slug} href={`/regions/${countryCode.toLowerCase()}/${item.slug}`}>
                  <Badge variant="outline" className="transition-colors hover:border-border-accent hover:text-accent">
                    {item.virus}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nothing else tracked here"
              message={`${countryName} only has data for ${virusName} right now.`}
            />
          )}
        </Card>
      </Reveal>

      <Reveal delay={0.2}>
        <Card className="space-y-3 p-5">
          <SectionHeader eyebrow="Global comparison" title={`${virusName} in other countries`} />
          <RegionBarChart
            data={otherCountriesData}
            plainSummary={`Top countries by active ${virusName} cases, excluding ${countryName}.`}
            topN={8}
          />
        </Card>
      </Reveal>

      <Reveal delay={0.25}>
        <Card className="space-y-3 p-5">
          <SectionHeader eyebrow="Learn more" title={`About ${virusName}`} />
          <p className="text-sm leading-relaxed text-text-secondary">{wiki.lead}</p>
          <Button href={`/viruses/${virusSlug}`} variant="outline" size="sm">
            Read the full guide
          </Button>
        </Card>
      </Reveal>
    </div>
  );
}
