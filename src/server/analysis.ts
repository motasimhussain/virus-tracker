import { getCentroid, getPopulation } from "@/lib/iso-countries";
import type {
  DashboardSnapshot,
  RegionMetric,
  SeverityRegionBucket,
  ThreatMatrixPoint,
  ThreatMetricsSummary,
  TopThreat,
  TrajectoryPoint,
  Trend,
  VirusSnapshot,
} from "@/lib/types";

/** Sum of a numeric series, treating non-finite values as 0. */
function sum(values: number[]): number {
  return values.reduce((total, value) => total + (Number.isFinite(value) ? value : 0), 0);
}

/**
 * Classifies a trend by comparing a recent window of values against the
 * prior window of the same length (nominally 7d vs the preceding 7d).
 * A move of more than +/-15% is "rising"/"falling"; otherwise "stable".
 */
export function classifyTrend(recent: number[], prior: number[]): Trend {
  const recentTotal = sum(recent);
  const priorTotal = sum(prior);

  if (priorTotal <= 0) {
    return recentTotal > 0 ? "rising" : "stable";
  }

  const change = (recentTotal - priorTotal) / priorTotal;
  if (change > 0.15) return "rising";
  if (change < -0.15) return "falling";
  return "stable";
}

/**
 * Derives a Trend from a chronological trajectory series by comparing the
 * most recent window of projectedCases against the window preceding it.
 * Returns undefined when there aren't enough points to form both windows.
 */
export function classifyTrendFromTrajectory(points: TrajectoryPoint[]): Trend | undefined {
  if (!points || points.length < 4) return undefined;

  const windowSize = points.length >= 14 ? 7 : Math.floor(points.length / 2);
  const recent = points.slice(-windowSize).map((point) => point.projectedCases);
  const prior = points.slice(-windowSize * 2, -windowSize).map((point) => point.projectedCases);

  if (prior.length === 0) return undefined;
  return classifyTrend(recent, prior);
}

/**
 * Active cases per 100k population for the given country, using the
 * iso-countries population table. Undefined when the country or its
 * population is unknown (population data only covers ~100 countries).
 */
export function calculateIncidencePer100k(activeCases: number, alpha2: string): number | undefined {
  const population = getPopulation(alpha2);
  if (!population || population <= 0) return undefined;
  if (!Number.isFinite(activeCases)) return undefined;
  return Number(((activeCases / population) * 100000).toFixed(2));
}

/**
 * Picks a real trajectory over a fallback one. A non-empty `real` series
 * wins and is marked isSynthetic: false; otherwise the fallback series is
 * used and every point is marked isSynthetic: true.
 */
export function selectTrajectory(
  real: TrajectoryPoint[] | null | undefined,
  fallback: TrajectoryPoint[],
): TrajectoryPoint[] {
  if (real && real.length > 0) {
    return real.map((point) => ({ ...point, isSynthetic: false }));
  }
  return fallback.map((point) => ({ ...point, isSynthetic: true }));
}

/**
 * Fills in derivable gaps on a RegionMetric: incidencePer100k (from the
 * iso-countries population table) when missing, and latitude/longitude
 * (from the iso-countries centroid table) when they are the (0, 0) sentinel
 * used by upstream adapters for "unknown location".
 */
export function enrichMetric(metric: RegionMetric): RegionMetric {
  const patch: Partial<RegionMetric> = {};

  if (metric.incidencePer100k === undefined) {
    const incidence = calculateIncidencePer100k(metric.activeCases, metric.countryCode);
    if (incidence !== undefined) patch.incidencePer100k = incidence;
  }

  if (metric.latitude === 0 && metric.longitude === 0) {
    const centroid = getCentroid(metric.countryCode);
    if (centroid) {
      patch.longitude = centroid[0];
      patch.latitude = centroid[1];
    }
  }

  return Object.keys(patch).length > 0 ? { ...metric, ...patch } : metric;
}

