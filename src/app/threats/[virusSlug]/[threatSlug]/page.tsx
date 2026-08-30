import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TrajectoryLineChart } from "@/components/charts";
import { AnimatedNumber, Reveal } from "@/components/motion";
import { Badge, Card, InfoTip, RiskBar, SectionHeader, StatCard, TrendPill } from "@/components/ui";
import { env } from "@/lib/config";
import { formatCompactNumber, METRIC_COPY, TREND_COPY } from "@/lib/copy";
import { byAlpha2 } from "@/lib/iso-countries";
import { getRiskLevel } from "@/lib/map-scale";
import { slugify } from "@/lib/seo";
import { getDashboardSnapshot } from "@/server/dashboard-service";

type ThreatPageProps = {
  params: Promise<{ virusSlug: string; threatSlug: string }>;
};

function threatSlugFor(region: string, countryCode: string): string {
  return slugify(`${region}-${countryCode}`);
}

/**
 * Human-readable place name for a hotspot. For country-level records
 * `region` and `countryName` are the same string (e.g. both "India"), so
 * naively joining them would render "India, India" — only join when the
 * region is a distinct sub-national area.
 */
function formatPlaceName(threat: { locationLevel: string; admin1Name?: string; region: string; countryName: string }): string {
  if (threat.locationLevel === "admin1" && threat.admin1Name) {
    return `${threat.admin1Name}, ${threat.countryName}`;
  }
  if (threat.region && threat.region !== threat.countryName) {
    return `${threat.region}, ${threat.countryName}`;
  }
  return threat.countryName;
}

/** Country flag from its ISO alpha-2 code, via the regional indicator symbol pair. */
function flagEmoji(alpha2: string): string {
  const code = alpha2.toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "\u{1F310}";
  const points = [...code].map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...points);
}

export async function generateMetadata({ params }: ThreatPageProps): Promise<Metadata> {
  const { virusSlug, threatSlug } = await params;
  const snapshot = await getDashboardSnapshot();
  const threat = snapshot.hotspots.find(
    (item) => item.slug === virusSlug && threatSlugFor(item.region, item.countryCode) === threatSlug,
  );
  const placeName = threat ? formatPlaceName(threat) : threatSlug.replace(/-/g, " ");
  const title = threat ? `${threat.virus} in ${placeName}` : `${placeName} Threat Analysis`;
  const description = threat
    ? `Threat intelligence for ${threat.virus} in ${placeName}: case counts, trend, and outlook.`
    : `Threat intelligence for ${placeName} under ${virusSlug} monitoring.`;
  return {
    title,
    description,
    alternates: {
      canonical: `/threats/${virusSlug}/${threatSlug}`,
    },
    openGraph: {
      title,
      description,
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

  const flag = flagEmoji(threat.countryCode);
  const placeName = formatPlaceName(threat);
  const countryName = byAlpha2(threat.countryCode)?.name ?? threat.countryName;

  const statusLine = threat.trend
    ? TREND_COPY[threat.trend].sentence(threat.virus, placeName)
    : `${threat.virus} in ${placeName}: about ${formatCompactNumber(threat.activeCases)} people currently sick.`;

  const globalMaxActive = Math.max(1, ...snapshot.hotspots.map((item) => item.activeCases));
  const riskLevel = getRiskLevel(threat.activeCases, globalMaxActive);

  const virusSnapshot = snapshot.viruses.find((virus) => virus.slug === virusSlug);

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

      <Reveal>
        <Card className="p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-4xl leading-none" aria-hidden="true">
              {flag}
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">{placeName}</h1>
            <Badge variant="accent">{threat.virus}</Badge>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">{statusLine}</p>
        </Card>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label={METRIC_COPY.activeCases.label}
            infoTip={<InfoTip label="What are active cases?">{METRIC_COPY.activeCases.explainer}</InfoTip>}
            trend={threat.trend ? <TrendPill trend={threat.trend} /> : undefined}
          >
            <AnimatedNumber value={threat.activeCases} format="compact" />
          </StatCard>
          <StatCard
            label={METRIC_COPY.confirmedCases.label}
            infoTip={<InfoTip label="What are confirmed cases?">{METRIC_COPY.confirmedCases.explainer}</InfoTip>}
          >
            <AnimatedNumber value={threat.confirmedCases} format="compact" />
          </StatCard>
          <StatCard
            label={METRIC_COPY.deaths.label}
            infoTip={<InfoTip label="What does deaths mean?">{METRIC_COPY.deaths.explainer}</InfoTip>}
          >
            <AnimatedNumber value={threat.deaths} format="compact" />
          </StatCard>
          <StatCard
            label={METRIC_COPY.recovered.label}
            infoTip={<InfoTip label="What does recovered mean?">{METRIC_COPY.recovered.explainer}</InfoTip>}
          >
            <AnimatedNumber value={threat.recovered} format="compact" />
          </StatCard>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <Card className="space-y-3 p-5">
          <SectionHeader eyebrow="Threat intensity" title="Risk relative to global hotspots" />
          <RiskBar
            value={threat.activeCases}
            max={globalMaxActive}
            riskLevel={riskLevel}
            label={`${threat.virus} outbreak intensity in ${placeName} compared with the largest tracked hotspot worldwide`}
          />
          <p className="text-xs text-text-faint">
            {formatCompactNumber(threat.activeCases)} active cases here vs. {formatCompactNumber(globalMaxActive)} at
            the largest hotspot Virus Tracker currently follows.
          </p>
        </Card>
      </Reveal>

      {virusSnapshot && virusSnapshot.trajectory.length > 1 ? (
        <Reveal delay={0.15}>
          <Card className="p-5">
            <SectionHeader
              eyebrow="Outlook"
              title="Case trajectory"
              description={`Projected ${threat.virus} case trend, based on the current dataset.`}
            />
            <div className="mt-4">
              <TrajectoryLineChart
                points={virusSnapshot.trajectory}
                virusName={threat.virus}
                plainSummary={`${statusLine} Chart shows the projected case trajectory over time.`}
              />
            </div>
          </Card>
        </Reveal>
      ) : null}

      <Reveal delay={0.2}>
        <Card className="flex flex-wrap gap-2 p-5">
          <Link href={`/regions/${threat.countryCode.toLowerCase()}/${threat.slug}`}>
            <Badge variant="outline" className="transition-colors hover:border-border-accent hover:text-accent">
              {countryName} — {threat.virus} overview
            </Badge>
          </Link>
          <Link href={`/viruses/${threat.slug}`}>
            <Badge variant="outline" className="transition-colors hover:border-border-accent hover:text-accent">
              {threat.virus} guide
            </Badge>
          </Link>
          <Link href={`/map?virus=${threat.slug}&threat=${encodeURIComponent(`${threat.slug}:${threat.locationId}`)}`}>
            <Badge variant="outline" className="transition-colors hover:border-border-accent hover:text-accent">
              Open on map
            </Badge>
          </Link>
        </Card>
      </Reveal>
    </div>
  );
}
