import type { RegionMetric } from "@/lib/types";

function normalizeText(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

export function normalizeCountryName(countryName: string): string {
  return normalizeText(countryName)
    .replace("united states of america", "united states")
    .replace("russian federation", "russia")
    .replace("democratic republic of the congo", "democratic republic of congo");
}

export function buildLocationId(metric: Pick<RegionMetric, "countryCode" | "locationLevel" | "region">) {
  if (metric.locationLevel === "country") {
    return `country:${metric.countryCode}`;
  }

  if (metric.locationLevel === "admin1") {
    return `admin1:${metric.countryCode}:${normalizeText(metric.region)}`;
  }

  return `city:${metric.countryCode}:${normalizeText(metric.region)}`;
}

export function dedupeAndMergeMetrics(metrics: RegionMetric[]): RegionMetric[] {
  const merged = new Map<string, RegionMetric>();

  for (const metric of metrics) {
    const key = `${metric.slug}:${metric.locationId}:${metric.updatedAt.slice(0, 10)}`;
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, metric);
      continue;
    }

    const preferIncoming =
      metric.sourceConfidence > existing.sourceConfidence ||
      (metric.sourceConfidence === existing.sourceConfidence && metric.activeCases > existing.activeCases);

    if (preferIncoming) {
      merged.set(key, {
        ...metric,
        confirmedCases: Math.max(metric.confirmedCases, existing.confirmedCases),
        deaths: Math.max(metric.deaths, existing.deaths),
        recovered: Math.max(metric.recovered, existing.recovered),
      });
    } else {
      merged.set(key, {
        ...existing,
        confirmedCases: Math.max(existing.confirmedCases, metric.confirmedCases),
        deaths: Math.max(existing.deaths, metric.deaths),
        recovered: Math.max(existing.recovered, metric.recovered),
      });
    }
  }

  return Array.from(merged.values());
}
