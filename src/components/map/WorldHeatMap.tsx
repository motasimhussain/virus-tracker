import type { RegionMetric } from "@/lib/types";
import { geoMercator, geoPath } from "d3-geo";
import type { FeatureCollection } from "geojson";
import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json";

import { getHeatColor } from "@/lib/map-scale";

type WorldHeatMapProps = {
  items: RegionMetric[];
  /** Override default "World Heat Map" heading (e.g. virus-specific SEO title) */
  title?: string;
  /** Optional short description under the heading */
  description?: string;
  /** Sets `id` on the heading for `aria-labelledby` on the figure container */
  sectionId?: string;
};

const MAP_WIDTH = 960;
const MAP_HEIGHT = 440;
const projection = geoMercator()
  .center([10, 15])
  .scale(150)
  .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2]);
const pathBuilder = geoPath(projection);

type GeoFeature = {
  id?: string;
  properties?: { name?: string };
  geometry: unknown;
};

function normalizeCountryName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace("united states of america", "united states")
    .replace("democratic republic of the congo", "democratic republic of congo")
    .replace("russian federation", "russia");
}

export function WorldHeatMap({ items, title, description, sectionId }: WorldHeatMapProps) {
  const headingId = sectionId ?? "world-heat-map-heading";
  const headingText = title ?? "World Heat Map";
  const maxActiveCases =
    items.length > 0 ? Math.max(...items.map((item) => item.activeCases), 0) : 0;
  const collection = feature(
    worldAtlas as unknown as Parameters<typeof feature>[0],
    (worldAtlas as { objects: { countries: unknown } }).objects.countries as Parameters<typeof feature>[1],
  ) as FeatureCollection;
  const geographies = (collection.features as unknown as GeoFeature[]) ?? [];

  const intensityByCountry = items.reduce<Record<string, number>>((acc, item) => {
    const normalized = normalizeCountryName(item.countryName);
    acc[normalized] = Math.max(acc[normalized] ?? 0, item.activeCases);
    return acc;
  }, {});

  return (
    <section
      className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-4"
      aria-labelledby={headingId}
    >
      <h2 id={headingId} className="text-sm uppercase tracking-[0.2em] text-cyan-300">
        {headingText}
      </h2>
      {description ? <p className="mt-2 text-xs text-cyan-100/75">{description}</p> : null}
      <div className="mt-4 overflow-hidden rounded-lg border border-cyan-900/30" role="img" aria-label={headingText}>
        <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="h-auto w-full bg-slate-950">
          <rect x="0" y="0" width={MAP_WIDTH} height={MAP_HEIGHT} fill="rgba(15,23,42,0.85)" />
          {geographies.map((geoFeature) => {
            const countryName = geoFeature.properties?.name ?? "";
            const normalizedCountry = normalizeCountryName(countryName);
            const activeCases = intensityByCountry[normalizedCountry] ?? 0;
            const fill = activeCases > 0 ? getHeatColor(activeCases, maxActiveCases) : "rgba(71,85,105,0.35)";
            const path = pathBuilder(geoFeature as never);
            if (!path) return null;

            return (
              <path
                key={geoFeature.id ?? countryName}
                d={path}
                fill={fill}
                stroke="rgba(148,163,184,0.45)"
                strokeWidth={0.5}
              >
                <title>
                  {activeCases > 0
                    ? `${countryName}: ${activeCases.toLocaleString()} active`
                    : `${countryName}: no tracked data`}
                </title>
              </path>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-sm text-cyan-100/80">
        <span className="rounded border border-cyan-400/30 bg-cyan-400/30 px-3 py-1">Low</span>
        <span className="rounded border border-yellow-400/30 bg-yellow-400/30 px-3 py-1">Elevated</span>
        <span className="rounded border border-orange-400/30 bg-orange-400/30 px-3 py-1">High</span>
        <span className="rounded border border-red-400/30 bg-red-400/30 px-3 py-1">Critical</span>
      </div>
    </section>
  );
}
