import { Badge } from "@/components/ui/Badge";
import { RiskBar } from "@/components/ui/RiskBar";
import { formatCompactNumber } from "@/lib/copy";
import { RISK_SCALE, type RiskLevel } from "@/lib/map-scale";

export type CountryTooltipProps = {
  name: string;
  /** Aggregated active-case value for this country (0 if `hasData` is false). */
  value: number;
  /** Highest aggregated value across all countries — scales the intensity bar. */
  maxValue: number;
  /** 0 = no tracked data; 1-6 = risk ramp step. */
  riskLevel: 0 | RiskLevel;
  /** Position within the positioned ancestor (already clamped to stay on-screen). */
  x: number;
  y: number;
};

/**
 * Floating tooltip shown near the cursor/focus point on hover/focus of a
 * map country. Plain-English phrasing per copy.ts conventions.
 */
export function CountryTooltip({ name, value, maxValue, riskLevel, x, y }: CountryTooltipProps) {
  const hasData = riskLevel !== 0;

  return (
    <div
      role="status"
      className="pointer-events-none absolute z-20 w-60 -translate-x-1/2 -translate-y-full rounded-lg border border-border-default bg-surface-overlay p-3 text-sm shadow-elevated"
      style={{ left: x, top: y }}
    >
      <p className="font-semibold text-text-primary">{name}</p>
      {hasData ? (
        <>
          <p className="mt-1 text-text-secondary">About {formatCompactNumber(value)} people currently sick</p>
          <RiskBar value={value} max={maxValue} riskLevel={riskLevel} label={`${name} outbreak intensity`} className="mt-2" />
          <div className="mt-2 flex items-center justify-between gap-2">
            <Badge variant="risk" riskLevel={riskLevel}>
              {RISK_SCALE[riskLevel - 1].label}
            </Badge>
            <span className="text-xs text-text-faint">Click for details</span>
          </div>
        </>
      ) : (
        <p className="mt-1 text-text-muted">No tracked data for this country yet.</p>
      )}
    </div>
  );
}
