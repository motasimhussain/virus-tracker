import { env } from "@/lib/config";
import type { DashboardSnapshot, FilteredDashboardView, VirusSnapshot } from "@/lib/types";
import {
  buildSeverityByRegion,
  buildThreatMatrixPoints,
  buildThreatMetricsSummary,
  buildTopThreats,
  filterHotspotsByThreat,
  filterHotspotsByVirus,
  getRegionOptions,
  getVirusOptions,
  mergeVirusSnapshots,
  rankHotspots,
} from "@/server/analysis";
import { runIngestion } from "@/server/data/ingestion";
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

function applyFallbackTrajectory(viruses: VirusSnapshot[]): VirusSnapshot[] {
  return viruses.map((virus) => ({
    ...virus,
    trajectory: fallbackTrajectory[virus.slug] ?? virus.trajectory,
  }));
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
  const viruses = applyFallbackTrajectory(mergeVirusSnapshots(ingestion.metrics));
  const hotspots = rankHotspots(ingestion.metrics);
  const generatedAtMs = Date.now();

  const snapshot: DashboardSnapshot = {
    generatedAt: new Date(generatedAtMs).toISOString(),
    viruses,
    hotspots,
    news: ingestion.news,
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
