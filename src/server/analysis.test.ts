import { describe, expect, it } from "vitest";

import {
  buildSeverityByRegion,
  buildThreatMatrixPoints,
  buildThreatMetricsSummary,
  buildTopThreats,
  buildTrajectory,
  calculateCfr,
  calculateIncidencePer100k,
  calculatePressure,
  calculateRecoveryRatio,
  calculateSeverityScore,
  classifyTrend,
  classifyTrendFromTrajectory,
  enrichMetric,
  filterHotspotsByThreat,
  filterHotspotsByVirus,
  getVirusOptions,
  mergeVirusSnapshots,
  rankHotspots,
  selectTrajectory,
} from "@/server/analysis";
import { fallbackMetrics } from "@/server/data/fallback-data";
import { byAlpha2, byAlpha3, byName, byNumeric } from "@/lib/iso-countries";
import { getRiskLevel, getHeatColor, RISK_SCALE } from "@/lib/map-scale";
import type { TrajectoryPoint } from "@/lib/types";

describe("analysis layer", () => {
  it("builds 14 day trajectory", () => {
    const series = buildTrajectory(2000);
    expect(series).toHaveLength(14);
    expect(series[0].projectedCases).toBeGreaterThan(0);
  });

  it("sorts hotspots descending by active cases", () => {
    const hotspots = rankHotspots(fallbackMetrics);
    expect(hotspots[0].activeCases).toBeGreaterThanOrEqual(hotspots[1].activeCases);
  });

  it("merges snapshots by virus slug", () => {
    const snapshots = mergeVirusSnapshots(fallbackMetrics);
    const slugs = snapshots.map((item) => item.slug);
    expect(slugs).toContain("covid-19");
  });

  it("filters hotspots by virus slug", () => {
    const hotspots = rankHotspots(fallbackMetrics);
    const filtered = filterHotspotsByVirus(hotspots, "dengue");
    expect(filtered.every((item) => item.slug === "dengue")).toBe(true);
  });

  it("creates top threats and filters by threat key", () => {
    const hotspots = rankHotspots(fallbackMetrics);
    const threats = buildTopThreats(hotspots);
    expect(threats.length).toBeGreaterThan(0);
    const narrowed = filterHotspotsByThreat(hotspots, threats[0]?.key ?? null);
    expect(narrowed.length).toBeGreaterThan(0);
  });

  it("derives virus options from snapshot", () => {
    const snapshot = {
      generatedAt: new Date().toISOString(),
      viruses: mergeVirusSnapshots(fallbackMetrics),
      hotspots: rankHotspots(fallbackMetrics),
      news: [],
    };
    const options = getVirusOptions(snapshot);
    expect(options.some((item) => item.slug === "covid-19")).toBe(true);
  });

  it("computes CFR, pressure, recovery and severity", () => {
    const metric = fallbackMetrics[0]!;
    expect(calculateCfr(metric)).toBeGreaterThanOrEqual(0);
    expect(calculatePressure(metric)).toBeGreaterThanOrEqual(0);
    expect(calculateRecoveryRatio(metric)).toBeGreaterThanOrEqual(0);
    expect(calculateSeverityScore(metric)).toBeGreaterThanOrEqual(0);
  });

  it("builds threat summary and matrix points", () => {
    const hotspots = rankHotspots(fallbackMetrics);
    const summary = buildThreatMetricsSummary(hotspots);
    const matrix = buildThreatMatrixPoints(hotspots);
    expect(summary.confidenceAdjustedExposure).toBeGreaterThan(0);
    expect(matrix.length).toBeGreaterThan(0);
  });

  it("builds severity buckets by region", () => {
    const hotspots = rankHotspots(fallbackMetrics);
    const buckets = buildSeverityByRegion(hotspots);
    expect(buckets.length).toBeGreaterThan(0);
    expect(buckets[0]!.severityScore).toBeGreaterThanOrEqual(0);
  });

  describe("classifyTrend", () => {
    it("classifies rising when recent is >15% above prior", () => {
      expect(classifyTrend([100, 100, 100, 100, 100, 100, 100], [80, 80, 80, 80, 80, 80, 80])).toBe(
        "rising",
      );
    });

    it("classifies falling when recent is >15% below prior", () => {
      expect(classifyTrend([50, 50, 50, 50, 50, 50, 50], [100, 100, 100, 100, 100, 100, 100])).toBe(
        "falling",
      );
    });

    it("classifies stable when within +/-15%", () => {
      expect(classifyTrend([100, 100, 100, 100, 100, 100, 100], [95, 95, 95, 95, 95, 95, 95])).toBe(
        "stable",
      );
    });

    it("treats zero prior with positive recent as rising", () => {
      expect(classifyTrend([10, 10], [0, 0])).toBe("rising");
    });

    it("treats zero prior with zero recent as stable", () => {
      expect(classifyTrend([0, 0], [0, 0])).toBe("stable");
    });
  });

  describe("classifyTrendFromTrajectory", () => {
    function point(projectedCases: number): TrajectoryPoint {
      return { date: "d", projectedCases, confidenceLow: projectedCases, confidenceHigh: projectedCases };
    }

    it("returns undefined for too few points", () => {
      expect(classifyTrendFromTrajectory([point(1), point(2)])).toBeUndefined();
    });

    it("detects a rising trajectory", () => {
      const points = [100, 100, 100, 100, 100, 100, 100, 200, 200, 200, 200, 200, 200, 200].map(point);
      expect(classifyTrendFromTrajectory(points)).toBe("rising");
    });

    it("detects a falling trajectory", () => {
      const points = [200, 200, 200, 200, 200, 200, 200, 100, 100, 100, 100, 100, 100, 100].map(point);
      expect(classifyTrendFromTrajectory(points)).toBe("falling");
    });
  });

  describe("calculateIncidencePer100k", () => {
    it("computes incidence for a known-population country", () => {
      const incidence = calculateIncidencePer100k(1000, "US");
      expect(incidence).toBeGreaterThan(0);
    });

    it("returns undefined for a country without population data", () => {
      expect(calculateIncidencePer100k(1000, "ZZ")).toBeUndefined();
    });
  });

  describe("selectTrajectory", () => {
    it("prefers a non-empty real trajectory and marks it non-synthetic", () => {
      const real: TrajectoryPoint[] = [
        { date: "1d", projectedCases: 10, confidenceLow: 8, confidenceHigh: 12 },
      ];
      const fallback = buildTrajectory(1000);
      const result = selectTrajectory(real, fallback);
      expect(result).toHaveLength(1);
      expect(result[0]!.isSynthetic).toBe(false);
    });

    it("falls back and flags points as synthetic when real is empty", () => {
      const fallback = buildTrajectory(500);
      const result = selectTrajectory([], fallback);
      expect(result).toHaveLength(fallback.length);
      expect(result.every((point) => point.isSynthetic === true)).toBe(true);
    });

    it("falls back and flags points as synthetic when real is null/undefined", () => {
      const fallback = buildTrajectory(500);
      expect(selectTrajectory(null, fallback).every((p) => p.isSynthetic)).toBe(true);
      expect(selectTrajectory(undefined, fallback).every((p) => p.isSynthetic)).toBe(true);
    });
  });

  describe("enrichMetric", () => {
    it("fills incidencePer100k when derivable and missing", () => {
      const metric = { ...fallbackMetrics[0]!, incidencePer100k: undefined, countryCode: "US" };
      const enriched = enrichMetric(metric);
      expect(enriched.incidencePer100k).toBeGreaterThan(0);
    });

    it("fixes (0,0) coordinates using the country centroid", () => {
      const metric = { ...fallbackMetrics[0]!, countryCode: "US", latitude: 0, longitude: 0 };
      const enriched = enrichMetric(metric);
      expect(enriched.latitude).not.toBe(0);
      expect(enriched.longitude).not.toBe(0);
    });

    it("leaves a metric untouched when nothing is derivable or missing", () => {
      const metric = {
        ...fallbackMetrics[0]!,
        countryCode: "ZZ",
        latitude: 12.3,
        longitude: 45.6,
        incidencePer100k: 5,
      };
      const enriched = enrichMetric(metric);
      expect(enriched).toEqual(metric);
    });
  });
});

