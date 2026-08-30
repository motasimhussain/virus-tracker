import { env } from "@/lib/config";
import type {
  DashboardSnapshot,
  FilteredDashboardView,
  RegionMetric,
  Trend,
  VirusSnapshot,
} from "@/lib/types";
import {
  buildSeverityByRegion,
  buildThreatMatrixPoints,
  buildThreatMetricsSummary,
  buildTopThreats,
  classifyTrendFromTrajectory,
  filterHotspotsByThreat,
  filterHotspotsByVirus,
  getRegionOptions,
  getVirusOptions,
  mergeVirusSnapshots,
  rankHotspots,
  selectTrajectory,
} from "@/server/analysis";
import { runIngestion, type IngestionState } from "@/server/data/ingestion";
import {
  getSnapshotFromSharedCache,
  setSnapshotToSharedCache,
  type CacheEnvelope,
  type SourceHealthRecord,
} from "@/server/cache/snapshot-cache";
import { fallbackTrajectory } from "@/server/data/fallback-data";

type CachedSnapshot = {
  value: DashboardSnapshot;
  sourceHealth: SourceHealthRecord[];
  generatedAtMs: number;
};

const globalCache = globalThis as typeof globalThis & {
  virusTrackerCache?: CachedSnapshot;
  refreshInFlight?: Promise<DashboardSnapshot>;
};

/**
 * Resolves each virus's final trajectory: a real (non-synthetic) trajectory
 * from `ingestion.trajectories` wins when the provider succeeded; otherwise
 * falls back to the curated fallback-data.ts series (or, if there isn't one
 * for this slug, the synthetic buildTrajectory projection mergeVirusSnapshots
 * already attached) — both stamped isSynthetic: true by selectTrajectory.
 */
function resolveVirusTrajectories(
  viruses: VirusSnapshot[],
  realTrajectories: IngestionState["trajectories"],
): VirusSnapshot[] {
  return viruses.map((virus) => {
    const fallback = fallbackTrajectory[virus.slug] ?? virus.trajectory;
    return {
      ...virus,
      trajectory: selectTrajectory(realTrajectories[virus.slug], fallback),
    };
  });
}

/** Fills a metric's `trend` from the virus-level trajectory when the adapter didn't already set one. */
function backfillTrend(metric: RegionMetric, trendBySlug: Map<string, Trend | undefined>): RegionMetric {
  if (metric.trend) return metric;
  const trend = trendBySlug.get(metric.slug);
  return trend ? { ...metric, trend } : metric;
}

export async function getDashboardSnapshot(forceRefresh = false): Promise<DashboardSnapshot> {
  const now = Date.now();
  const l1 = globalCache.virusTrackerCache;
  const freshUntil = (l1?.generatedAtMs ?? 0) + env.INGESTION_TTL_SECONDS * 1000;
  const staleUntil = freshUntil + env.REVALIDATE_SECONDS * 1000;

  if (!forceRefresh && l1 && now <= freshUntil) {
    return l1.value;
  }

  const l2 = await getSnapshotFromSharedCache();
  if (!forceRefresh && l2) {
    hydrateL1FromEnvelope(l2);
    const l2FreshUntil = l2.generatedAtMs + env.INGESTION_TTL_SECONDS * 1000;
    const l2StaleUntil = l2FreshUntil + env.REVALIDATE_SECONDS * 1000;
    if (now <= l2FreshUntil) {
      return l2.snapshot;
    }
    if (now <= l2StaleUntil) {
      void ensureRefresh();
      return l2.snapshot;
    }
  }

  if (!forceRefresh && l1 && now <= staleUntil) {
    void ensureRefresh();
    return l1.value;
  }

  return ensureRefresh();
}

function hydrateL1FromEnvelope(payload: CacheEnvelope) {
  globalCache.virusTrackerCache = {
    value: payload.snapshot,
    sourceHealth: payload.sourceHealth,
    generatedAtMs: payload.generatedAtMs,
  };
}

