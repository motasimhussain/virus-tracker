import type { RegionMetric, Trend, TrajectoryPoint } from "@/lib/types";
import { buildLocationId } from "@/server/data/location-normalization";

import type { MetricsAdapter } from "./types";

/**
 * CMU Delphi Epidata "fluview" endpoint (CDC ILINet, redistributed by the Delphi group).
 * Docs: https://cmu-delphi.github.io/delphi-epidata/api/fluview.html
 *
 * Response shape:
 *   { result: 1 | 0 | -1 | -2, epidata: FluViewEpidataRow[], message: string }
 *
 * Each row is one (region, epiweek) observation. We request the national series
 * ("nat") plus the ten HHS regions ("hhs1".."hhs10") over the most recent
 * ~12 epiweeks, then keep only the latest observation per region for the
 * snapshot (fetchMetrics) and the full national series for the trajectory
 * provider (influenzaTrajectoryProvider).
 */

const DELPHI_FLUVIEW_URL = "https://api.delphi.cmu.edu/epidata/fluview/";
const USER_AGENT =
  "virus-tracker/1.0 (+https://virus-tracker.example; influenza dashboard adapter; contact: motasimhussain@gmail.com)";
const SOURCE_CONFIDENCE = 0.9;
const EPIWEEKS_TO_FETCH = 12;

const HHS_REGION_KEYS = [
  "hhs1",
  "hhs2",
  "hhs3",
  "hhs4",
  "hhs5",
  "hhs6",
  "hhs7",
  "hhs8",
  "hhs9",
  "hhs10",
] as const;

type HhsRegionKey = (typeof HHS_REGION_KEYS)[number];

const NATIONAL_REGION_KEY = "nat";

const ALL_REGION_KEYS = [NATIONAL_REGION_KEY, ...HHS_REGION_KEYS];

/** Approximate representative coordinates for each HHS region (regional office city). */
const HHS_REGION_METADATA: Record<HhsRegionKey, { code: string; name: string; latitude: number; longitude: number }> = {
  hhs1: { code: "us-hhs1", name: "HHS Region 1 (Boston)", latitude: 42.3601, longitude: -71.0589 },
  hhs2: { code: "us-hhs2", name: "HHS Region 2 (New York)", latitude: 40.7128, longitude: -74.006 },
  hhs3: { code: "us-hhs3", name: "HHS Region 3 (Philadelphia)", latitude: 39.9526, longitude: -75.1652 },
  hhs4: { code: "us-hhs4", name: "HHS Region 4 (Atlanta)", latitude: 33.749, longitude: -84.388 },
  hhs5: { code: "us-hhs5", name: "HHS Region 5 (Chicago)", latitude: 41.8781, longitude: -87.6298 },
  hhs6: { code: "us-hhs6", name: "HHS Region 6 (Dallas)", latitude: 32.7767, longitude: -96.797 },
  hhs7: { code: "us-hhs7", name: "HHS Region 7 (Kansas City)", latitude: 39.0997, longitude: -94.5786 },
  hhs8: { code: "us-hhs8", name: "HHS Region 8 (Denver)", latitude: 39.7392, longitude: -104.9903 },
  hhs9: { code: "us-hhs9", name: "HHS Region 9 (San Francisco)", latitude: 37.7749, longitude: -122.4194 },
  hhs10: { code: "us-hhs10", name: "HHS Region 10 (Seattle)", latitude: 47.6062, longitude: -122.3321 },
};

const US_CENTROID = { latitude: 37.09, longitude: -95.71 };

function isHhsRegionKey(value: string): value is HhsRegionKey {
  return (HHS_REGION_KEYS as readonly string[]).includes(value);
}

export type FluViewEpidataRow = {
  region: string;
  epiweek: number;
  /** Weighted (population-adjusted) influenza-like-illness percentage. */
  wili?: number;
  /** Unweighted influenza-like-illness percentage. */
  ili?: number;
  num_ili?: number;
  num_patients?: number;
  num_providers?: number;
};

type FluViewResponse = {
  result: number;
  epidata?: FluViewEpidataRow[];
  message?: string;
};

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

/**
 * Epiweek <-> date conversion.
 *
 * CDC/MMWR epi weeks run Sunday - Saturday. "Week 1" of an epi-year is defined
 * as the Sunday-Saturday week that contains January 4th of that year (this is
 * equivalent to "the first week with >= 4 days in the calendar year"). Every
 * later week is simply 7-day increments from that anchor. This mirrors the
 * definition used by the CDC and by the Delphi `epiweeks` PyPI/JS packages.
 *
 * `epiweek` values are encoded as `YYYYWW` integers (e.g. 202601 = 2026, week 1),
 * matching the format returned by the Delphi Epidata API.
 */
