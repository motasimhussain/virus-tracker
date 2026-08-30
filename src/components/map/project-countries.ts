/**
 * Server-only helper that projects world-atlas country geometry to SVG paths
 * and joins per-country outbreak intensity from a `RegionMetric[]` dataset.
 *
 * The topojson load + `feature()` conversion + `geoPath` projection all run
 * ONCE at module scope (hoisted) rather than per-render/per-request, since
 * the geometry itself never changes — only the joined values do.
 *
 * Join key: world-atlas topojson country features use the ISO 3166-1
 * numeric code as their `id` (e.g. "840" for the United States). We resolve
 * that to a country entry via `byNumeric`, then match `RegionMetric` rows to
 * that country by comparing `byAlpha2(item.countryCode)`. There is
 * deliberately NO name-matching anywhere in this join.
 */
import { geoMercator, geoPath } from "d3-geo";
import type { FeatureCollection } from "geojson";
import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json";

import { byAlpha2, byNumeric } from "@/lib/iso-countries";
import { getRiskLevel } from "@/lib/map-scale";
import type { RegionMetric } from "@/lib/types";

/** Shared SVG viewBox size for the world map — keep InteractiveMap in sync via these exports. */
export const MAP_WIDTH = 960;
export const MAP_HEIGHT = 440;

const projection = geoMercator()
  .center([10, 15])
  .scale(150)
  .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2]);

// Hoisted module-scope singletons — computed once per server process, not per render.
const pathBuilder = geoPath(projection);

const worldCollection = feature(
  worldAtlas as unknown as Parameters<typeof feature>[0],
  (worldAtlas as { objects: { countries: unknown } }).objects.countries as Parameters<typeof feature>[1],
) as FeatureCollection;

type GeoFeature = {
  id?: string | number;
  properties?: { name?: string };
  geometry: unknown;
};

const worldFeatures = (worldCollection.features as unknown as GeoFeature[]) ?? [];

export type ProjectedCountry = {
  /** ISO 3166-1 numeric id from the topojson feature (join key). */
  id: string;
  /** ISO alpha-2 code, or null if this geometry didn't resolve to a known country entry. */
  iso2: string | null;
  name: string;
  /** Precomputed SVG path `d` attribute for this country's geometry. */
  d: string;
  /** Aggregated value (sum of activeCases) joined from the input items, 0 if none. */
  value: number;
  /** 0 = no data; 1 (lowest) - 6 (critical) otherwise. */
  riskLevel: 0 | 1 | 2 | 3 | 4 | 5 | 6;
};

export type ProjectWorldResult = {
  countries: ProjectedCountry[];
  maxValue: number;
};

type CountryAggregate = { value: number; countryLevel: boolean };

/**
 * Projects every world-atlas country to an SVG path and joins aggregated
 * `activeCases` from `items`, by ISO numeric id.
 *
 * Aggregation per country: when at least one `locationLevel === "country"`
 * row exists for a country, only country-level rows are summed (avoids
 * double-counting against admin1/city rows for the same place); otherwise
 * all admin1/city rows for that country are summed.
 */
export function projectWorld(items: RegionMetric[]): ProjectWorldResult {
  const aggregates = new Map<string, CountryAggregate>();
  const unresolved: RegionMetric[] = [];

  for (const item of items) {
    const entry = byAlpha2(item.countryCode);
    if (!entry) {
      unresolved.push(item);
      continue;
    }

    const isCountryLevel = item.locationLevel === "country";
    const existing = aggregates.get(entry.alpha2);

    if (!existing) {
      aggregates.set(entry.alpha2, { value: item.activeCases, countryLevel: isCountryLevel });
    } else if (isCountryLevel && !existing.countryLevel) {
      // First country-level row seen for this country — it supersedes any
      // admin1/city rows summed so far.
      aggregates.set(entry.alpha2, { value: item.activeCases, countryLevel: true });
    } else if (isCountryLevel === existing.countryLevel) {
      aggregates.set(entry.alpha2, {
        value: existing.value + item.activeCases,
        countryLevel: existing.countryLevel,
      });
    }
    // else: existing is already country-level and this row is admin1/city —
    // country-level rows are preferred, so this row is skipped.
  }

  const maxValue = Math.max(0, ...Array.from(aggregates.values(), (a) => a.value));
  const renderedAlpha2 = new Set<string>();
  const countries: ProjectedCountry[] = [];

  for (const geoFeature of worldFeatures) {
    const d = pathBuilder(geoFeature as never);
    if (!d) continue;

    const entry = byNumeric(geoFeature.id);
    const alpha2 = entry?.alpha2 ?? null;
    const name = entry?.name ?? geoFeature.properties?.name ?? "Unknown";
    if (alpha2) renderedAlpha2.add(alpha2);

    const agg = alpha2 ? aggregates.get(alpha2) : undefined;
    const value = agg?.value ?? 0;
    const riskLevel = value > 0 ? getRiskLevel(value, maxValue) : 0;

    countries.push({
      id: String(geoFeature.id ?? name),
      iso2: alpha2,
      name,
      d,
      value,
      riskLevel,
    });
  }

  if (process.env.NODE_ENV !== "production") {
    const failedToJoin = [
      ...unresolved,
      ...items.filter((item) => {
        const entry = byAlpha2(item.countryCode);
        return entry ? !renderedAlpha2.has(entry.alpha2) : false;
      }),
    ];
    if (failedToJoin.length > 0) {
      console.warn(
        `[project-countries] ${failedToJoin.length} region row(s) could not be joined to a world-map country:`,
        failedToJoin.map((item) => `${item.countryName} (${item.countryCode}) — ${item.region}`),
      );
    }
  }

  return { countries, maxValue };
}
