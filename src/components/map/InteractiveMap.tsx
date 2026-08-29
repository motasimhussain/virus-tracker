"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { select } from "d3-selection";
import { zoom as d3Zoom, zoomIdentity, type D3ZoomEvent, type ZoomBehavior } from "d3-zoom";
import { Minus, Plus, RotateCcw } from "lucide-react";

import { CountryTooltip } from "@/components/map/CountryTooltip";
import type { ProjectedCountry } from "@/components/map/project-countries";
import { cn } from "@/lib/cn";
import { formatCompactNumber } from "@/lib/copy";
import { RISK_SCALE } from "@/lib/map-scale";

export type InteractiveMapProps = {
  countries: ProjectedCountry[];
  maxValue: number;
  width: number;
  height: number;
  /** Optional label for the currently selected virus, used in the map's accessible name. */
  selectedVirusLabel?: string;
};

type ZoomTransform = { k: number; x: number; y: number };

const IDENTITY_TRANSFORM: ZoomTransform = { k: 1, x: 0, y: 0 };

/**
 * Preset pan/zoom transforms tuned to this map's fixed geoMercator
 * projection (center [10, 15], scale 150, viewBox 960x440 — see
 * project-countries.ts). Values are hand-computed against that projection,
 * not derived at runtime, so InteractiveMap never has to import d3-geo.
 */
const CONTINENT_PRESETS: Record<string, ZoomTransform> = {
  Africa: { k: 1.8, x: -429, y: -244 },
  Europe: { k: 2, x: -509, y: 67 },
  Asia: { k: 1.1, x: -314, y: 106 },
  Americas: { k: 1, x: 288, y: 19 },
  Oceania: { k: 1.8, x: -1037, y: -341 },
};

const TOOLTIP_MARGIN_X = 100;
const TOOLTIP_MARGIN_TOP = 80;
const TOOLTIP_MARGIN_BOTTOM = 16;

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

function riskFill(riskLevel: ProjectedCountry["riskLevel"]): string {
  if (riskLevel === 0) return "var(--color-surface-inset)";
  return `var(--color-risk-${riskLevel})`;
}

function countryAriaLabel(country: ProjectedCountry): string {
  const step = RISK_SCALE[country.riskLevel - 1];
  return `${country.name}: about ${formatCompactNumber(country.value)} people currently sick. ${step.label} risk. Press Enter for details.`;
}

/**
 * Client-side interactive world map. Receives pre-projected, serializable
 * country geometry (no topojson/d3-geo in this bundle) and renders a
 * pan/zoomable SVG with hover/focus tooltips and click-through to region
 * pages. Countries without tracked data render but aren't interactive.
 */
