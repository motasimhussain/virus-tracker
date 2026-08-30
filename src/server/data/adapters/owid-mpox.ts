import Papa from "papaparse";

import type { RegionMetric, Trend, TrajectoryPoint } from "@/lib/types";
import { buildLocationId } from "@/server/data/location-normalization";

import type { MetricsAdapter } from "./types";

/**
 * OWID mpox (monkeypox) feed.
 *
 * https://raw.githubusercontent.com/owid/monkeypox/main/owid-monkeypox-data.csv
 * is a long-format daily CSV: one row per (location, date) with columns
 * including location, iso_code, date, total_cases, total_deaths, new_cases,
 * new_cases_smoothed (verified against a live pull of the feed — see the
 * trimmed fixture in __fixtures__/owid-mpox-sample.csv).
 *
 * `location` also carries continent/world aggregate rows: "World" (iso_code
 * is blank) and six regions with iso_code "OWID_AFR" / "OWID_ASI" / ... —
 * both shapes are skipped by `isAggregateRow` for the per-country metrics
 * adapter. The "World" rows are exactly what `mpoxTrajectoryProvider` uses
 * to build the global trajectory.
 */

const OWID_MPOX_CSV_URL = "https://raw.githubusercontent.com/owid/monkeypox/main/owid-monkeypox-data.csv";

const CONFIDENCE_BAND_RATIO = 0.1;
/** Rolling window (days) used to approximate an "active cases" figure from daily new-case counts, since mpox has no reported active/recovered totals. */
const ACTIVE_CASES_WINDOW_DAYS = 21;
const TRAJECTORY_WINDOW_DAYS = 90;

export type OwidMpoxRow = {
  location: string;
  iso_code: string;
  date: string;
  total_cases: string;
  total_deaths: string;
  new_cases: string;
  new_deaths: string;
  new_cases_smoothed: string;
  new_deaths_smoothed: string;
};

/**
 * ISO3 -> (ISO2, approximate centroid) lookup for every country the OWID
 * mpox feed reports rows for. Countries whose ISO3 code is not present here
 * are skipped (rather than guessed at) by `buildMpoxMetrics`.
 */