function epiweekYearStart(year: number): Date {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Weekday = jan4.getUTCDay(); // 0 = Sunday
  const start = new Date(jan4);
  start.setUTCDate(jan4.getUTCDate() - jan4Weekday);
  return start;
}

function epiweekToDateRange(epiweek: number): { start: Date; end: Date } {
  const year = Math.floor(epiweek / 100);
  const week = epiweek % 100;
  const yearStart = epiweekYearStart(year);
  const start = new Date(yearStart);
  start.setUTCDate(yearStart.getUTCDate() + (week - 1) * 7);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  return { start, end };
}

/** Returns the ISO (YYYY-MM-DD) date of the last day (Saturday) of the given epiweek. */
export function epiweekToDate(epiweek: number): string {
  return epiweekToDateRange(epiweek).end.toISOString().slice(0, 10);
}

/** Computes the CDC/MMWR epiweek (YYYYWW) containing the given date. */
export function dateToEpiweek(date: Date): number {
  const calendarYear = date.getUTCFullYear();
  for (const candidateYear of [calendarYear - 1, calendarYear, calendarYear + 1]) {
    const thisYearStart = epiweekYearStart(candidateYear);
    const nextYearStart = epiweekYearStart(candidateYear + 1);
    if (date.getTime() >= thisYearStart.getTime() && date.getTime() < nextYearStart.getTime()) {
      const diffDays = Math.round((date.getTime() - thisYearStart.getTime()) / 86_400_000);
      const week = Math.floor(diffDays / 7) + 1;
      return candidateYear * 100 + week;
    }
  }
  throw new Error(`Unable to compute epiweek for date ${date.toISOString()}`);
}

function subtractEpiweeks(epiweek: number, count: number): number {
  const { start } = epiweekToDateRange(epiweek);
  const shifted = new Date(start);
  shifted.setUTCDate(shifted.getUTCDate() - count * 7);
  return dateToEpiweek(shifted);
}

function buildEpiweekRangeParam(): string {
  const endEpiweek = dateToEpiweek(new Date());
  const startEpiweek = subtractEpiweeks(endEpiweek, EPIWEEKS_TO_FETCH - 1);
  return `${startEpiweek}-${endEpiweek}`;
}