export function calculateGrowthRate(metric: RegionMetric): number {
  if (metric.recovered <= 0) return 0;
  const pressure = metric.activeCases / metric.recovered;
  return Number((pressure * 100).toFixed(2));
}

export function calculateCfr(metric: RegionMetric): number {
  if (metric.confirmedCases <= 0) return 0;
  return Number(((metric.deaths / metric.confirmedCases) * 100).toFixed(2));
}

export function calculatePressure(metric: RegionMetric): number {
  if (metric.confirmedCases <= 0) return 0;
  return Number((metric.activeCases / metric.confirmedCases).toFixed(4));
}

export function calculateRecoveryRatio(metric: RegionMetric): number {
  if (metric.confirmedCases <= 0) return 0;
  return Number(((metric.recovered / metric.confirmedCases) * 100).toFixed(2));
}

export function calculateFreshnessHours(metric: RegionMetric, now = new Date()): number {
  const updatedAt = new Date(metric.updatedAt);
  const ms = now.getTime() - updatedAt.getTime();
  return Number((ms / (1000 * 60 * 60)).toFixed(2));
}

export function calculateSeverityScore(metric: RegionMetric): number {
  const cfr = calculateCfr(metric);
  const pressure = calculatePressure(metric) * 100;
  const activeScale = Math.log10(metric.activeCases + 1) * 10;
  const confidenceRisk = (1 - metric.sourceConfidence) * 20;
  return Number((0.4 * activeScale + 0.25 * cfr + 0.25 * pressure + 0.1 * confidenceRisk).toFixed(2));
}

export function buildTrajectory(activeCases: number): TrajectoryPoint[] {
  return Array.from({ length: 14 }, (_, dayIndex) => {
    const date = `${dayIndex + 1}d`;
    const multiplier = 1 + dayIndex * 0.04;
    const projectedCases = Math.round(activeCases * multiplier);
    return {
      date,
      projectedCases,
      confidenceLow: Math.round(projectedCases * 0.85),
      confidenceHigh: Math.round(projectedCases * 1.18),
    };
  });
}

export function rankHotspots(metrics: RegionMetric[]): RegionMetric[] {
  return [...metrics].sort((a, b) => b.activeCases - a.activeCases).slice(0, 250);
}

export function mergeVirusSnapshots(metrics: RegionMetric[]): VirusSnapshot[] {
  const bucket = new Map<string, RegionMetric[]>();

  for (const metric of metrics) {
    const list = bucket.get(metric.slug) ?? [];
    list.push(metric);
    bucket.set(metric.slug, list);
  }

  return Array.from(bucket.entries()).map(([slug, grouped]) => {
    const totalCases = grouped.reduce((sum, item) => sum + item.activeCases, 0);
    const summary = `${grouped.length} tracked regions, ${totalCases.toLocaleString()} active cases.`;
    const latestGrowthRate =
      grouped.reduce((sum, item) => sum + calculateGrowthRate(item), 0) / grouped.length;

    return {
      slug,
      name: grouped[0]?.virus ?? slug,
      summary,
      metrics: grouped,
      trajectory: buildTrajectory(totalCases),
      latestGrowthRate: Number(latestGrowthRate.toFixed(2)),
    };
  });
}

export function getVirusOptions(snapshot: DashboardSnapshot): Array<{ slug: string; name: string }> {
  return snapshot.viruses.map((virus) => ({ slug: virus.slug, name: virus.name }));
}

export function getRegionOptions(hotspots: RegionMetric[]) {
  return hotspots.slice(0, 120).map((item) => ({
    locationId: item.locationId,
    label:
      item.locationLevel === "admin1" && item.admin1Name
        ? `${item.admin1Name}, ${item.countryName}`
        : item.region,
    level: item.locationLevel,
  }));
}

export function filterHotspotsByVirus(hotspots: RegionMetric[], virusSlug: string | null): RegionMetric[] {
  if (!virusSlug) return hotspots;
  return hotspots.filter((item) => item.slug === virusSlug);
}

