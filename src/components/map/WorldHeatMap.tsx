import { InteractiveMap } from "@/components/map/InteractiveMap";
import { MapLegend } from "@/components/map/MapLegend";
import { MAP_HEIGHT, MAP_WIDTH, projectWorld } from "@/components/map/project-countries";
import { Card } from "@/components/ui/Card";
import type { RegionMetric } from "@/lib/types";

export type WorldHeatMapProps = {
  items: RegionMetric[];
  /** Override default "World Heat Map" heading (e.g. virus-specific SEO title) */
  title?: string;
  /** Optional short description under the heading */
  description?: string;
  /** Sets `id` on the heading for `aria-labelledby` on the figure container */
  sectionId?: string;
};

/**
 * Server component. Thin wrapper: projects `items` to SVG-ready country
 * geometry (server-only, via project-countries.ts) and hands the fully
 * serializable result to the client InteractiveMap + server MapLegend.
 *
 * CONTRACT: also consumed by src/app/viruses/[slug]/page.tsx — keep this
 * prop shape stable ({ items, title?, description?, sectionId? }).
 */
export function WorldHeatMap({ items, title, description, sectionId }: WorldHeatMapProps) {
  const headingId = sectionId ?? "world-heat-map-heading";
  const headingText = title ?? "World Heat Map";
  const { countries, maxValue } = projectWorld(items);

  return (
    <Card as="section" padding="lg" aria-labelledby={headingId}>
      <h2 id={headingId} className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
        {headingText}
      </h2>
      {description ? <p className="mt-2 text-sm text-text-secondary">{description}</p> : null}
      <div className="mt-4 overflow-hidden rounded-lg border border-border-default">
        <InteractiveMap countries={countries} maxValue={maxValue} width={MAP_WIDTH} height={MAP_HEIGHT} selectedVirusLabel={title} />
      </div>
      <MapLegend />
    </Card>
  );
}
