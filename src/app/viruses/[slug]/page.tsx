import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ChevronDown, MapPin, Share2, Syringe, type LucideIcon } from "lucide-react";

import { AdSlot } from "@/components/ads/AdSlot";
import { SeverityByRegionPanel } from "@/components/dashboard/SeverityByRegionPanel";
import { SourceReliabilityPanel } from "@/components/dashboard/SourceReliabilityPanel";
import { ThreatMatrixPanel } from "@/components/dashboard/ThreatMatrixPanel";
import { WorldHeatMap } from "@/components/map/WorldHeatMap";
import { VirusRegionalBarChart } from "@/components/virus/VirusRegionalBarChart";
import { TrajectoryLineChart } from "@/components/charts";
import { AnimatedNumber, Reveal } from "@/components/motion";
import { Badge, Card, EmptyState, InfoTip, SectionHeader, StatCard, TrendPill } from "@/components/ui";
import { getVirusWiki, getVirusWikiFallback } from "@/data/virus-wiki";
import { env } from "@/lib/config";
import { COVERAGE_COPY, METRIC_COPY } from "@/lib/copy";
import { slugify } from "@/lib/seo";
import type { RegionMetric, Trend } from "@/lib/types";
import { getVirusDef, isVirusSlug, VIRUSES, type VirusCategory } from "@/lib/viruses";
import { getDashboardSnapshot, getFilteredDashboardView } from "@/server/dashboard-service";

type VirusDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 1800;

const CATEGORY_LABELS: Record<VirusCategory, string> = {
  respiratory: "Respiratory",
  "vector-borne": "Vector-borne",
  zoonotic: "Zoonotic",
  waterborne: "Waterborne",
  hemorrhagic: "Hemorrhagic",
  other: "Other",
};

const SECTION_NAV: Array<{ href: string; label: string }> = [
  { href: "#overview", label: "Overview" },
  { href: "#transmission", label: "Transmission" },
  { href: "#symptoms", label: "Symptoms" },
  { href: "#prevention", label: "Prevention" },
  { href: "#surveillance", label: "Surveillance" },
  { href: "#data", label: "Data" },
  { href: "#faq", label: "FAQ" },
];

/** Distills a prose block down to its first sentence, for compact "at a glance" facts. */
function firstSentence(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^.*?[.!?](?=\s|$)/);
  return match ? match[0].trim() : trimmed;
}

function regionDisplayName(region: RegionMetric): string {
  if (region.locationLevel === "admin1" && region.admin1Name) {
    return `${region.admin1Name}, ${region.countryName}`;
  }
  return `${region.region} (${region.countryCode})`;
}

function growthTrend(growthRate: number): Trend {
  if (growthRate > 0.5) return "rising";
  if (growthRate < -0.5) return "falling";
  return "stable";
}

export async function generateMetadata({ params }: VirusDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isVirusSlug(slug)) {
    return {
      title: "Virus not found",
      alternates: { canonical: `/viruses/${slug}` },
    };
  }

  const virusDef = getVirusDef(slug);
  const wiki = getVirusWiki(slug);
  const snapshot = await getDashboardSnapshot();
  const virus = snapshot.viruses.find((entry) => entry.slug === slug) ?? null;

  const displayName = virus?.name ?? virusDef?.name ?? slug;
  const totalActive = virus ? virus.metrics.reduce((sum, metric) => sum + metric.activeCases, 0) : 0;
  const metaDescription = wiki
    ? virus
      ? `${wiki.lead} Dataset: ${virus.metrics.length} regions, ${totalActive.toLocaleString()} active cases (monitoring snapshot). Updated ${new Date(snapshot.generatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}.`
      : `${wiki.lead} Live regional tracking for ${displayName} is not available yet on Virus Tracker.`
    : virus
      ? `${virus.summary} Tracking ${virus.metrics.length} regions and ${totalActive.toLocaleString()} active cases. Emerging threat wiki and analytics.`
      : `${displayName}: outbreak wiki and surveillance context on Virus Tracker.`;

  const title = `${displayName} Wiki | Outbreak Intelligence & Heat Map`;

  return {
    title,
    description: metaDescription,
    alternates: {
      canonical: `/viruses/${slug}`,
    },
    openGraph: {
      title,
      description: metaDescription,
      url: `${env.APP_URL}/viruses/${slug}`,
      type: "article",
      siteName: "Virus Tracker",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: metaDescription,
    },
  };
}

