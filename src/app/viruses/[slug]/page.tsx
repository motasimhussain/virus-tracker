import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MetricCard } from "@/components/dashboard/MetricCard";
import { TrajectoryChart } from "@/components/dashboard/TrajectoryChart";
import { env } from "@/lib/config";
import { getDashboardSnapshot } from "@/server/dashboard-service";

type VirusDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateMetadata({ params }: VirusDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const snapshot = await getDashboardSnapshot();
  const virus = snapshot.viruses.find((entry) => entry.slug === slug);
  if (!virus) {
    return {
      title: "Virus not found",
      alternates: { canonical: `/viruses/${slug}` },
    };
  }

  return {
    title: `${virus.name} Threat Intelligence`,
    description: `${virus.name} spread metrics, severity profile, and trajectory outlook across tracked regions.`,
    alternates: {
      canonical: `/viruses/${virus.slug}`,
    },
    openGraph: {
      title: `${virus.name} Threat Intelligence`,
      description: `${virus.name} spread metrics, severity profile, and trajectory outlook across tracked regions.`,
      url: `${env.APP_URL}/viruses/${virus.slug}`,
      type: "article",
    },
  };
}

export default async function VirusDetailsPage({ params }: VirusDetailsPageProps) {
  const { slug } = await params;
  const snapshot = await getDashboardSnapshot();
  const virus = snapshot.viruses.find((entry) => entry.slug === slug);
  if (!virus) return notFound();

  const totalActive = virus.metrics.reduce((sum, metric) => sum + metric.activeCases, 0);
  const totalDeaths = virus.metrics.reduce((sum, metric) => sum + metric.deaths, 0);
  const topRegions = [...virus.metrics].sort((a, b) => b.activeCases - a.activeCases).slice(0, 5);
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: env.APP_URL },
      { "@type": "ListItem", position: 2, name: "Viruses", item: `${env.APP_URL}/` },
      { "@type": "ListItem", position: 3, name: virus.name, item: `${env.APP_URL}/viruses/${virus.slug}` },
    ],
  };

  return (
    <div className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <section className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-5">
        <h1 className="text-2xl font-bold text-cyan-100">{virus.name}</h1>
        <p className="mt-2 text-sm text-cyan-100/70">{virus.summary}</p>
        <p className="mt-2 text-sm text-cyan-100/80">
          Tracking {virus.metrics.length} regions with {totalActive.toLocaleString()} active cases and{" "}
          {totalDeaths.toLocaleString()} reported deaths.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Active Cases" value={totalActive.toLocaleString()} />
        <MetricCard label="Deaths" value={totalDeaths.toLocaleString()} />
        <MetricCard label="Pressure Index" value={`${virus.latestGrowthRate}%`} />
      </section>

      <TrajectoryChart points={virus.trajectory} />

      <section className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold text-cyan-100">Top affected regions</h2>
        <div className="mt-3 space-y-2 text-sm text-cyan-100/80">
          {topRegions.map((region) => (
            <div key={`${region.locationId}-${region.slug}`} className="flex items-center justify-between">
              <span>
                {region.locationLevel === "admin1" && region.admin1Name
                  ? `${region.admin1Name}, ${region.countryName}`
                  : `${region.region} (${region.countryCode})`}
              </span>
              <span>{region.activeCases.toLocaleString()} active</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/map?virus=${virus.slug}`}
            className="rounded-md border border-cyan-400/35 px-3 py-1 text-xs text-cyan-200 hover:text-fuchsia-300"
          >
            View on Heat Map
          </Link>
          {topRegions[0] ? (
            <Link
              href={`/threats/${virus.slug}/${encodeURIComponent(
                `${topRegions[0].region.toLowerCase().replace(/\s+/g, "-")}-${topRegions[0].countryCode.toLowerCase()}`,
              )}`}
              className="rounded-md border border-cyan-400/35 px-3 py-1 text-xs text-cyan-200 hover:text-fuchsia-300"
            >
              Explore Top Threat Page
            </Link>
          ) : null}
        </div>
      </section>

      <section className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold text-cyan-100">FAQ</h2>
        <div className="mt-3 space-y-3 text-sm text-cyan-100/80">
          <div>
            <p className="font-semibold text-cyan-50">What does the pressure index mean?</p>
            <p>
              Pressure index reflects active-case burden relative to recoveries and helps identify stressed outbreak
              zones.
            </p>
          </div>
          <div>
            <p className="font-semibold text-cyan-50">How often is this page updated?</p>
            <p>The page refreshes on ingestion cycles and includes rolling trajectory forecasts for short-term outlooks.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
