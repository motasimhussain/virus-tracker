import type { NewsItem, RegionMetric } from "@/lib/types";
import { calculateGrowthRate } from "@/server/analysis";
import { METRIC_ADAPTERS, NEWS_ADAPTERS } from "@/server/data/adapters";
import { fallbackMetrics, fallbackNews } from "@/server/data/fallback-data";
import { dedupeAndMergeMetrics } from "@/server/data/location-normalization";
import type { SourceHealthRecord } from "@/server/cache/snapshot-cache";

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
};

export async function runIngestion(): Promise<IngestionState> {
  const sourceHealth: SourceHealthRecord[] = [];

  const [metricSettlements, newsSettlements] = await Promise.all([
    Promise.allSettled(
      METRIC_ADAPTERS.map((adapter) => withTimeout((signal) => adapter.fetchMetrics(signal))),
    ),
    Promise.allSettled(
      NEWS_ADAPTERS.map((adapter) => withTimeout((signal) => adapter.fetchNews(signal))),
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

  const enrichedFallback = fallbackMetrics.map((item) => ({
    ...item,
    activeCases: Math.round(item.activeCases * (1 + calculateGrowthRate(item) / 1000)),
    updatedAt: new Date().toISOString(),
  }));

  const metricsPool = metricResults.length > 0 ? [...metricResults, ...enrichedFallback] : fallbackMetrics;
  const metrics = dedupeAndMergeMetrics(metricsPool);
  const uniqueNews = Array.from(
    new Map((newsResults.length > 0 ? newsResults : fallbackNews).map((item) => [item.link, item])).values(),
  ).slice(0, 120);

  return {
    metrics,
    news: uniqueNews,
    sourceHealth,
  };
}
