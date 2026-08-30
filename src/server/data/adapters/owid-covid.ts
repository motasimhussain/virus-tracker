import Papa from "papaparse";

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
  const response = await fetch(
    "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/latest/owid-covid-latest.csv",
    { cache: "no-store", signal },
  );

  if (!response.ok) {
    throw new Error(`OWID latest feed failed with status ${response.status}`);
  }

  const csv = await response.text();
  const parsed = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });

  return parsed.data
    .filter((row) => (row.iso_code ?? "").length === 3 && row.location)
    .map((row) =>
      baseMetric({
        virus: "COVID-19",
        slug: "covid-19",
        region: row.location ?? "Unknown",
        locationLevel: "country",
        countryName: row.location ?? "Unknown",
        source: "owid-covid-latest",
        sourceConfidence: 0.9,
        countryCode: row.iso_code ?? "N/A",
        latitude: toSafeNumber(row.latitude),
        longitude: toSafeNumber(row.longitude),
        activeCases: toSafeNumber(row.new_cases),
        confirmedCases: toSafeNumber(row.total_cases),
        deaths: toSafeNumber(row.total_deaths),
        recovered: 0,
        updatedAt: new Date().toISOString(),
      }),
    );
}

export const owidCovidAdapter: MetricsAdapter = {
  id: "owid-covid-latest",
  sourceName: "owid-covid-latest",
  kind: "metrics",
  fetchMetrics,
};