export function buildTopThreats(hotspots: RegionMetric[]): TopThreat[] {
  return hotspots.slice(0, 25).map((item) => ({
    key: `${item.slug}:${item.locationId}`,
    label:
      item.locationLevel === "admin1" && item.admin1Name
        ? `${item.admin1Name}, ${item.countryName}`
        : `${item.region} (${item.countryCode})`,
    virusSlug: item.slug,
    countryCode: item.countryCode,
    region: item.region,
    activeCases: item.activeCases,
  }));
}

export function filterHotspotsByThreat(hotspots: RegionMetric[], threatKey: string | null): RegionMetric[] {
  if (!threatKey) return hotspots;
  const [slug, ...locationParts] = threatKey.split(":");
  const locationId = locationParts.join(":");
  return hotspots.filter((item) => item.slug === slug && item.locationId === locationId);
}

export function buildThreatMetricsSummary(hotspots: RegionMetric[]): ThreatMetricsSummary {
  if (hotspots.length === 0) {
    return {
      caseFatalityRatio: 0,
      pressureIndex: 0,
      recoveryRatio: 0,
      confidenceAdjustedExposure: 0,
      staleDataZones: 0,
    };
  }

  const totals = hotspots.reduce(
    (acc, item) => {
      acc.confirmed += item.confirmedCases;
      acc.deaths += item.deaths;
      acc.active += item.activeCases;
      acc.recovered += item.recovered;
      acc.confidenceExposure += item.activeCases * item.sourceConfidence;
      if (calculateFreshnessHours(item) > 24) {
        acc.stale += 1;
      }
      return acc;
    },
    { confirmed: 0, deaths: 0, active: 0, recovered: 0, stale: 0, confidenceExposure: 0 },
  );

  return {
    caseFatalityRatio:
      totals.confirmed > 0 ? Number(((totals.deaths / totals.confirmed) * 100).toFixed(2)) : 0,
    pressureIndex: totals.confirmed > 0 ? Number((totals.active / totals.confirmed).toFixed(4)) : 0,
    recoveryRatio: totals.confirmed > 0 ? Number(((totals.recovered / totals.confirmed) * 100).toFixed(2)) : 0,
    confidenceAdjustedExposure: Math.round(totals.confidenceExposure),
    staleDataZones: totals.stale,
  };
}

export function buildThreatMatrixPoints(hotspots: RegionMetric[]): ThreatMatrixPoint[] {
  return hotspots.slice(0, 30).map((item) => ({
    key: `${item.slug}:${item.locationId}`,
    label:
      item.locationLevel === "admin1" && item.admin1Name
        ? `${item.admin1Name}, ${item.countryName}`
        : `${item.region} (${item.countryCode})`,
    pressure: calculatePressure(item),
    caseFatalityRatio: calculateCfr(item),
    activeCases: item.activeCases,
    confidence: item.sourceConfidence,
  }));
}

export function buildSeverityByRegion(hotspots: RegionMetric[]): SeverityRegionBucket[] {
  const bucket = new Map<string, SeverityRegionBucket>();
  for (const item of hotspots) {
    const key = item.countryCode;
    const existing = bucket.get(key);
    const label = item.countryName || item.region;
    const severityScore = calculateSeverityScore(item);

    if (!existing) {
      bucket.set(key, {
        key,
        label,
        totalActiveCases: item.activeCases,
        severityScore,
      });
      continue;
    }

    const combinedActive = existing.totalActiveCases + item.activeCases;
    bucket.set(key, {
      key,
      label,
      totalActiveCases: combinedActive,
      severityScore: Number(((existing.severityScore + severityScore) / 2).toFixed(2)),
    });
  }

  return Array.from(bucket.values())
    .sort((a, b) => b.severityScore - a.severityScore)
    .slice(0, 12);
}