describe("iso-countries", () => {
  it("resolves the US by alpha2, alpha3, numeric and alias", () => {
    expect(byAlpha2("US")?.name).toBe("United States");
    expect(byAlpha3("USA")?.name).toBe("United States");
    expect(byNumeric("840")?.alpha2).toBe("US");
    expect(byNumeric(840)?.alpha2).toBe("US");
    expect(byName("USA")?.alpha2).toBe("US");
    expect(byName("United States of America")?.alpha2).toBe("US");
  });

  it("resolves DRC and Russia aliases", () => {
    expect(byName("DRC")?.alpha2).toBe("CD");
    expect(byName("DR Congo")?.alpha2).toBe("CD");
    expect(byName("Russian Federation")?.alpha2).toBe("RU");
  });

  it("resolves South Korea via common aliases", () => {
    expect(byName("South Korea")?.alpha2).toBe("KR");
    expect(byName("Republic of Korea")?.alpha2).toBe("KR");
  });

  it("joins numeric ids the way world-atlas topojson ids them (zero-padded)", () => {
    expect(byNumeric("004")?.alpha2).toBe("AF");
    expect(byNumeric("032")?.alpha2).toBe("AR");
  });

  it("returns undefined for unknown codes", () => {
    expect(byAlpha2("ZZ")).toBeUndefined();
    expect(byNumeric("999")).toBeUndefined();
    expect(byName("Nowhereland")).toBeUndefined();
  });
});

describe("map-scale risk levels", () => {
  it("has 6 risk steps matching level 1..6", () => {
    expect(RISK_SCALE).toHaveLength(6);
    expect(RISK_SCALE.map((step) => step.level)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("buckets low ratios into level 1 and near-max ratios into level 6", () => {
    expect(getRiskLevel(0, 100)).toBe(1);
    expect(getRiskLevel(5, 100)).toBe(1);
    expect(getRiskLevel(100, 100)).toBe(6);
    expect(getRiskLevel(90, 100)).toBe(6);
  });

  it("treats a non-positive max as level 1", () => {
    expect(getRiskLevel(10, 0)).toBe(1);
    expect(getRiskLevel(10, -5)).toBe(1);
  });

  it("getHeatColor delegates to the RISK_SCALE color for the same level", () => {
    const level = getRiskLevel(80, 100);
    expect(getHeatColor(80, 100)).toBe(RISK_SCALE[level - 1]!.color);
  });
});
