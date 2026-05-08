import { describe, expect, it } from "vitest";

import {
  buildSeverityByRegion,
  buildThreatMatrixPoints,
  buildThreatMetricsSummary,
  buildTopThreats,
  buildTrajectory,
  calculateCfr,
  calculatePressure,
  calculateRecoveryRatio,
  calculateSeverityScore,
  filterHotspotsByThreat,
  filterHotspotsByVirus,
  getVirusOptions,
  mergeVirusSnapshots,
  rankHotspots,
} from "@/server/analysis";
import { fallbackMetrics } from "@/server/data/fallback-data";

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
});
