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
import { fallbackTrajectory } from "@/server/data/fallback-data";

type CachedSnapshot = {
  value: DashboardSnapshot;
  expiresAt: number;
  sourceHealth: Array<{ source: string; healthy: boolean; message: string }>;
};

const globalCache = globalThis as typeof globalThis & {
  virusTrackerCache?: CachedSnapshot;
};

function applyFallbackTrajectory(viruses: VirusSnapshot[]): VirusSnapshot[] {
  return viruses.map((virus) => ({
    ...virus,
    trajectory: fallbackTrajectory[virus.slug] ?? virus.trajectory,
  }));
}

export async function getDashboardSnapshot(forceRefresh = false): Promise<DashboardSnapshot> {
  const now = Date.now();
  const existing = globalCache.virusTrackerCache;
  if (!forceRefresh && existing && existing.expiresAt > now) {
    return existing.value;
  }

  const ingestion = await runIngestion();
  const viruses = applyFallbackTrajectory(mergeVirusSnapshots(ingestion.metrics));
  const hotspots = rankHotspots(ingestion.metrics);

  const snapshot: DashboardSnapshot = {
    generatedAt: new Date().toISOString(),
    viruses,
    hotspots,
    news: ingestion.news,
  };

  globalCache.virusTrackerCache = {
    value: snapshot,
    expiresAt: now + env.INGESTION_TTL_SECONDS * 1000,
    sourceHealth: ingestion.sourceHealth,
  };

  return snapshot;
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
