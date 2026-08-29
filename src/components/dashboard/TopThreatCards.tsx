import Link from "next/link";

import type { TopThreat } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { RiskBar } from "@/components/ui/RiskBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCompactNumber } from "@/lib/copy";
import { getRiskLevel, RISK_SCALE, type RiskLevel } from "@/lib/map-scale";

export type TopThreatCardsProps = {
  threats: TopThreat[];
  maxCards?: number;
};

function severitySentence(level: RiskLevel): string {
  if (level >= 5) return "A lot of people are currently sick here.";
  if (level >= 3) return "Quite a few people are currently sick here.";
  return "A smaller number of people are currently sick here.";
}

/**
 * Grid of the top active-threat hotspots. Each card links to the same
 * `/map?virus=&threat=` destination the hand-rolled version used, with a
 * risk badge, an intensity bar, and a plain-English sentence in place of a
 * raw number for readers who want the gist at a glance.
 */
export function TopThreatCards({ threats, maxCards = 6 }: TopThreatCardsProps) {
  const cards = threats.slice(0, maxCards);

  if (cards.length === 0) {
    return <EmptyState title="No active threats" message="There are no top threats to show right now." />;
  }

  const max = Math.max(...cards.map((card) => card.activeCases), 1);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((threat) => {
        const level = getRiskLevel(threat.activeCases, max);
        return (
          <Link
            key={threat.key}
            href={`/map?virus=${encodeURIComponent(threat.virusSlug)}&threat=${encodeURIComponent(threat.key)}`}
            className="group block"
          >
            <Card glow className="flex h-full flex-col transition-colors group-hover:border-border-accent">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-text-primary transition-colors group-hover:text-accent">
                  {threat.label}
                </p>
                <Badge variant="risk" riskLevel={level}>
                  {RISK_SCALE[level - 1].label}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-text-muted">
                {threat.region} &middot; {threat.countryCode}
              </p>
              <Badge variant="accent" className="mt-2 w-fit">
                {threat.virusSlug}
              </Badge>
              <p className="mt-3 text-2xl font-bold text-text-primary">{formatCompactNumber(threat.activeCases)}</p>
              <p className="text-xs text-text-muted">active cases</p>
              <RiskBar
                value={threat.activeCases}
                max={max}
                riskLevel={level}
                label={`Outbreak intensity in ${threat.region}`}
                className="mt-3"
              />
              <p className="mt-2 text-xs text-text-secondary">{severitySentence(level)}</p>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