async function fetchFluViewEpidata(signal?: AbortSignal): Promise<FluViewEpidataRow[]> {
  const url = `${DELPHI_FLUVIEW_URL}?regions=${ALL_REGION_KEYS.join(",")}&epiweeks=${buildEpiweekRangeParam()}`;

  const response = await fetch(url, {
    cache: "no-store",
    signal,
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    throw new Error(`Delphi FluView feed failed with status ${response.status}`);
  }

  const payload = (await response.json()) as FluViewResponse;

  if (payload.result !== 1 || !Array.isArray(payload.epidata) || payload.epidata.length === 0) {
    throw new Error(
      `Delphi FluView feed returned no usable data (result=${payload.result}, message=${payload.message ?? "n/a"})`,
    );
  }

  return payload.epidata;
}

/** Groups rows by region and returns the latest and second-latest epiweek observation for each. */
function latestTwoByRegion(
  rows: FluViewEpidataRow[],
): Map<string, { latest: FluViewEpidataRow; previous?: FluViewEpidataRow }> {
  const byRegion = new Map<string, FluViewEpidataRow[]>();
  for (const row of rows) {
    const existing = byRegion.get(row.region);
    if (existing) {
      existing.push(row);
    } else {
      byRegion.set(row.region, [row]);
    }
  }

  const result = new Map<string, { latest: FluViewEpidataRow; previous?: FluViewEpidataRow }>();
  for (const [region, regionRows] of byRegion) {
    const sorted = [...regionRows].sort((a, b) => b.epiweek - a.epiweek);
    const latest = sorted[0];
    if (!latest) continue;
    result.set(region, { latest, previous: sorted[1] });
  }
  return result;
}

/** ILI percentage points (wili preferred, falling back to unweighted ili). */
function iliPercent(row: FluViewEpidataRow): number {
  return toSafeNumber(row.wili ?? row.ili);
}

function computeTrend(latest: FluViewEpidataRow, previous: FluViewEpidataRow | undefined): Trend | undefined {
  if (!previous) return undefined;
  const previousValue = iliPercent(previous);
  if (previousValue === 0) return undefined;

  const latestValue = iliPercent(latest);
  const relativeChange = (latestValue - previousValue) / previousValue;

  if (relativeChange > 0.05) return "rising";
  if (relativeChange < -0.05) return "falling";
  return "stable";
}

function mapRegionRow(
  regionKey: string,
  latest: FluViewEpidataRow,
  previous: FluViewEpidataRow | undefined,
): RegionMetric | null {
  const { end } = epiweekToDateRange(latest.epiweek);
  const asOf = end.toISOString().slice(0, 10);
  const updatedAt = end.toISOString();

  const numIli = toSafeNumber(latest.num_ili);
  const numPatients = toSafeNumber(latest.num_patients);
  // Proxy: wili is a weighted ILI *percentage*; multiplying by 1000 gives a
  // rough population-scale incidence proxy (not a true per-100k rate, since
  // ILINet reports a sentinel-provider percentage, not a population count).
  const incidencePer100k = Number((iliPercent(latest) * 1000).toFixed(2));
  const trend = computeTrend(latest, previous);

  const shared = {
    virus: "Influenza",
    slug: "influenza",
    source: "delphi-fluview",
    sourceConfidence: SOURCE_CONFIDENCE,
    // num_ili (patients presenting with influenza-like illness) is used as an
    // "active cases" proxy; num_patients (total sentinel-provider visits) is
    // surfaced as context via confirmedCases (total encounters, not confirmed flu).
    activeCases: numIli,
    confirmedCases: numPatients,
    deaths: 0,
    recovered: 0,
    incidencePer100k,
    asOf,
    updatedAt,
    ...(trend ? { trend } : {}),
  };

  if (regionKey === NATIONAL_REGION_KEY) {
    return baseMetric({
      ...shared,
      region: "United States",
      locationLevel: "country",
      countryName: "United States",
      countryCode: "US",
      latitude: US_CENTROID.latitude,
      longitude: US_CENTROID.longitude,
    });
  }

  if (!isHhsRegionKey(regionKey)) {
    return null;
  }

  const meta = HHS_REGION_METADATA[regionKey];
  return baseMetric({
    ...shared,
    region: meta.name,
    locationLevel: "admin1",
    countryName: "United States",
    admin1Name: meta.name,
    admin1Code: meta.code,
    countryCode: "US",
    latitude: meta.latitude,
    longitude: meta.longitude,
  });
}

async function fetchMetrics(signal?: AbortSignal): Promise<RegionMetric[]> {
  const epidata = await fetchFluViewEpidata(signal);
  const byRegion = latestTwoByRegion(epidata);

  const rows: RegionMetric[] = [];
  for (const [regionKey, { latest, previous }] of byRegion) {
    const metric = mapRegionRow(regionKey, latest, previous);
    if (metric) rows.push(metric);
  }

  return rows;
}

export const delphiFluViewAdapter: MetricsAdapter = {
  id: "delphi-fluview",
  sourceName: "CDC FluView via CMU Delphi",
  kind: "metrics",
  fetchMetrics,
};

/**
 * Minimal shape for a trajectory provider, matched to the revamp's per-virus
 * trajectory pipeline. Kept local to this adapter since the shared type is
 * owned by another task; the field names intentionally mirror it.
 */
export type TrajectoryProvider = {
  virusSlug: string;
  fetchTrajectory(signal?: AbortSignal): Promise<TrajectoryPoint[]>;
};

async function fetchInfluenzaTrajectory(signal?: AbortSignal): Promise<TrajectoryPoint[]> {
  const epidata = await fetchFluViewEpidata(signal);
  const nationalSeries = epidata
    .filter((row) => row.region === NATIONAL_REGION_KEY)
    .sort((a, b) => a.epiweek - b.epiweek);

  return nationalSeries.map((row) => {
    const numIli = toSafeNumber(row.num_ili);
    const numPatients = toSafeNumber(row.num_patients);
    // Wider confidence band when the sentinel-provider sample (num_patients) is
    // small, narrower when it's large; clamped to a sane range.
    const uncertainty = numPatients > 0 ? Math.min(0.25, Math.max(0.05, 5000 / numPatients)) : 0.2;

    return {
      date: epiweekToDate(row.epiweek),
      projectedCases: Math.round(numIli),
      confidenceLow: Math.round(numIli * (1 - uncertainty)),
      confidenceHigh: Math.round(numIli * (1 + uncertainty)),
      isSynthetic: false,
    };
  });
}

export const influenzaTrajectoryProvider: TrajectoryProvider = {
  virusSlug: "influenza",
  fetchTrajectory: fetchInfluenzaTrajectory,
};
