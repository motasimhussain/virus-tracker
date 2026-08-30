import { RISK_SCALE } from "@/lib/map-scale";

/**
 * Server component. Plain-English legend for the world map's risk ramp:
 * one swatch per RISK_SCALE step plus a "No data" swatch, and a one-line
 * explanation of what the color means.
 */
export function MapLegend() {
  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
          <span
            className="size-3 rounded-full border border-border-strong bg-surface-inset"
            aria-hidden="true"
          />
          No data
        </span>
        {RISK_SCALE.map((step) => (
          <span key={step.level} className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
            <span
              className="size-3 rounded-full"
              style={{ backgroundColor: `var(${step.cssVar})` }}
              aria-hidden="true"
            />
            {step.label}
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs text-text-muted">Darker red = more people currently sick.</p>
    </div>
  );
}
