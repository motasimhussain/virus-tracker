import Link from "next/link";

import type { RegionMetric } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { RiskBar } from "@/components/ui/RiskBar";
import { TrendPill } from "@/components/ui/TrendPill";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCompactNumber } from "@/lib/copy";
import { getRiskLevel } from "@/lib/map-scale";

export type HeatListProps = {
  items: RegionMetric[];
};

/**
 * Ranked list of regional hotspots. Each row's fill bar and badge come from
 * the shared risk heat ramp (relative to the largest active-case count in
 * the list), and the region name links to its dedicated region+virus page.
 * The panel title is left to the caller (usually a `SectionHeader` above it).
 */
export function HeatList({ items }: HeatListProps) {
  if (items.length === 0) {
    return (
      <Card>
        <EmptyState title="No hotspots yet" message="There's no regional data to show right now." />
      </Card>
    );
  }

  const max = Math.max(...items.map((item) => item.activeCases), 1);

  return (
    <Card padding="md">
      <ul className="divide-y divide-border-default">
        {items.map((item) => {
          const level = getRiskLevel(item.activeCases, max);
          const displayName =
            item.locationLevel === "admin1" && item.admin1Name
              ? `${item.admin1Name}, ${item.countryName}`
              : item.region;

          return (
            <li
              key={`${item.slug}-${item.countryCode}-${item.region}`}
              className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/regions/${item.countryCode.toLowerCase()}/${item.slug}`}
                  className="block truncate text-sm font-semibold text-text-primary transition-colors hover:text-accent"
                >
                  {displayName}
                </Link>
                <p className="mt-0.5 truncate text-xs text-text-muted">
                  {item.virus} &middot; {item.countryCode} &middot; {item.locationLevel}
                </p>
                <RiskBar
                  value={item.activeCases}
                  max={max}
                  riskLevel={level}
                  label={`Active cases in ${displayName}`}
                  className="mt-2"
                />
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <Badge variant="risk" riskLevel={level}>
                  {formatCompactNumber(item.activeCases)} active
                </Badge>
                {item.trend ? <TrendPill trend={item.trend} /> : null}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
