import type { RegionMetric } from "@/lib/types";
import { buildLocationId } from "@/server/data/location-normalization";

import type { MetricsAdapter } from "./types";

/**
 * WHO Global Health Observatory (GHO) OData API.
 *
 * This adapter pulls ANNUAL, country-level totals (no key required) for two
 * indicators that don't have a daily/near-real-time source elsewhere:
 *   - CHOLERA_0000000001: reported cholera cases
 *   - WHS3_62: reported measles cases
 *
 * Because the underlying data is a single figure per country per calendar
 * year (not a rolling "active" count), there is no honest way to derive an
 * "active cases" number. `activeCases` is therefore set equal to the annual
 * `confirmedCases` total as a documented, conservative proxy — it is NOT a
 * true active-case count and callers must not treat it as one. `deaths` is
 * left at 0 because neither GHO indicator reports fatalities.
 *
 * This is annual, retrospective data — deliberately NOT wired to any
 * trajectory/forecast provider, since faking a daily trajectory out of a
 * single yearly total would misrepresent the source.
 */

const GHO_API_BASE = "https://ghoapi.azureedge.net/api";

interface GhoIndicatorConfig {
  code: string;
  virus: string;
  slug: string;
}

const INDICATORS: readonly GhoIndicatorConfig[] = [
  { code: "CHOLERA_0000000001", virus: "Cholera", slug: "cholera" },
  { code: "WHS3_62", virus: "Measles", slug: "measles" },
];

/** Keep the result set from flooding the map: top N countries by case count per indicator. */
const MAX_COUNTRIES_PER_INDICATOR = 40;

interface GhoRow {
  SpatialDimType?: string;
  SpatialDim?: string;
  TimeDimType?: string;
  TimeDim?: number;
  NumericValue?: number | null;
  Value?: string | null;
}

interface GhoResponse {
  value?: GhoRow[];
}

/**
 * Small, self-contained ISO3 -> (ISO2, centroid) lookup for the countries
 * WHO GHO most commonly reports non-zero cholera/measles totals for, plus a
 * handful of large/high-population countries so bigger outbreaks elsewhere
 * still resolve. Rows for ISO3 codes not present here are skipped (and
 * counted) rather than guessed at.
 */
