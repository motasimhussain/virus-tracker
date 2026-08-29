import { RegionBarChart } from "@/components/charts";
import { Card, SectionHeader } from "@/components/ui";
import type { RegionMetric } from "@/lib/types";

export type VirusRegionalBarChartProps = {
  metrics: RegionMetric[];
  virusName: string;
  topN?: number;
};

function regionLabel(metric: RegionMetric): string {
  if (metric.locationLevel === "admin1" && metric.admin1Name) {
    return `${metric.admin1Name}, ${metric.countryName}`;
  }
  return `${metric.region} (${metric.countryCode})`;
}

/**
 * Virus-page wrapper around the shared `RegionBarChart` primitive: maps raw
 * `RegionMetric[]` into `{ name, value }` data and derives the plain-English
 * summary sentence the chart needs for its accessible name.
 */
export function VirusRegionalBarChart({ metrics, virusName, topN = 10 }: VirusRegionalBarChartProps) {
  const data = metrics.map((metric) => ({ name: regionLabel(metric), value: metric.activeCases }));
  const shown = Math.min(topN, data.length);
  const plainSummary =
    shown > 0
      ? `Top ${shown} tracked location${shown === 1 ? "" : "s"} for ${virusName} by active cases, ranked highest to lowest.`
      : `No regional case data is available yet for ${virusName}.`;

  return (
    <Card>
      <SectionHeader
        eyebrow="Live dataset"
        title="Top regions by active cases"
        description={`The ${shown} tracked location${shown === 1 ? "" : "s"} with the most active ${virusName} cases in the current dataset.`}
      />
      <div className="mt-4">
        <RegionBarChart data={data} plainSummary={plainSummary} topN={topN} />
      </div>
    </Card>
  );
}
