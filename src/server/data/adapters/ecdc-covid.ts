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

function parseEcdcDate(rawDate: string): string {
  const [day, month, year] = rawDate.split("/");
  if (!day || !month || !year) return new Date().toISOString();
  return new Date(`${year}-${month}-${day}T00:00:00.000Z`).toISOString();
}

async function fetchMetrics(signal?: AbortSignal): Promise<RegionMetric[]> {
  const response = await fetch(
    "https://opendata.ecdc.europa.eu/covid19/casedistribution/csv",
    { cache: "no-store", signal },
  );

  if (!response.ok) {
    throw new Error(`ECDC feed failed with status ${response.status}`);
  }

  const csv = await response.text();
  const parsed = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });
  const latestByCountry = new Map<string, Record<string, string>>();

  for (const row of parsed.data) {
    const geoId = row.geoId?.trim();
    const countriesAndTerritories = row.countriesAndTerritories?.replace(/_/g, " ").trim();
    const dateRep = row.dateRep?.trim();
    if (!geoId || !countriesAndTerritories || !dateRep) continue;

    const current = latestByCountry.get(geoId);
    if (!current) {
      latestByCountry.set(geoId, row);
      continue;
    }

    const currentDate = new Date(parseEcdcDate(current.dateRep ?? "")).getTime();
    const nextDate = new Date(parseEcdcDate(dateRep)).getTime();
    if (nextDate > currentDate) {
      latestByCountry.set(geoId, row);
    }
  }

  return Array.from(latestByCountry.entries()).map(([geoId, row]) =>
    baseMetric({
      virus: "COVID-19",
      slug: "covid-19",
      region: (row.countriesAndTerritories ?? geoId).replace(/_/g, " "),
      locationLevel: "country",
      countryName: (row.countriesAndTerritories ?? geoId).replace(/_/g, " "),
      source: "ecdc-covid",
      sourceConfidence: 0.88,
      countryCode: geoId,
      latitude: 0,
      longitude: 0,
      activeCases: toSafeNumber(row.cases),
      confirmedCases: toSafeNumber(row.cases),
      deaths: toSafeNumber(row.deaths),
      recovered: 0,
      updatedAt: parseEcdcDate(row.dateRep ?? ""),
    }),
  );
}

export const ecdcCovidAdapter: MetricsAdapter = {
  id: "ecdc-covid",
  sourceName: "ecdc-covid",
  kind: "metrics",
  fetchMetrics,
};
