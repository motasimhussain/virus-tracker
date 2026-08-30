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
  const response = await fetch("https://disease.sh/v3/covid-19/states", {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(`Disease.sh US states feed failed with status ${response.status}`);
  }

  const payload = (await response.json()) as Array<{
    state: string;
    cases: number;
    active: number;
    deaths: number;
    recovered?: number;
    updated: number;
  }>;

  return payload.map((item) =>
    baseMetric({
      virus: "COVID-19",
      slug: "covid-19",
      region: item.state,
      locationLevel: "admin1",
      countryName: "United States",
      admin1Name: item.state,
      admin1Code: item.state,
      source: "disease.sh-us-states",
      sourceConfidence: 0.92,
      countryCode: "US",
      latitude: 37.09,
      longitude: -95.71,
      activeCases: toSafeNumber(item.active),
      confirmedCases: toSafeNumber(item.cases),
      deaths: toSafeNumber(item.deaths),
      recovered: Math.max(
        toSafeNumber(item.recovered ?? item.cases) -
          toSafeNumber(item.active) -
          toSafeNumber(item.deaths),
        0,
      ),
      updatedAt: new Date(item.updated).toISOString(),
    }),
  );
}

export const diseaseShUsStatesAdapter: MetricsAdapter = {
  id: "disease.sh-us-states",
  sourceName: "disease.sh-us-states",
  kind: "metrics",
  fetchMetrics,
};