const COUNTRY_CENTROIDS: Record<string, { iso2: string; name: string; lat: number; lng: number }> = {
  AFG: { iso2: "AF", name: "Afghanistan", lat: 33.9391, lng: 67.71 },
  AGO: { iso2: "AO", name: "Angola", lat: -11.2027, lng: 17.8739 },
  ARG: { iso2: "AR", name: "Argentina", lat: -38.4161, lng: -63.6167 },
  BGD: { iso2: "BD", name: "Bangladesh", lat: 23.685, lng: 90.3563 },
  BRA: { iso2: "BR", name: "Brazil", lat: -14.235, lng: -51.9253 },
  BFA: { iso2: "BF", name: "Burkina Faso", lat: 12.2383, lng: -1.5616 },
  CMR: { iso2: "CM", name: "Cameroon", lat: 7.3697, lng: 12.3547 },
  CAF: { iso2: "CF", name: "Central African Republic", lat: 6.6111, lng: 20.9394 },
  TCD: { iso2: "TD", name: "Chad", lat: 15.4542, lng: 18.7322 },
  CHN: { iso2: "CN", name: "China", lat: 35.8617, lng: 104.1954 },
  COD: { iso2: "CD", name: "Democratic Republic of the Congo", lat: -4.0383, lng: 21.7587 },
  COG: { iso2: "CG", name: "Congo", lat: -0.228, lng: 15.8277 },
  EGY: { iso2: "EG", name: "Egypt", lat: 26.8206, lng: 30.8025 },
  ETH: { iso2: "ET", name: "Ethiopia", lat: 9.145, lng: 40.4897 },
  GHA: { iso2: "GH", name: "Ghana", lat: 7.9465, lng: -1.0232 },
  HTI: { iso2: "HT", name: "Haiti", lat: 18.9712, lng: -72.2852 },
  IND: { iso2: "IN", name: "India", lat: 20.5937, lng: 78.9629 },
  IDN: { iso2: "ID", name: "Indonesia", lat: -0.7893, lng: 113.9213 },
  IRQ: { iso2: "IQ", name: "Iraq", lat: 33.2232, lng: 43.6793 },
  KEN: { iso2: "KE", name: "Kenya", lat: -0.0236, lng: 37.9062 },
  MDG: { iso2: "MG", name: "Madagascar", lat: -18.7669, lng: 46.8691 },
  MWI: { iso2: "MW", name: "Malawi", lat: -13.2543, lng: 34.3015 },
  MLI: { iso2: "ML", name: "Mali", lat: 17.5707, lng: -3.9962 },
  MRT: { iso2: "MR", name: "Mauritania", lat: 21.0079, lng: -10.9408 },
  MOZ: { iso2: "MZ", name: "Mozambique", lat: -18.6657, lng: 35.5296 },
  MMR: { iso2: "MM", name: "Myanmar", lat: 21.9162, lng: 95.956 },
  NPL: { iso2: "NP", name: "Nepal", lat: 28.3949, lng: 84.124 },
  NER: { iso2: "NE", name: "Niger", lat: 17.6078, lng: 8.0817 },
  NGA: { iso2: "NG", name: "Nigeria", lat: 9.082, lng: 8.6753 },
  PAK: { iso2: "PK", name: "Pakistan", lat: 30.3753, lng: 69.3451 },
  PHL: { iso2: "PH", name: "Philippines", lat: 12.8797, lng: 121.774 },
  RUS: { iso2: "RU", name: "Russia", lat: 61.524, lng: 105.3188 },
  SOM: { iso2: "SO", name: "Somalia", lat: 5.1521, lng: 46.1996 },
  ZAF: { iso2: "ZA", name: "South Africa", lat: -30.5595, lng: 22.9375 },
  SSD: { iso2: "SS", name: "South Sudan", lat: 6.877, lng: 31.307 },
  SDN: { iso2: "SD", name: "Sudan", lat: 12.8628, lng: 30.2176 },
  SYR: { iso2: "SY", name: "Syria", lat: 34.8021, lng: 38.9968 },
  TZA: { iso2: "TZ", name: "Tanzania", lat: -6.369, lng: 34.8888 },
  UGA: { iso2: "UG", name: "Uganda", lat: 1.3733, lng: 32.2903 },
  UKR: { iso2: "UA", name: "Ukraine", lat: 48.3794, lng: 31.1656 },
  USA: { iso2: "US", name: "United States", lat: 37.0902, lng: -95.7129 },
  VNM: { iso2: "VN", name: "Vietnam", lat: 14.0583, lng: 108.2772 },
  YEM: { iso2: "YE", name: "Yemen", lat: 15.5527, lng: 48.5164 },
  ZMB: { iso2: "ZM", name: "Zambia", lat: -13.1339, lng: 27.8493 },
  ZWE: { iso2: "ZW", name: "Zimbabwe", lat: -19.0154, lng: 29.1549 },
  GBR: { iso2: "GB", name: "United Kingdom", lat: 55.3781, lng: -3.436 },
  FRA: { iso2: "FR", name: "France", lat: 46.2276, lng: 2.2137 },
  DEU: { iso2: "DE", name: "Germany", lat: 51.1657, lng: 10.4515 },
  ITA: { iso2: "IT", name: "Italy", lat: 41.8719, lng: 12.5674 },
  ESP: { iso2: "ES", name: "Spain", lat: 40.4637, lng: -3.7492 },
  MEX: { iso2: "MX", name: "Mexico", lat: 23.6345, lng: -102.5528 },
  COL: { iso2: "CO", name: "Colombia", lat: 4.5709, lng: -74.2973 },
  PER: { iso2: "PE", name: "Peru", lat: -9.19, lng: -75.0152 },
  VEN: { iso2: "VE", name: "Venezuela", lat: 6.4238, lng: -66.5897 },
  THA: { iso2: "TH", name: "Thailand", lat: 15.87, lng: 100.9925 },
  JPN: { iso2: "JP", name: "Japan", lat: 36.2048, lng: 138.2529 },
  KOR: { iso2: "KR", name: "South Korea", lat: 35.9078, lng: 127.7669 },
  AUS: { iso2: "AU", name: "Australia", lat: -25.2744, lng: 133.7751 },
  CAN: { iso2: "CA", name: "Canada", lat: 56.1304, lng: -106.3468 },
  SAU: { iso2: "SA", name: "Saudi Arabia", lat: 23.8859, lng: 45.0792 },
  DZA: { iso2: "DZ", name: "Algeria", lat: 28.0339, lng: 1.6596 },
  MAR: { iso2: "MA", name: "Morocco", lat: 31.7917, lng: -7.0926 },
};