const COUNTRY_INFO: Record<string, { iso2: string; lat: number; lon: number }> = {
  ALB: { iso2: "AL", lat: 41.15, lon: 20.17 },
  AND: { iso2: "AD", lat: 42.55, lon: 1.58 },
  AGO: { iso2: "AO", lat: -11.2, lon: 17.87 },
  ARG: { iso2: "AR", lat: -38.42, lon: -63.62 },
  ABW: { iso2: "AW", lat: 12.52, lon: -69.97 },
  AUS: { iso2: "AU", lat: -25.27, lon: 133.78 },
  AUT: { iso2: "AT", lat: 47.52, lon: 14.55 },
  AZE: { iso2: "AZ", lat: 40.14, lon: 47.58 },
  BHS: { iso2: "BS", lat: 25.03, lon: -77.4 },
  BHR: { iso2: "BH", lat: 26.07, lon: 50.56 },
  BRB: { iso2: "BB", lat: 13.19, lon: -59.54 },
  BEL: { iso2: "BE", lat: 50.5, lon: 4.47 },
  BEN: { iso2: "BJ", lat: 9.31, lon: 2.32 },
  BMU: { iso2: "BM", lat: 32.32, lon: -64.75 },
  BOL: { iso2: "BO", lat: -16.29, lon: -63.59 },
  BIH: { iso2: "BA", lat: 43.92, lon: 17.68 },
  BRA: { iso2: "BR", lat: -14.24, lon: -51.93 },
  BGR: { iso2: "BG", lat: 42.73, lon: 25.49 },
  BDI: { iso2: "BI", lat: -3.37, lon: 29.92 },
  KHM: { iso2: "KH", lat: 12.57, lon: 104.99 },
  CMR: { iso2: "CM", lat: 7.37, lon: 12.35 },
  CAN: { iso2: "CA", lat: 56.13, lon: -106.35 },
  CAF: { iso2: "CF", lat: 6.61, lon: 20.94 },
  CHL: { iso2: "CL", lat: -35.68, lon: -71.54 },
  CHN: { iso2: "CN", lat: 35.86, lon: 104.2 },
  COL: { iso2: "CO", lat: 4.57, lon: -74.3 },
  COM: { iso2: "KM", lat: -11.88, lon: 43.87 },
  COG: { iso2: "CG", lat: -0.23, lon: 15.83 },
  CRI: { iso2: "CR", lat: 9.75, lon: -83.75 },
  CIV: { iso2: "CI", lat: 7.54, lon: -5.55 },
  HRV: { iso2: "HR", lat: 45.1, lon: 15.2 },
  CUB: { iso2: "CU", lat: 21.52, lon: -77.78 },
  CUW: { iso2: "CW", lat: 12.17, lon: -68.99 },
  CYP: { iso2: "CY", lat: 35.13, lon: 33.43 },
  CZE: { iso2: "CZ", lat: 49.82, lon: 15.47 },
  COD: { iso2: "CD", lat: -4.04, lon: 21.76 },
  DNK: { iso2: "DK", lat: 56.26, lon: 9.5 },
  DOM: { iso2: "DO", lat: 18.74, lon: -70.16 },
  ECU: { iso2: "EC", lat: -1.83, lon: -78.18 },
  EGY: { iso2: "EG", lat: 26.82, lon: 30.8 },
  SLV: { iso2: "SV", lat: 13.79, lon: -88.9 },
  EST: { iso2: "EE", lat: 58.6, lon: 25.01 },
  ETH: { iso2: "ET", lat: 9.15, lon: 40.49 },
  FIN: { iso2: "FI", lat: 61.92, lon: 25.75 },
  FRA: { iso2: "FR", lat: 46.23, lon: 2.21 },
  GAB: { iso2: "GA", lat: -0.8, lon: 11.61 },
  GMB: { iso2: "GM", lat: 13.44, lon: -15.31 },
  GEO: { iso2: "GE", lat: 42.32, lon: 43.36 },
  DEU: { iso2: "DE", lat: 51.17, lon: 10.45 },
  GHA: { iso2: "GH", lat: 7.95, lon: -1.02 },
  GIB: { iso2: "GI", lat: 36.14, lon: -5.35 },
  GRC: { iso2: "GR", lat: 39.07, lon: 21.82 },
  GRL: { iso2: "GL", lat: 71.71, lon: -42.6 },
  GLP: { iso2: "GP", lat: 16.27, lon: -61.55 },
  GUM: { iso2: "GU", lat: 13.44, lon: 144.79 },
  GTM: { iso2: "GT", lat: 15.78, lon: -90.23 },
  GIN: { iso2: "GN", lat: 9.95, lon: -9.7 },
  GUY: { iso2: "GY", lat: 4.86, lon: -58.93 },
  HND: { iso2: "HN", lat: 15.2, lon: -86.24 },
  HUN: { iso2: "HU", lat: 47.16, lon: 19.5 },
  ISL: { iso2: "IS", lat: 64.96, lon: -19.02 },
  IND: { iso2: "IN", lat: 20.59, lon: 78.96 },
  IDN: { iso2: "ID", lat: -0.79, lon: 113.92 },
  IRN: { iso2: "IR", lat: 32.43, lon: 53.69 },
  IRL: { iso2: "IE", lat: 53.14, lon: -7.69 },
  ISR: { iso2: "IL", lat: 31.05, lon: 34.85 },
  ITA: { iso2: "IT", lat: 41.87, lon: 12.57 },
  JAM: { iso2: "JM", lat: 18.11, lon: -77.3 },
  JPN: { iso2: "JP", lat: 36.2, lon: 138.25 },
  JOR: { iso2: "JO", lat: 30.59, lon: 36.24 },
  KEN: { iso2: "KE", lat: -0.02, lon: 37.91 },
  XKX: { iso2: "XK", lat: 42.6, lon: 20.9 },
  KWT: { iso2: "KW", lat: 29.31, lon: 47.48 },
  LAO: { iso2: "LA", lat: 19.86, lon: 102.5 },
  LVA: { iso2: "LV", lat: 56.88, lon: 24.6 },
  LBN: { iso2: "LB", lat: 33.85, lon: 35.86 },
  LBR: { iso2: "LR", lat: 6.43, lon: -9.43 },
  LTU: { iso2: "LT", lat: 55.17, lon: 23.88 },
  LUX: { iso2: "LU", lat: 49.82, lon: 6.13 },
  MDG: { iso2: "MG", lat: -18.77, lon: 46.87 },
  MWI: { iso2: "MW", lat: -13.25, lon: 34.3 },
  MYS: { iso2: "MY", lat: 4.21, lon: 101.98 },
  MLI: { iso2: "ML", lat: 17.57, lon: -4.0 },
  MLT: { iso2: "MT", lat: 35.94, lon: 14.38 },
  MTQ: { iso2: "MQ", lat: 14.64, lon: -61.02 },
  MUS: { iso2: "MU", lat: -20.35, lon: 57.55 },
  MEX: { iso2: "MX", lat: 23.63, lon: -102.55 },
  MDA: { iso2: "MD", lat: 47.41, lon: 28.37 },
  MCO: { iso2: "MC", lat: 43.75, lon: 7.41 },
  MNE: { iso2: "ME", lat: 42.71, lon: 19.37 },
  MAR: { iso2: "MA", lat: 31.79, lon: -7.09 },
  MOZ: { iso2: "MZ", lat: -18.67, lon: 35.53 },
  NAM: { iso2: "NA", lat: -22.96, lon: 18.49 },
  NPL: { iso2: "NP", lat: 28.39, lon: 84.12 },
  NLD: { iso2: "NL", lat: 52.13, lon: 5.29 },
  NCL: { iso2: "NC", lat: -20.9, lon: 165.62 },
  NZL: { iso2: "NZ", lat: -40.9, lon: 174.89 },
  NGA: { iso2: "NG", lat: 9.08, lon: 8.68 },
  MKD: { iso2: "MK", lat: 41.61, lon: 21.75 },
  NOR: { iso2: "NO", lat: 60.47, lon: 8.47 },
  OMN: { iso2: "OM", lat: 21.51, lon: 55.92 },
  PAK: { iso2: "PK", lat: 30.38, lon: 69.35 },
  PAN: { iso2: "PA", lat: 8.54, lon: -80.78 },
  PRY: { iso2: "PY", lat: -23.44, lon: -58.44 },
  PER: { iso2: "PE", lat: -9.19, lon: -75.02 },
  PHL: { iso2: "PH", lat: 12.88, lon: 121.77 },
  POL: { iso2: "PL", lat: 51.92, lon: 19.15 },
  PRT: { iso2: "PT", lat: 39.4, lon: -8.22 },
  QAT: { iso2: "QA", lat: 25.35, lon: 51.18 },
  ROU: { iso2: "RO", lat: 45.94, lon: 24.97 },
  RUS: { iso2: "RU", lat: 61.52, lon: 105.32 },
  RWA: { iso2: "RW", lat: -1.94, lon: 29.87 },
  MAF: { iso2: "MF", lat: 18.08, lon: -63.05 },
  SMR: { iso2: "SM", lat: 43.94, lon: 12.46 },
  SAU: { iso2: "SA", lat: 23.89, lon: 45.08 },
  SEN: { iso2: "SN", lat: 14.5, lon: -14.45 },
  SRB: { iso2: "RS", lat: 44.02, lon: 21.01 },
  SLE: { iso2: "SL", lat: 8.46, lon: -11.78 },
  SGP: { iso2: "SG", lat: 1.35, lon: 103.82 },
  SVK: { iso2: "SK", lat: 48.67, lon: 19.7 },
  SVN: { iso2: "SI", lat: 46.15, lon: 14.99 },
  ZAF: { iso2: "ZA", lat: -30.56, lon: 22.94 },
  KOR: { iso2: "KR", lat: 35.91, lon: 127.77 },
  SSD: { iso2: "SS", lat: 6.88, lon: 31.31 },
  ESP: { iso2: "ES", lat: 40.46, lon: -3.75 },
  LKA: { iso2: "LK", lat: 7.87, lon: 80.77 },
  SDN: { iso2: "SD", lat: 12.86, lon: 30.22 },
  SWE: { iso2: "SE", lat: 60.13, lon: 18.64 },
  CHE: { iso2: "CH", lat: 46.82, lon: 8.23 },
  TZA: { iso2: "TZ", lat: -6.37, lon: 34.89 },
  THA: { iso2: "TH", lat: 15.87, lon: 100.99 },
  TGO: { iso2: "TG", lat: 8.62, lon: 0.82 },
  TTO: { iso2: "TT", lat: 10.69, lon: -61.22 },
  TUR: { iso2: "TR", lat: 38.96, lon: 35.24 },
  UGA: { iso2: "UG", lat: 1.37, lon: 32.29 },
  UKR: { iso2: "UA", lat: 48.38, lon: 31.17 },
  ARE: { iso2: "AE", lat: 23.42, lon: 53.85 },
  GBR: { iso2: "GB", lat: 55.38, lon: -3.44 },
  USA: { iso2: "US", lat: 37.09, lon: -95.71 },
  URY: { iso2: "UY", lat: -32.52, lon: -55.77 },
  VEN: { iso2: "VE", lat: 6.42, lon: -66.59 },
  VNM: { iso2: "VN", lat: 14.06, lon: 108.28 },
  ZMB: { iso2: "ZM", lat: -13.13, lon: 27.85 },
  ZWE: { iso2: "ZW", lat: -19.02, lon: 29.15 },
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

/** True for continent/world aggregate rows: "World" has a blank iso_code, and continents use synthetic "OWID_*" codes. Both must be excluded from per-country metrics. */
export function isAggregateRow(row: Pick<OwidMpoxRow, "iso_code">): boolean {
  const iso = (row.iso_code ?? "").trim();
  return iso.length === 0 || iso.startsWith("OWID_");
}

export function parseOwidMpoxCsv(csv: string): OwidMpoxRow[] {
  const parsed = Papa.parse<OwidMpoxRow>(csv, { header: true, skipEmptyLines: true });
  return parsed.data;
}

/** Pure transform from parsed rows to per-country RegionMetric rows — exported for direct unit testing. */
export function buildMpoxMetrics(rows: OwidMpoxRow[]): RegionMetric[] {
  const byCountry = new Map<string, OwidMpoxRow[]>();

  for (const row of rows) {
    if (isAggregateRow(row) || !row.location) continue;
    const key = row.iso_code;
    const list = byCountry.get(key) ?? [];
    list.push(row);
    byCountry.set(key, list);
  }

  const metrics: RegionMetric[] = [];

  for (const [isoCode, countryRows] of byCountry) {
    const info = COUNTRY_INFO[isoCode];
    if (!info) continue;

    const sorted = [...countryRows].sort((a, b) => a.date.localeCompare(b.date));
    const latest = sorted[sorted.length - 1];
    if (!latest) continue;

    const last7 = sorted.slice(-7);
    const previous7 = sorted.slice(-14, -7);
    const newCases7d = Math.round(last7.reduce((sum, row) => sum + toSafeNumber(row.new_cases), 0));
    const previousNewCases7d = previous7.reduce((sum, row) => sum + toSafeNumber(row.new_cases), 0);

    // Mpox has no reported "active"/"recovered" figures, so activeCases is
    // approximated as the trailing new-case sum over a multi-week window —
    // a documented proxy for the currently-infectious population, not a
    // true active-case count.
    const activeCases = Math.max(
      0,
      Math.round(sorted.slice(-ACTIVE_CASES_WINDOW_DAYS).reduce((sum, row) => sum + toSafeNumber(row.new_cases), 0)),
    );

    let trend: Trend = "stable";
    if (newCases7d > previousNewCases7d * 1.1) trend = "rising";
    else if (newCases7d < previousNewCases7d * 0.9) trend = "falling";

    metrics.push(
      baseMetric({
        virus: "Mpox",
        slug: "mpox",
        region: latest.location,
        locationLevel: "country",
        countryName: latest.location,
        source: "owid-mpox",
        sourceConfidence: 0.9,
        countryCode: info.iso2,
        latitude: info.lat,
        longitude: info.lon,
        activeCases,
        confirmedCases: toSafeNumber(latest.total_cases),
        deaths: toSafeNumber(latest.total_deaths),
        recovered: 0,
        updatedAt: new Date(latest.date).toISOString(),
        newCases7d,
        trend,
        asOf: latest.date,
      }),
    );
  }

  return metrics;
}

async function fetchMetrics(signal?: AbortSignal): Promise<RegionMetric[]> {
  const response = await fetch(OWID_MPOX_CSV_URL, { cache: "no-store", signal });

  if (!response.ok) {
    throw new Error(`OWID mpox feed failed with status ${response.status}`);
  }

  const csv = await response.text();
  return buildMpoxMetrics(parseOwidMpoxCsv(csv));
}

export const owidMpoxAdapter: MetricsAdapter = {
  id: "owid-mpox",
  sourceName: "owid-mpox",
  kind: "metrics",
  fetchMetrics,
};

/** Pure transform from parsed rows to a global daily trajectory — exported for direct unit testing. */
export function buildMpoxTrajectory(rows: OwidMpoxRow[]): TrajectoryPoint[] {
  const worldRows = rows
    .filter((row) => row.location === "World" && row.date)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-TRAJECTORY_WINDOW_DAYS);

  return worldRows.map((row) => {
    const projectedCases = Math.round(toSafeNumber(row.new_cases_smoothed));
    return {
      date: row.date,
      projectedCases,
      confidenceLow: Math.round(projectedCases * (1 - CONFIDENCE_BAND_RATIO)),
      confidenceHigh: Math.round(projectedCases * (1 + CONFIDENCE_BAND_RATIO)),
      isSynthetic: false,
    };
  });
}

async function fetchTrajectory(signal?: AbortSignal): Promise<TrajectoryPoint[]> {
  const response = await fetch(OWID_MPOX_CSV_URL, { cache: "no-store", signal });

  if (!response.ok) {
    throw new Error(`OWID mpox feed failed with status ${response.status}`);
  }

  const csv = await response.text();
  return buildMpoxTrajectory(parseOwidMpoxCsv(csv));
}

export const mpoxTrajectoryProvider = {
  virusSlug: "mpox" as const,
  fetchTrajectory,
};
