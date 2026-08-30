import type { NewsItem, RegionMetric, TrajectoryPoint } from "@/lib/types";

export type { SourceHealthRecord } from "@/server/cache/snapshot-cache";

export interface MetricsAdapter {
  id: string;
  sourceName: string;
  kind: "metrics";
  fetchMetrics(signal?: AbortSignal): Promise<RegionMetric[]>;
}

export interface NewsAdapter {
  id: string;
  sourceName: string;
  kind: "news";
  fetchNews(signal?: AbortSignal): Promise<NewsItem[]>;
}

export type IngestionAdapter = MetricsAdapter | NewsAdapter;

/**
 * Shared shape for the per-virus real trajectory providers (covid-historical,
 * owid-mpox, delphi-fluview). Unlike MetricsAdapter/NewsAdapter these are not
 * part of the IngestionAdapter union — they feed VirusSnapshot.trajectory
 * rather than the flat metrics/news pools — but they're registered and
 * fetched alongside the other adapters in ingestion.ts.
 */
export interface TrajectoryProvider {
  virusSlug: string;
  fetchTrajectory(signal?: AbortSignal): Promise<TrajectoryPoint[]>;
}
