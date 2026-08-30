import type { RegionMetric } from "@/lib/types";
import { buildLocationId } from "@/server/data/location-normalization";

import type { MetricsAdapter } from "./types";

function toSafeNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function baseMetric(input: Omit<RegionMetric, "locationId">): RegionMetric {
  return {
    ...input,
    locationId: buildLocationId(input),
  };
}

async function fetchMetrics(signal?: AbortSignal): Promise<RegionMetric[]> {
  const response = await fetch("https://disease.sh/v3/covid-19/countries", {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(`Disease.sh feed failed with status ${response.status}`);
  }

  const payload = (await response.json()) as Array<{
    country: string;
    countryInfo: { iso2: string | null; lat: number; long: number };
    active: number;
    cases: number;
    deaths: number;
    recovered: number;
    updated: number;
  }>;

  return payload.map((item) =>
    baseMetric({
      virus: "COVID-19",
      slug: "covid-19",
      region: item.country,
      locationLevel: "country",
      countryName: item.country,
      source: "disease.sh-countries",
      sourceConfidence: 0.95,
      countryCode: item.countryInfo.iso2 ?? "N/A",
      latitude: item.countryInfo.lat,
      longitude: item.countryInfo.long,
      activeCases: toSafeNumber(item.active),
      confirmedCases: toSafeNumber(item.cases),
      deaths: toSafeNumber(item.deaths),
      recovered: toSafeNumber(item.recovered),
      updatedAt: new Date(item.updated).toISOString(),
    }),
  );
}

export const diseaseShCountriesAdapter: MetricsAdapter = {
  id: "disease.sh-countries",
  sourceName: "disease.sh-countries",
  kind: "metrics",
  fetchMetrics,
};
