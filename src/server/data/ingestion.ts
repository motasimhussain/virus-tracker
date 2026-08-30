import type { NewsItem, RegionMetric, TrajectoryPoint } from "@/lib/types";
import { calculateGrowthRate, enrichMetric } from "@/server/analysis";
import { METRIC_ADAPTERS, NEWS_ADAPTERS, TRAJECTORY_PROVIDERS } from "@/server/data/adapters";
import { fallbackMetrics, fallbackNews } from "@/server/data/fallback-data";
import { dedupeAndMergeMetrics } from "@/server/data/location-normalization";
import type { SourceHealthRecord } from "@/server/cache/snapshot-cache";
import { appendMetricObservations, insertIngestionRun, upsertNewsItems } from "@/server/db/supabase";

const ADAPTER_TIMEOUT_MS = 10_000;

/**
 * Runs `operation` with a real AbortSignal that fires after `timeoutMs`. The
 * signal is handed to the adapter so fetch-based adapters can cancel their
 * in-flight request; adapters that cannot plumb a signal through (e.g. RSS
 * parsing) are still bounded because this wrapper rejects independently once
 * the signal aborts.
 */
function withTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number = ADAPTER_TIMEOUT_MS,
): Promise<T> {
  const signal = AbortSignal.timeout(timeoutMs);

  return new Promise<T>((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason ?? new Error("Adapter timed out"));
      return;
    }

    const onAbort = () => reject(signal.reason ?? new Error("Adapter timed out"));
    signal.addEventListener("abort", onAbort, { once: true });

    operation(signal).then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      },
    );
  });
}

export type IngestionState = {
  metrics: RegionMetric[];
  news: NewsItem[];
  sourceHealth: SourceHealthRecord[];
  /** Real (non-synthetic) trajectories keyed by virus slug, only for providers that succeeded with a non-empty series. */
  trajectories: Record<string, TrajectoryPoint[]>;
};

export async function runIngestion(): Promise<IngestionState> {
  const sourceHealth: SourceHealthRecord[] = [];

  const [metricSettlements, newsSettlements, trajectorySettlements] = await Promise.all([
    Promise.allSettled(
      METRIC_ADAPTERS.map((adapter) => withTimeout((signal) => adapter.fetchMetrics(signal))),
    ),
    Promise.allSettled(
      NEWS_ADAPTERS.map((adapter) => withTimeout((signal) => adapter.fetchNews(signal))),
    ),
    Promise.allSettled(
      TRAJECTORY_PROVIDERS.map((provider) => withTimeout((signal) => provider.fetchTrajectory(signal))),
    ),
  ]);

  const metricResults: RegionMetric[] = [];
  metricSettlements.forEach((result, index) => {
    const adapter = METRIC_ADAPTERS[index];
    if (result.status === "fulfilled") {
      metricResults.push(...result.value);
      sourceHealth.push({
        source: adapter.sourceName,
        healthy: true,
        message: `Fetched ${result.value.length} records`,
      });
    } else {
      sourceHealth.push({
        source: adapter.sourceName,
        healthy: false,
        message:
          result.reason instanceof Error ? result.reason.message : `Unknown ${adapter.sourceName} error`,
      });
    }
  });

  const newsResults: NewsItem[] = [];
  newsSettlements.forEach((result, index) => {
    const adapter = NEWS_ADAPTERS[index];
    if (result.status === "fulfilled") {
      newsResults.push(...result.value);
      sourceHealth.push({
        source: adapter.sourceName,
        healthy: true,
        message: `Fetched ${result.value.length} stories`,
      });
    } else {
      sourceHealth.push({
        source: adapter.sourceName,
        healthy: false,
        message:
          result.reason instanceof Error ? result.reason.message : `Unknown ${adapter.sourceName} error`,
      });
    }
  });

  const trajectories: Record<string, TrajectoryPoint[]> = {};
  trajectorySettlements.forEach((result, index) => {
    const provider = TRAJECTORY_PROVIDERS[index];
    const sourceLabel = `${provider.virusSlug}-trajectory`;
    if (result.status === "fulfilled" && result.value.length > 0) {
      trajectories[provider.virusSlug] = result.value;
      sourceHealth.push({
        source: sourceLabel,
        healthy: true,
        message: `Fetched ${result.value.length} trajectory points`,
      });
    } else {
      sourceHealth.push({
        source: sourceLabel,
        healthy: false,
        message:
          result.status === "rejected"
            ? result.reason instanceof Error
              ? result.reason.message
              : `Unknown ${sourceLabel} error`
            : "Trajectory provider returned an empty series",
      });
    }
  });

  const enrichedFallback = fallbackMetrics.map((item) => ({
    ...item,
    activeCases: Math.round(item.activeCases * (1 + calculateGrowthRate(item) / 1000)),
    updatedAt: new Date().toISOString(),
  }));

  const metricsPool = metricResults.length > 0 ? [...metricResults, ...enrichedFallback] : fallbackMetrics;
  const metrics = dedupeAndMergeMetrics(metricsPool).map(enrichMetric);
  const uniqueNews = Array.from(
    new Map((newsResults.length > 0 ? newsResults : fallbackNews).map((item) => [item.link, item])).values(),
  ).slice(0, 120);

  // Best-effort Supabase persistence — every helper below already no-ops and
  // swallows its own errors when Supabase isn't configured or a write fails,
  // so this never affects the ingestion return value.
  const runId = await insertIngestionRun(sourceHealth);
  await Promise.all([appendMetricObservations(runId, metrics), upsertNewsItems(uniqueNews)]);

  return {
    metrics,
    news: uniqueNews,
    sourceHealth,
    trajectories,
  };
}