function threatPath(virusSlug: string, region: string, countryCode: string): string {
  return `/threats/${virusSlug}/${slugify(`${region}-${countryCode}`)}`;
}

export default async function VirusDetailsPage({ params }: VirusDetailsPageProps) {
  const { slug } = await params;
  // Existence is gated on the canonical registry/wiki, not on live snapshot data,
  // so a virus with wiki content but no ingested metrics still renders (see T0.3).
  if (!isVirusSlug(slug)) return notFound();

  const virusDef = getVirusDef(slug)!;
  const snapshot = await getDashboardSnapshot();
  const virus = snapshot.viruses.find((entry) => entry.slug === slug) ?? null;
  const hasLiveMetrics = virus !== null;

  const displayName = virus?.name ?? virusDef.name;
  const wiki = getVirusWiki(slug) ?? getVirusWikiFallback(displayName, virus?.summary ?? "");
  const filteredView = virus ? getFilteredDashboardView(snapshot, virus.slug, null) : null;

  const totalActive = virus ? virus.metrics.reduce((sum, metric) => sum + metric.activeCases, 0) : 0;
  const totalDeaths = virus ? virus.metrics.reduce((sum, metric) => sum + metric.deaths, 0) : 0;
  const totalConfirmed = virus ? virus.metrics.reduce((sum, metric) => sum + metric.confirmedCases, 0) : 0;
  const topRegions = virus ? [...virus.metrics].sort((a, b) => b.activeCases - a.activeCases).slice(0, 12) : [];
  const topRegion = topRegions[0];
  const hasTrendColumn = topRegions.some((region) => Boolean(region.trend));

  const coverage = COVERAGE_COPY[virusDef.hasLiveData ? "live" : "curated"];

  // "At a glance" facts: short, plain-English distillations of the wiki prose
  // and (when available) the live dataset, so a reader gets the gist before
  // scrolling into the full sections below.
  const spreadFact = firstSentence(wiki.transmission);
  const howSeriousFact =
    hasLiveMetrics && totalConfirmed > 0
      ? METRIC_COPY.cfr.plain((totalDeaths / totalConfirmed) * 100)
      : firstSentence(wiki.symptoms);
  const whereActiveFact =
    hasLiveMetrics && topRegions.length > 0
      ? `Highest current burden: ${topRegions.slice(0, 2).map(regionDisplayName).join(" and ")}.`
      : "Live regional data isn't available yet — see Surveillance context below.";
  const preventionFact = firstSentence(wiki.prevention);

  const atAGlanceFacts: Array<{ icon: LucideIcon; label: string; value: string }> = [
    { icon: Share2, label: "How it spreads", value: spreadFact },
    { icon: AlertTriangle, label: "How serious", value: howSeriousFact },
    { icon: MapPin, label: "Where it's active", value: whereActiveFact },
    { icon: Syringe, label: "Vaccine / treatment", value: preventionFact },
  ];

  const relatedViruses = VIRUSES.filter((entry) => entry.slug !== slug)
    .sort((a, b) => {
      const aSame = a.category === virusDef.category ? 0 : 1;
      const bSame = b.category === virusDef.category ? 0 : 1;
      if (aSame !== bSame) return aSame - bSame;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 6);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: env.APP_URL },
      { "@type": "ListItem", position: 2, name: "Viruses", item: `${env.APP_URL}/` },
      { "@type": "ListItem", position: 3, name: `${displayName} Wiki`, item: `${env.APP_URL}/viruses/${slug}` },
    ],
  };

  const articleDescription =
    wiki.lead.length > 160 ? `${wiki.lead.slice(0, 157)}…` : wiki.lead;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${displayName} — outbreak wiki, heat map, and analytics`,
    description: articleDescription,
    dateModified: snapshot.generatedAt,
    author: {
      "@type": "Organization",
      name: "Virus Tracker",
      url: env.APP_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Virus Tracker",
      url: env.APP_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${env.APP_URL}/viruses/${slug}`,
    },
  };

  const baseFaqs = [
    {
      question: "Is this page medical advice?",
      answer: wiki.disclaimer,
    },
    {
      question: "What does \"outbreak activity\" mean on Virus Tracker?",
      answer:
        "Outbreak activity reflects active-case burden relative to recoveries in our models. It helps compare stressed outbreak zones within the dataset—it is not a clinical score.",
    },
    {
      question: "How often is this wiki updated?",
      answer:
        "Figures refresh on the site’s ingestion and revalidation schedule (typically about every 30 minutes in production). Timestamps on the dashboard snapshot indicate the last build of the underlying dataset.",
    },
    {
      question: "Why might the heat map not match official government totals?",
      answer:
        "We merge multiple open sources and fallbacks; reporting lag, testing policy, and geographic coverage differ by country. Use national health ministries for authoritative case definitions.",
    },
  ];

  const faqItems = [...(wiki.faq ?? []), ...baseFaqs];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <article className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <header className="rounded-2xl border border-border-default bg-surface-raised p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{CATEGORY_LABELS[virusDef.category]}</Badge>
          <Badge variant={virusDef.hasLiveData ? "accent" : "neutral"}>{coverage.label}</Badge>
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">{displayName}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-secondary sm:text-base">{wiki.lead}</p>
        <p className="mt-3 text-xs text-text-faint">
          {hasLiveMetrics && virus ? (
            <>
              Snapshot: {new Date(snapshot.generatedAt).toLocaleString()} · {virus.metrics.length} tracked locations
              · {totalActive.toLocaleString()} active cases (dataset)
            </>
          ) : (
            <>Live monitoring snapshot: not yet available for this pathogen</>
          )}
        </p>
      </header>

      <Reveal>
        <Card>
          <SectionHeader eyebrow="At a glance" title="Quick facts" />
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {atAGlanceFacts.map((fact) => (
              <div key={fact.label} className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <fact.icon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">{fact.label}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-text-secondary">{fact.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </Card>
      </Reveal>

      <AdSlot placement="top-banner" slotName="Virus wiki — top banner" className="w-full" />

      <div className="rounded-xl border border-highlight/30 bg-highlight/10 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-highlight" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-highlight">Important</p>
            <p className="mt-1 text-sm leading-relaxed text-text-secondary">{wiki.disclaimer}</p>
          </div>
        </div>
      </div>

      {!hasLiveMetrics && (
        <EmptyState
          title="Live tracking isn't available yet"
          message="The wiki content below is still fully available. Regional metrics, heat maps, and trajectory charts will appear once live monitoring is enabled for this pathogen."
        />
      )}

      <nav
        aria-label="On this page"
        className="sticky top-16 z-10 overflow-x-auto rounded-lg border border-border-default bg-surface-page/90 px-2 py-2 backdrop-blur"
      >
        <ul className="flex gap-1 whitespace-nowrap text-xs">
          {SECTION_NAV.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="inline-block rounded-full px-3 py-1.5 font-medium text-text-secondary transition-colors hover:bg-surface-inset hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-6">
          <section id="overview" aria-label="Overview">
            <Reveal>
              <Card>
                <SectionHeader title="Overview" />
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">{wiki.overview}</p>
              </Card>
            </Reveal>
          </section>

          <section id="transmission" aria-label="Transmission">
            <Reveal delay={0.05}>
              <Card>
                <SectionHeader title="Transmission" />
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">{wiki.transmission}</p>
              </Card>
            </Reveal>
          </section>

          <section id="symptoms" aria-label="Symptoms & clinical notes">
            <Reveal delay={0.1}>
              <Card>
                <SectionHeader title="Symptoms & clinical notes" />
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">{wiki.symptoms}</p>
              </Card>
            </Reveal>
          </section>

          <section id="prevention" aria-label="Prevention & control">
            <Reveal delay={0.15}>
              <Card>
                <SectionHeader title="Prevention & control" />
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">{wiki.prevention}</p>
              </Card>
            </Reveal>
          </section>

          <section id="surveillance" aria-label="Surveillance context">
            <Reveal delay={0.2}>
              <Card>
                <SectionHeader title="Surveillance context" />
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">{wiki.surveillance}</p>
              </Card>
            </Reveal>
          </section>

          <section id="data" aria-label="Live dataset" className="space-y-6">
            <Reveal>
              <div>
                <SectionHeader eyebrow="Live dataset" title="Key metrics" />
                <div className="mt-4">
                  {hasLiveMetrics && virus ? (
                    <div className="grid gap-4 sm:grid-cols-3">
                      <StatCard
                        label={METRIC_COPY.activeCases.label}
                        infoTip={<InfoTip label="What does active cases mean?">{METRIC_COPY.activeCases.explainer}</InfoTip>}
                      >
                        <AnimatedNumber value={totalActive} format="compact" className="tabular-nums" />
                      </StatCard>
                      <StatCard
                        label={METRIC_COPY.deaths.label}
                        infoTip={<InfoTip label="What does deaths mean?">{METRIC_COPY.deaths.explainer}</InfoTip>}
                      >
                        <AnimatedNumber value={totalDeaths} format="compact" className="tabular-nums" />
                      </StatCard>
                      <StatCard
                        label={METRIC_COPY.growthRate.label}
                        infoTip={<InfoTip label="What does growth rate mean?">{METRIC_COPY.growthRate.explainer}</InfoTip>}
                        trend={<TrendPill trend={growthTrend(virus.latestGrowthRate)} />}
                      >
                        {virus.latestGrowthRate.toFixed(1)}%
                      </StatCard>
                    </div>
                  ) : (
                    <EmptyState
                      title="No live metrics yet"
                      message={`We don't have live regional metrics for ${displayName} yet. The wiki content above covers what's known.`}
                    />
                  )}
                </div>
              </div>
            </Reveal>

            {hasLiveMetrics && virus && (
              <Reveal delay={0.05}>
                <WorldHeatMap
                  items={virus.metrics}
                  sectionId="virus-infection-heat-map"
                  title={`${displayName} — global infection heat map`}
                  description="Country shading reflects relative active-case intensity from the current Virus Tracker dataset for this pathogen. Hover countries on desktop for counts."
                />
              </Reveal>
            )}

            <AdSlot placement="in-feed" slotName="Virus wiki — in-feed" className="w-full" />

            <Reveal delay={0.05}>
              <div>
                <SectionHeader eyebrow="Live dataset" title="Trajectory outlook" description="Projected case trend with a modeled confidence range." />
                <div className="mt-4">
                  {hasLiveMetrics && virus ? (
                    <TrajectoryLineChart
                      points={virus.trajectory}
                      virusName={displayName}
                      plainSummary={`Projected case trajectory for ${displayName}, with a shaded confidence range, based on the current Virus Tracker dataset.`}
                    />
                  ) : (
                    <EmptyState
                      title="No trajectory data yet"
                      message={`We don't have a projected case trajectory for ${displayName} right now.`}
                    />
                  )}
                </div>
              </div>
            </Reveal>

            {hasLiveMetrics && virus && (
              <Reveal delay={0.1}>
                <VirusRegionalBarChart metrics={virus.metrics} virusName={displayName} topN={10} />
              </Reveal>
            )}

            <Reveal delay={0.1}>
              <div>
                <SectionHeader eyebrow="Live dataset" title="Threat intelligence visuals" />
                <div className="mt-4">
                  {filteredView ? (
                    <>
                      <div className="grid gap-4 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                          <ThreatMatrixPanel points={filteredView.threatMatrixPoints} />
                        </div>
                        <SourceReliabilityPanel summary={filteredView.sourceReliabilitySummary} />
                      </div>
                      <div className="mt-4">
                        <SeverityByRegionPanel buckets={filteredView.severityByRegion} />
                      </div>
                    </>
                  ) : (
                    <EmptyState
                      title="No threat visuals yet"
                      message={`Live tracking for ${displayName} isn't available yet.`}
                    />
                  )}
                </div>
              </div>
            </Reveal>

            {hasLiveMetrics && (
              <Reveal delay={0.15}>
                <Card>
                  <SectionHeader eyebrow="Dataset" title="Top affected regions" />
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-border-default text-xs uppercase tracking-wide text-text-muted">
                          <th className="py-2 pr-4 font-medium">Location</th>
                          <th className="py-2 pr-4 font-medium">Active</th>
                          <th className="py-2 pr-4 font-medium">Deaths</th>
                          {hasTrendColumn ? <th className="py-2 font-medium">Trend</th> : null}
                        </tr>
                      </thead>
                      <tbody>
                        {topRegions.map((region) => (
                          <tr key={`${region.locationId}-${region.slug}`} className="border-b border-border-default/60">
                            <td className="py-2 pr-4 text-text-secondary">{regionDisplayName(region)}</td>
                            <td className="py-2 pr-4 font-mono text-xs text-text-primary">
                              {region.activeCases.toLocaleString()}
                            </td>
                            <td className="py-2 pr-4 font-mono text-xs text-text-primary">
                              {region.deaths.toLocaleString()}
                            </td>
                            {hasTrendColumn ? (
                              <td className="py-2">
                                {region.trend ? <TrendPill trend={region.trend} /> : <span className="text-text-faint">—</span>}
                              </td>
                            ) : null}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </Reveal>
            )}
          </section>

          <section id="faq" aria-label="FAQ">
            <Reveal>
              <Card>
                <SectionHeader title="Frequently asked questions" />
                <div className="mt-4 divide-y divide-border-default">
                  {faqItems.map((item) => (
                    <details key={item.question} className="group py-3 first:pt-0 last:pb-0">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-md text-sm font-semibold text-text-primary marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                        <span>{item.question}</span>
                        <ChevronDown
                          className="size-4 shrink-0 text-text-faint transition-transform duration-200 group-open:rotate-180"
                          aria-hidden="true"
                        />
                      </summary>
                      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{item.answer}</p>
                    </details>
                  ))}
                </div>
              </Card>
            </Reveal>
          </section>

          <section aria-label="Related on Virus Tracker">
            <Reveal>
              <Card>
                <SectionHeader title="Related on Virus Tracker" />
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/viruses"
                    className="rounded-full border border-border-default px-3 py-1 text-xs text-text-secondary transition-colors hover:border-border-accent hover:text-accent"
                  >
                    All virus wikis
                  </Link>
                  <Link
                    href={`/map?virus=${slug}`}
                    className="rounded-full border border-border-default px-3 py-1 text-xs text-text-secondary transition-colors hover:border-border-accent hover:text-accent"
                  >
                    Full-screen heat map
                  </Link>
                  <Link
                    href={`/news/topic/${slugify(displayName)}`}
                    className="rounded-full border border-border-default px-3 py-1 text-xs text-text-secondary transition-colors hover:border-border-accent hover:text-accent"
                  >
                    News topic: {displayName}
                  </Link>
                  {topRegion ? (
                    <Link
                      href={threatPath(slug, topRegion.region, topRegion.countryCode)}
                      className="rounded-full border border-border-default px-3 py-1 text-xs text-text-secondary transition-colors hover:border-border-accent hover:text-accent"
                    >
                      Top threat: {topRegion.region}
                    </Link>
                  ) : null}
                  {(wiki.seeAlso ?? []).map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-full border border-border-default px-3 py-1 text-xs text-text-secondary transition-colors hover:border-border-accent hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">
                  Related pathogens
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {relatedViruses.map((entry) => (
                    <Link
                      key={entry.slug}
                      href={`/viruses/${entry.slug}`}
                      className="rounded-full border border-border-default px-3 py-1 text-xs text-text-secondary transition-colors hover:border-border-accent hover:text-accent"
                    >
                      {entry.shortName}
                    </Link>
                  ))}
                </div>
              </Card>
            </Reveal>
          </section>
        </div>

        <aside className="w-full shrink-0 space-y-4 lg:w-80">
          <AdSlot placement="sidebar" slotName="Virus wiki — sidebar rail" />
        </aside>
      </div>
    </article>
  );
}
