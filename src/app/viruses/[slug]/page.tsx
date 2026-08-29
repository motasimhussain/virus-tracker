import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ads/AdSlot";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SeverityByRegionPanel } from "@/components/dashboard/SeverityByRegionPanel";
import { SourceReliabilityPanel } from "@/components/dashboard/SourceReliabilityPanel";
import { ThreatMatrixPanel } from "@/components/dashboard/ThreatMatrixPanel";
import { TrajectoryChart } from "@/components/dashboard/TrajectoryChart";
import { WorldHeatMap } from "@/components/map/WorldHeatMap";
import { VirusRegionalBarChart } from "@/components/virus/VirusRegionalBarChart";
import { getVirusWiki, getVirusWikiFallback } from "@/data/virus-wiki";
import { env } from "@/lib/config";
import { slugify } from "@/lib/seo";
import { getVirusDef, isVirusSlug } from "@/lib/viruses";
import { getDashboardSnapshot, getFilteredDashboardView } from "@/server/dashboard-service";

type VirusDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 1800;

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
  const topRegions = virus ? [...virus.metrics].sort((a, b) => b.activeCases - a.activeCases).slice(0, 12) : [];
  const topRegion = topRegions[0];

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
      question: "What does the pressure index mean on Virus Tracker?",
      answer:
        "Pressure index reflects active-case burden relative to recoveries in our models. It helps compare stressed outbreak zones within the dataset—it is not a clinical score.",
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

      <header className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Virus wiki</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-cyan-50">{displayName}</h1>
        <p className="mt-3 text-sm leading-relaxed text-cyan-100/85">{wiki.lead}</p>
        <p className="mt-2 text-xs text-cyan-200/60">
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

      <AdSlot placement="top-banner" slotName="Virus wiki — top banner" className="w-full" />

      <section className="rounded-xl border border-amber-500/25 bg-amber-950/20 p-4 text-sm text-amber-100/90">
        <p className="font-semibold text-amber-200">Important</p>
        <p className="mt-1">{wiki.disclaimer}</p>
      </section>

      {!hasLiveMetrics && (
        <section className="rounded-xl border border-cyan-500/25 bg-slate-900/50 p-4 text-sm text-cyan-100/80">
          Live tracking for this virus isn&apos;t available yet. The wiki content below is still fully available;
          regional metrics, heat maps, and trajectory charts will appear once live monitoring is enabled.
        </section>
      )}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-6">
          <section className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-5" aria-labelledby="wiki-overview">
            <h2 id="wiki-overview" className="text-lg font-semibold text-cyan-100">
              Overview
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-cyan-100/85">{wiki.overview}</p>
          </section>

          <section className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-5" aria-labelledby="wiki-transmission">
            <h2 id="wiki-transmission" className="text-lg font-semibold text-cyan-100">
              Transmission
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-cyan-100/85">{wiki.transmission}</p>
          </section>

          <section className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-5" aria-labelledby="wiki-symptoms">
            <h2 id="wiki-symptoms" className="text-lg font-semibold text-cyan-100">
              Symptoms & clinical notes
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-cyan-100/85">{wiki.symptoms}</p>
          </section>

          <section className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-5" aria-labelledby="wiki-prevention">
            <h2 id="wiki-prevention" className="text-lg font-semibold text-cyan-100">
              Prevention & control
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-cyan-100/85">{wiki.prevention}</p>
          </section>

          <section className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-5" aria-labelledby="wiki-surveillance">
            <h2 id="wiki-surveillance" className="text-lg font-semibold text-cyan-100">
              Surveillance context
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-cyan-100/85">{wiki.surveillance}</p>
          </section>

          <section aria-labelledby="wiki-metrics-heading">
            <h2 id="wiki-metrics-heading" className="mb-3 text-lg font-semibold text-cyan-100">
              Key metrics
            </h2>
            {hasLiveMetrics && virus ? (
              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard label="Active cases (dataset)" value={totalActive.toLocaleString()} />
                <MetricCard label="Reported deaths" value={totalDeaths.toLocaleString()} />
                <MetricCard label="Pressure index" value={`${virus.latestGrowthRate}%`} />
              </div>
            ) : (
              <p className="text-sm text-cyan-100/60">Live tracking for this virus isn&apos;t available yet.</p>
            )}
          </section>

          {hasLiveMetrics && virus && (
            <WorldHeatMap
              items={virus.metrics}
              sectionId="virus-infection-heat-map"
              title={`${displayName} — global infection heat map`}
              description="Country shading reflects relative active-case intensity from the current Virus Tracker dataset for this pathogen. Hover countries on desktop for counts."
            />
          )}

          <AdSlot placement="in-feed" slotName="Virus wiki — in-feed" className="w-full" />

          <section aria-labelledby="wiki-trajectory-heading">
            <h2 id="wiki-trajectory-heading" className="mb-3 text-lg font-semibold text-cyan-100">
              Trajectory outlook
            </h2>
            {hasLiveMetrics && virus ? (
              <TrajectoryChart points={virus.trajectory} />
            ) : (
              <p className="text-sm text-cyan-100/60">Live tracking for this virus isn&apos;t available yet.</p>
            )}
          </section>

          <section aria-labelledby="wiki-regional-heading">
            <h2 id="wiki-regional-heading" className="mb-3 text-lg font-semibold text-cyan-100">
              Regional analysis
            </h2>
            {hasLiveMetrics && virus ? (
              <VirusRegionalBarChart metrics={virus.metrics} virusName={displayName} topN={10} />
            ) : (
              <p className="text-sm text-cyan-100/60">Live tracking for this virus isn&apos;t available yet.</p>
            )}
          </section>

          <section aria-labelledby="wiki-threat-heading">
            <h2 id="wiki-threat-heading" className="mb-3 text-lg font-semibold text-cyan-100">
              Threat intelligence visuals
            </h2>
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
              <p className="text-sm text-cyan-100/60">Live tracking for this virus isn&apos;t available yet.</p>
            )}
          </section>

          {hasLiveMetrics && (
            <section className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-5" aria-labelledby="wiki-top-regions">
              <h2 id="wiki-top-regions" className="text-lg font-semibold text-cyan-100">
                Top affected regions
              </h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[480px] border-collapse text-left text-sm text-cyan-100/85">
                  <thead>
                    <tr className="border-b border-cyan-500/30 text-xs uppercase tracking-wide text-cyan-400">
                      <th className="py-2 pr-4 font-medium">Location</th>
                      <th className="py-2 pr-4 font-medium">Active</th>
                      <th className="py-2 font-medium">Deaths</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topRegions.map((region) => (
                      <tr key={`${region.locationId}-${region.slug}`} className="border-b border-cyan-800/40">
                        <td className="py-2 pr-4">
                          {region.locationLevel === "admin1" && region.admin1Name
                            ? `${region.admin1Name}, ${region.countryName}`
                            : `${region.region} (${region.countryCode})`}
                        </td>
                        <td className="py-2 pr-4 font-mono text-xs">{region.activeCases.toLocaleString()}</td>
                        <td className="py-2 font-mono text-xs">{region.deaths.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-5" aria-labelledby="wiki-faq">
            <h2 id="wiki-faq" className="text-lg font-semibold text-cyan-100">
              FAQ
            </h2>
            <div className="mt-4 space-y-4 text-sm text-cyan-100/85">
              {faqItems.map((item) => (
                <div key={item.question}>
                  <p className="font-semibold text-cyan-50">{item.question}</p>
                  <p className="mt-1">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-5" aria-labelledby="wiki-related">
            <h2 id="wiki-related" className="text-lg font-semibold text-cyan-100">
              Related on Virus Tracker
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/viruses"
                className="rounded-md border border-cyan-400/35 px-3 py-1 text-xs text-cyan-200 hover:text-fuchsia-300"
              >
                All virus wikis
              </Link>
              <Link
                href={`/map?virus=${slug}`}
                className="rounded-md border border-cyan-400/35 px-3 py-1 text-xs text-cyan-200 hover:text-fuchsia-300"
              >
                Full-screen heat map
              </Link>
              <Link
                href={`/news/topic/${slugify(displayName)}`}
                className="rounded-md border border-cyan-400/35 px-3 py-1 text-xs text-cyan-200 hover:text-fuchsia-300"
              >
                News topic: {displayName}
              </Link>
              {topRegion ? (
                <Link
                  href={threatPath(slug, topRegion.region, topRegion.countryCode)}
                  className="rounded-md border border-cyan-400/35 px-3 py-1 text-xs text-cyan-200 hover:text-fuchsia-300"
                >
                  Top threat: {topRegion.region}
                </Link>
              ) : null}
              {(wiki.seeAlso ?? []).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md border border-cyan-400/35 px-3 py-1 text-xs text-cyan-200 hover:text-fuchsia-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="w-full shrink-0 space-y-4 lg:w-80">
          <AdSlot placement="sidebar" slotName="Virus wiki — sidebar rail" />
        </aside>
      </div>
    </article>
  );
}