function toSafeNumber(row: GhoRow): number | null {
  if (typeof row.NumericValue === "number" && Number.isFinite(row.NumericValue)) {
    return row.NumericValue;
  }
  if (typeof row.Value === "string") {
    const parsed = Number(row.Value.replace(/,/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function baseMetric(input: Omit<RegionMetric, "locationId">): RegionMetric {
  return {
    ...input,
    locationId: buildLocationId(input),
  };
}

/** Reduce raw GHO rows down to the latest-year figure per ISO3 country code. */
function latestPerCountry(rows: GhoRow[]): Map<string, { year: number; value: number }> {
  const latest = new Map<string, { year: number; value: number }>();

  for (const row of rows) {
    if (row.SpatialDimType !== "COUNTRY") continue;
    const iso3 = row.SpatialDim;
    if (!iso3) continue;

    const year = row.TimeDim;
    if (typeof year !== "number" || !Number.isFinite(year)) continue;

    const value = toSafeNumber(row);
    if (value === null) continue;

    const existing = latest.get(iso3);
    if (!existing || year > existing.year) {
      latest.set(iso3, { year, value });
    }
  }

  return latest;
}

async function fetchIndicator(indicator: GhoIndicatorConfig, signal?: AbortSignal): Promise<RegionMetric[]> {
  const response = await fetch(`${GHO_API_BASE}/${indicator.code}`, {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(`WHO GHO feed (${indicator.code}) failed with status ${response.status}`);
  }

  const payload = (await response.json()) as GhoResponse;
  const rows = payload.value ?? [];

  const perCountry = latestPerCountry(rows);

  const topCountries = Array.from(perCountry.entries())
    .sort((a, b) => b[1].value - a[1].value)
    .slice(0, MAX_COUNTRIES_PER_INDICATOR);

  let skipped = 0;
  const metrics: RegionMetric[] = [];

  for (const [iso3, { year, value }] of topCountries) {
    const centroid = COUNTRY_CENTROIDS[iso3];
    if (!centroid) {
      skipped += 1;
      continue;
    }

    metrics.push(
      baseMetric({
        virus: indicator.virus,
        slug: indicator.slug,
        region: centroid.name,
        locationLevel: "country",
        countryName: centroid.name,
        source: "who-gho",
        sourceConfidence: 0.85,
        countryCode: centroid.iso2,
        latitude: centroid.lat,
        longitude: centroid.lng,
        // Annual totals only — no true "active" figure exists, so we use the
        // yearly confirmed total as a documented, conservative proxy. See
        // module docblock.
        activeCases: value,
        confirmedCases: value,
        deaths: 0,
        recovered: 0,
        updatedAt: new Date(Date.UTC(year, 11, 31)).toISOString(),
        asOf: String(year),
      }),
    );
  }

  if (skipped > 0) {
    console.warn(`[who-gho] skipped ${skipped} country row(s) for ${indicator.code}: no centroid mapping`);
  }

  return metrics;
}

async function fetchMetrics(signal?: AbortSignal): Promise<RegionMetric[]> {
  const results = await Promise.all(INDICATORS.map((indicator) => fetchIndicator(indicator, signal)));
  return results.flat();
}

export const whoGhoAdapter: MetricsAdapter = {
  id: "who-gho",
  sourceName: "WHO Global Health Observatory",
  kind: "metrics",
  fetchMetrics,
};