async function refreshSnapshot(): Promise<DashboardSnapshot> {
  const ingestion = await runIngestion();

  const groupedViruses = mergeVirusSnapshots(ingestion.metrics);
  const viruses = resolveVirusTrajectories(groupedViruses, ingestion.trajectories);

  // Trend classification derived from each virus's final (real-or-fallback)
  // trajectory, used to backfill RegionMetric.trend for metrics whose
  // adapter didn't already compute one (e.g. disease.sh, ecdc, who-gho).
  const trendBySlug = new Map<string, Trend | undefined>(
    viruses.map((virus) => [virus.slug, classifyTrendFromTrajectory(virus.trajectory)]),
  );

  const finalViruses = viruses.map((virus) => ({
    ...virus,
    metrics: virus.metrics.map((metric) => backfillTrend(metric, trendBySlug)),
  }));
  const hotspots = rankHotspots(ingestion.metrics).map((metric) => backfillTrend(metric, trendBySlug));

  const generatedAtMs = Date.now();
  const healthySources = ingestion.sourceHealth.filter((item) => item.healthy).length;
  const totalSources = ingestion.sourceHealth.length;

  const snapshot: DashboardSnapshot = {
    generatedAt: new Date(generatedAtMs).toISOString(),
    viruses: finalViruses,
    hotspots,
    news: ingestion.news,
    dataFreshness: {
      lastRunAt: new Date(generatedAtMs).toISOString(),
      healthySources,
      totalSources,
    },
  };

  const envelope: CacheEnvelope = {
    snapshot,
    sourceHealth: ingestion.sourceHealth,
    generatedAtMs,
  };
  hydrateL1FromEnvelope(envelope);
  await setSnapshotToSharedCache(envelope);

  return snapshot;
}

function ensureRefresh(): Promise<DashboardSnapshot> {
  if (!globalCache.refreshInFlight) {
    globalCache.refreshInFlight = refreshSnapshot().finally(() => {
      globalCache.refreshInFlight = undefined;
    });
  }
  return globalCache.refreshInFlight;
}

export function getSourceHealth() {
  return globalCache.virusTrackerCache?.sourceHealth ?? [];
}

function buildSourceReliabilitySummary(hotspots: FilteredDashboardView["filteredHotspots"]) {
  const sourceHealth = getSourceHealth();
  const healthySources = sourceHealth.filter((item) => item.healthy).length;
  const unhealthySources = sourceHealth.filter((item) => !item.healthy).length;
  const averageConfidence =
    hotspots.length > 0
      ? Number(
          (
            hotspots.reduce((sum, item) => sum + item.sourceConfidence, 0) / hotspots.length
          ).toFixed(3),
        )
      : 0;
  const confidenceAdjustedExposure = Math.round(
    hotspots.reduce((sum, item) => sum + item.activeCases * item.sourceConfidence, 0),
  );

  return {
    healthySources,
    unhealthySources,
    averageConfidence,
    confidenceAdjustedExposure,
  };
}

export function getFilteredDashboardView(
  snapshot: DashboardSnapshot,
  virusSlug: string | null,
  threatKey: string | null,
): FilteredDashboardView {
  const virusOptions = getVirusOptions(snapshot);
  const selectedVirusSlug = virusOptions.some((option) => option.slug === virusSlug) ? virusSlug : null;
  const virusFilteredHotspots = filterHotspotsByVirus(snapshot.hotspots, selectedVirusSlug);
  const topThreats = buildTopThreats(virusFilteredHotspots);
  const regionOptions = getRegionOptions(virusFilteredHotspots);
  const selectedThreatKey = topThreats.some((threat) => threat.key === threatKey) ? threatKey : null;
  const filteredHotspots = filterHotspotsByThreat(virusFilteredHotspots, selectedThreatKey);
  const threatMetricsSummary = buildThreatMetricsSummary(filteredHotspots);
  const threatMatrixPoints = buildThreatMatrixPoints(filteredHotspots);
  const severityByRegion = buildSeverityByRegion(filteredHotspots);
  const sourceReliabilitySummary = buildSourceReliabilitySummary(filteredHotspots);

  const leadVirus =
    snapshot.viruses.find((virus) => virus.slug === selectedVirusSlug) ?? snapshot.viruses[0] ?? null;

  return {
    virusOptions,
    regionOptions,
    topThreats,
    selectedVirusSlug,
    selectedThreatKey,
    leadVirus,
    filteredHotspots,
    threatMetricsSummary,
    threatMatrixPoints,
    severityByRegion,
    sourceReliabilitySummary,
  };
}
