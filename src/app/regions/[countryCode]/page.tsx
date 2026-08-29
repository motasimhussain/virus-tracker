import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge, Card, EmptyState, InfoTip, RiskBar, SectionHeader, Sparkline, StatCard, TrendPill } from "@/components/ui";
import { AnimatedNumber, Reveal } from "@/components/motion";
import { env } from "@/lib/config";
import { formatCompactNumber, METRIC_COPY } from "@/lib/copy";
import { byAlpha2 } from "@/lib/iso-countries";
import { getRiskLevel } from "@/lib/map-scale";
import type { Trend } from "@/lib/types";
import { getDashboardSnapshot } from "@/server/dashboard-service";

type RegionPageProps = {
  params: Promise<{ countryCode: string }>;
};

type VirusGroup = {
  slug: string;
  name: string;
  activeCases: number;
  confirmedCases: number;
  deaths: number;
  trend?: Trend;
  trajectory: number[];
};

/** Country flag from its ISO alpha-2 code, via the regional indicator symbol pair. */
function flagEmoji(alpha2: string): string {
  const code = alpha2.toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "\u{1F310}";
  const points = [...code].map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...points);
}

function sparklineToken(trend?: Trend): string {
  if (trend === "rising") return "trend-rising";
  if (trend === "falling") return "trend-falling";
  return "accent";
}

export async function generateMetadata({ params }: RegionPageProps): Promise<Metadata> {
  const { countryCode } = await params;
  const countryName = byAlpha2(countryCode)?.name ?? countryCode.toUpperCase();
  return {
    title: `${countryName} Threat Dashboard`,
    description: `Country-level emerging threat and virus monitoring for ${countryName}.`,
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

  const countryEntry = byAlpha2(code);
  // A code we don't recognize at all (bad ISO alpha-2, no tracked rows) is a genuine 404.
  // A recognized country that simply has no tracked data yet gets a friendly empty state instead.
  if (regions.length === 0 && !countryEntry) return notFound();

  const countryName = countryEntry?.name ?? regions[0]?.countryName ?? code;
  const flag = flagEmoji(code);

  const virusSlugs = Array.from(new Set(regions.map((item) => item.slug)));
  const totalSick = regions.reduce((sum, item) => sum + item.activeCases, 0);

  const groups: VirusGroup[] = virusSlugs
    .map((slug) => {
      const rows = regions.filter((item) => item.slug === slug);
      const countryRow = rows.find((item) => item.locationLevel === "country");
      const trend = countryRow?.trend ?? rows.find((item) => item.trend)?.trend;
      const virusSnapshot = snapshot.viruses.find((virus) => virus.slug === slug);
      return {
        slug,
        name: rows[0]!.virus,
        activeCases: rows.reduce((sum, item) => sum + item.activeCases, 0),
        confirmedCases: rows.reduce((sum, item) => sum + item.confirmedCases, 0),
        deaths: rows.reduce((sum, item) => sum + item.deaths, 0),
        trend,
        trajectory: virusSnapshot?.trajectory.map((point) => point.projectedCases) ?? [],
      };
    })
    .sort((a, b) => b.activeCases - a.activeCases);

  const countryMaxActive = Math.max(1, ...groups.map((group) => group.activeCases));

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

      <Reveal>
        <Card className="p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-4xl leading-none" aria-hidden="true">
              {flag}
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">{countryName}</h1>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            We&apos;re tracking {groups.length} virus{groups.length === 1 ? "" : "es"} in {countryName}. About{" "}
            {formatCompactNumber(totalSick)} people are currently sick.
          </p>
        </Card>
      </Reveal>

      {groups.length === 0 ? (
        <Reveal delay={0.05}>
          <EmptyState title="No data yet" message="We don't have tracked data for this country yet." />
        </Reveal>
      ) : (
        <div className="space-y-6">
          {groups.map((group, index) => (
            <Reveal key={group.slug} delay={Math.min(index * 0.06, 0.3)}>
              <Card className="space-y-4 p-5">
                <SectionHeader
                  eyebrow="Tracked virus"
                  title={group.name}
                  action={
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/viruses/${group.slug}`}
                        className="rounded-md border border-border-default px-3 py-1 text-xs text-text-secondary transition-colors hover:border-border-accent hover:text-accent"
                      >
                        Virus guide
                      </Link>
                      <Link
                        href={`/regions/${countryCode.toLowerCase()}/${group.slug}`}
                        className="rounded-md border border-border-default px-3 py-1 text-xs text-text-secondary transition-colors hover:border-border-accent hover:text-accent"
                      >
                        Full details
                      </Link>
                    </div>
                  }
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <StatCard
                    label={METRIC_COPY.activeCases.label}
                    infoTip={<InfoTip label="What are active cases?">{METRIC_COPY.activeCases.explainer}</InfoTip>}
                    trend={group.trend ? <TrendPill trend={group.trend} /> : undefined}
                  >
                    <AnimatedNumber value={group.activeCases} format="compact" />
                  </StatCard>
                  <StatCard
                    label={METRIC_COPY.confirmedCases.label}
                    infoTip={<InfoTip label="What are confirmed cases?">{METRIC_COPY.confirmedCases.explainer}</InfoTip>}
                  >
                    <AnimatedNumber value={group.confirmedCases} format="compact" />
                  </StatCard>
                  <StatCard
                    label={METRIC_COPY.deaths.label}
                    infoTip={<InfoTip label="What does deaths mean?">{METRIC_COPY.deaths.explainer}</InfoTip>}
                  >
                    <AnimatedNumber value={group.deaths} format="compact" />
                  </StatCard>
                </div>

                {group.trajectory.length > 1 ? (
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-text-muted">Case trend</p>
                    <Sparkline values={group.trajectory} strokeToken={sparklineToken(group.trend)} filled />
                  </div>
                ) : null}

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>Outbreak intensity in {countryName}</span>
                    <Badge variant="risk" riskLevel={getRiskLevel(group.activeCases, countryMaxActive)}>
                      {formatCompactNumber(group.activeCases)}
                    </Badge>
                  </div>
                  <RiskBar
                    value={group.activeCases}
                    max={countryMaxActive}
                    riskLevel={getRiskLevel(group.activeCases, countryMaxActive)}
                    label={`${group.name} outbreak intensity relative to the worst-affected virus in ${countryName}`}
                  />
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
