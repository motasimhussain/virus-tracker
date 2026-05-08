import { describe, expect, it } from "vitest";

import type { RegionMetric } from "@/lib/types";
import { buildLocationId, dedupeAndMergeMetrics, normalizeCountryName } from "@/server/data/location-normalization";

const baseMetric: RegionMetric = {
  virus: "COVID-19",
  slug: "covid-19",
  region: "California",
  locationId: "admin1:US:california",
  locationLevel: "admin1",
  countryName: "United States",
  admin1Name: "California",
  admin1Code: "CA",
  source: "test-source",
  sourceConfidence: 0.7,
  countryCode: "US",
  latitude: 36.7,
  longitude: -119.4,
  activeCases: 1000,
  confirmedCases: 5000,
  deaths: 50,
  recovered: 3950,
  updatedAt: "2026-05-08T00:00:00.000Z",
};

describe("location normalization", () => {
  it("normalizes country aliases", () => {
    expect(normalizeCountryName("United States of America")).toBe("united states");
  });

  it("builds stable location IDs", () => {
    expect(
      buildLocationId({
        countryCode: "US",
        locationLevel: "admin1",
        region: "New York",
      }),
    ).toBe("admin1:US:new york");
  });

  it("deduplicates and keeps higher confidence records", () => {
    const lowerConfidence: RegionMetric = {
      ...baseMetric,
      source: "lower",
      sourceConfidence: 0.5,
      activeCases: 800,
    };
    const higherConfidence: RegionMetric = {
      ...baseMetric,
      source: "higher",
      sourceConfidence: 0.9,
      activeCases: 1200,
    };

    const merged = dedupeAndMergeMetrics([lowerConfidence, higherConfidence]);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.source).toBe("higher");
    expect(merged[0]?.activeCases).toBe(1200);
  });
});
