import type { NewsItem, RegionMetric } from "@/lib/types";

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