export function InteractiveMap({ countries, maxValue, width, height, selectedVirusLabel }: InteractiveMapProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const zoomBehaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const [tooltip, setTooltip] = useState<{ country: ProjectedCountry; x: number; y: number } | null>(null);

  useEffect(() => {
    const svgNode = svgRef.current;
    const gNode = gRef.current;
    if (!svgNode || !gNode) return;

    const svgSelection = select(svgNode);
    const behavior = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .extent([
        [0, 0],
        [width, height],
      ])
      .translateExtent([
        [-width * 1.2, -height * 1.2],
        [width * 2.2, height * 2.2],
      ])
      .on("zoom", (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        gNode.setAttribute("transform", event.transform.toString());
      });

    svgSelection.call(behavior);
    zoomBehaviorRef.current = behavior;

    return () => {
      svgSelection.on(".zoom", null);
      zoomBehaviorRef.current = null;
    };
  }, [width, height]);

  const applyTransform = useCallback((transform: ZoomTransform) => {
    const svgNode = svgRef.current;
    const behavior = zoomBehaviorRef.current;
    if (!svgNode || !behavior) return;
    behavior.transform(select(svgNode), zoomIdentity.translate(transform.x, transform.y).scale(transform.k));
  }, []);

  const zoomBy = useCallback((factor: number) => {
    const svgNode = svgRef.current;
    const behavior = zoomBehaviorRef.current;
    if (!svgNode || !behavior) return;
    behavior.scaleBy(select(svgNode), factor);
  }, []);

  const showTooltip = useCallback((country: ProjectedCountry, clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clamp(clientX - rect.left, TOOLTIP_MARGIN_X, Math.max(TOOLTIP_MARGIN_X, rect.width - TOOLTIP_MARGIN_X));
    const y = clamp(
      clientY - rect.top,
      TOOLTIP_MARGIN_TOP,
      Math.max(TOOLTIP_MARGIN_TOP, rect.height - TOOLTIP_MARGIN_BOTTOM),
    );
    setTooltip({ country, x, y });
  }, []);

  const hideTooltip = useCallback(() => setTooltip(null), []);

  const goToCountry = useCallback(
    (country: ProjectedCountry) => {
      if (!country.iso2 || country.riskLevel === 0) return;
      router.push(`/regions/${country.iso2.toLowerCase()}`);
    },
    [router],
  );

  const mapAriaLabel = selectedVirusLabel
    ? `World map of ${selectedVirusLabel} intensity by country`
    : "World map of outbreak intensity by country";

  return (
    <div ref={containerRef} className="relative" role="group" aria-label={mapAriaLabel}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="animate-fade-up h-auto w-full touch-none select-none rounded-lg bg-surface-inset"
      >
        <g ref={gRef}>
          {countries.map((country) => {
            const hasData = country.riskLevel > 0 && country.iso2 !== null;
            return (
              <path
                key={country.id}
                d={country.d}
                fill={riskFill(country.riskLevel)}
                stroke="var(--color-border-default)"
                strokeWidth={0.5}
                className={cn(
                  "outline-none transition-[stroke,stroke-width] duration-150 ease-out",
                  hasData && "cursor-pointer hover:stroke-accent hover:stroke-2 focus-visible:stroke-accent focus-visible:stroke-2",
                )}
                tabIndex={hasData ? 0 : -1}
                role={hasData ? "button" : undefined}
                aria-label={hasData ? countryAriaLabel(country) : undefined}
                onPointerEnter={(event) => showTooltip(country, event.clientX, event.clientY)}
                onPointerMove={(event) => showTooltip(country, event.clientX, event.clientY)}
                onPointerLeave={hideTooltip}
                onFocus={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  showTooltip(country, rect.left + rect.width / 2, rect.top);
                }}
                onBlur={hideTooltip}
                onClick={() => goToCountry(country)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    goToCountry(country);
                  }
                }}
              >
                {!hasData ? <title>{`${country.name}: no tracked data`}</title> : null}
              </path>
            );
          })}
        </g>
      </svg>

      {tooltip ? (
        <CountryTooltip
          name={tooltip.country.name}
          value={tooltip.country.value}
          maxValue={maxValue}
          riskLevel={tooltip.country.riskLevel}
          x={tooltip.x}
          y={tooltip.y}
        />
      ) : null}

      <div className="pointer-events-none absolute inset-3 flex items-start justify-between gap-2">
        <div className="pointer-events-auto flex flex-wrap gap-1">
          {Object.keys(CONTINENT_PRESETS).map((continent) => (
            <button
              key={continent}
              type="button"
              onClick={() => applyTransform(CONTINENT_PRESETS[continent]!)}
              className="rounded-full border border-border-default bg-surface-overlay/90 px-2.5 py-1 text-xs text-text-secondary shadow-card transition-colors hover:border-border-accent hover:text-text-primary"
            >
              {continent}
            </button>
          ))}
        </div>

        <div className="pointer-events-auto flex flex-col gap-1">
          <button
            type="button"
            onClick={() => zoomBy(1.5)}
            aria-label="Zoom in"
            className="flex size-7 items-center justify-center rounded-md border border-border-default bg-surface-overlay/90 text-text-secondary shadow-card transition-colors hover:border-border-accent hover:text-text-primary"
          >
            <Plus className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => zoomBy(1 / 1.5)}
            aria-label="Zoom out"
            className="flex size-7 items-center justify-center rounded-md border border-border-default bg-surface-overlay/90 text-text-secondary shadow-card transition-colors hover:border-border-accent hover:text-text-primary"
          >
            <Minus className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => applyTransform(IDENTITY_TRANSFORM)}
            aria-label="Reset zoom"
            className="flex size-7 items-center justify-center rounded-md border border-border-default bg-surface-overlay/90 text-text-secondary shadow-card transition-colors hover:border-border-accent hover:text-text-primary"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
