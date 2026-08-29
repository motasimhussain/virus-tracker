import { afterEach, describe, expect, it, vi } from "vitest";

import sampleFluViewResponse from "./__fixtures__/delphi-fluview.sample.json";
import {
  dateToEpiweek,
  delphiFluViewAdapter,
  epiweekToDate,
  influenzaTrajectoryProvider,
} from "./delphi-fluview";

function mockFetchOnce(response: unknown, ok = true, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => response,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("epiweek <-> date conversion", () => {
  it("converts epiweek 202601 to early January 2026", () => {
    expect(epiweekToDate(202601)).toBe("2026-01-10");
  });

  it("converts epiweek 202552 (year-end) to late December 2025", () => {
    expect(epiweekToDate(202552)).toBe("2025-12-27");
  });

  it("round-trips dateToEpiweek against epiweekToDate", () => {
    const epiweek = dateToEpiweek(new Date("2026-01-15T00:00:00.000Z"));
    expect(epiweek).toBe(202602);
  });
});

describe("delphiFluViewAdapter.fetchMetrics", () => {
  it("maps the latest epiweek per region into RegionMetric rows", async () => {
    mockFetchOnce(sampleFluViewResponse);

    const rows = await delphiFluViewAdapter.fetchMetrics();
    expect(rows).toHaveLength(3);

    const nat = rows.find((row) => row.countryCode === "US" && row.locationLevel === "country");
    expect(nat).toBeDefined();
    expect(nat).toMatchObject({
      virus: "Influenza",
      slug: "influenza",
      region: "United States",
      locationLevel: "country",
      countryName: "United States",
      source: "delphi-fluview",
      sourceConfidence: 0.9,
      countryCode: "US",
      activeCases: 18000, // num_ili at latest epiweek (202552)
      confirmedCases: 570000, // num_patients at latest epiweek
      deaths: 0,
      recovered: 0,
      incidencePer100k: 3400, // wili (3.4) * 1000
      asOf: "2025-12-27",
      trend: "rising", // 2.6 -> 3.4 wili is a >5% rise
    });
    expect(nat?.locationId).toBe("country:US");

    const hhs1 = rows.find((row) => row.admin1Code === "us-hhs1");
    expect(hhs1).toBeDefined();
    expect(hhs1).toMatchObject({
      locationLevel: "admin1",
      admin1Name: "HHS Region 1 (Boston)",
      admin1Code: "us-hhs1",
      countryCode: "US",
      activeCases: 1800,
      confirmedCases: 47000,
      incidencePer100k: 3200, // wili (3.2) * 1000
      asOf: "2025-12-27",
      trend: "falling", // 4.0 -> 3.2 wili is a >5% drop
      latitude: 42.3601,
      longitude: -71.0589,
    });

    const hhs2 = rows.find((row) => row.admin1Code === "us-hhs2");
    expect(hhs2).toBeDefined();
    expect(hhs2).toMatchObject({
      locationLevel: "admin1",
      admin1Name: "HHS Region 2 (New York)",
      activeCases: 900,
      incidencePer100k: 1800,
    });
    // Only one observed epiweek for hhs2, so no trend can be computed.
    expect(hhs2?.trend).toBeUndefined();
  });

  it("rejects when the upstream feed responds with a non-OK status", async () => {
    mockFetchOnce({}, false, 503);

    await expect(delphiFluViewAdapter.fetchMetrics()).rejects.toThrow(/status 503/);
  });

  it("rejects when the upstream feed reports a failed result code", async () => {
    mockFetchOnce({ result: -2, epidata: [], message: "no results" });

    await expect(delphiFluViewAdapter.fetchMetrics()).rejects.toThrow(/no usable data/);
  });

  it("rejects when fetch itself throws (network failure)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network unreachable")),
    );

    await expect(delphiFluViewAdapter.fetchMetrics()).rejects.toThrow(/network unreachable/);
  });
});

describe("influenzaTrajectoryProvider", () => {
  it("builds a weekly national trajectory that is not synthetic", async () => {
    mockFetchOnce(sampleFluViewResponse);

    expect(influenzaTrajectoryProvider.virusSlug).toBe("influenza");
    const trajectory = await influenzaTrajectoryProvider.fetchTrajectory();

    expect(trajectory).toHaveLength(3);
    expect(trajectory.map((point) => point.date)).toEqual([
      "2025-12-13",
      "2025-12-20",
      "2025-12-27",
    ]);
    expect(trajectory.every((point) => point.isSynthetic === false)).toBe(true);

    const latest = trajectory[trajectory.length - 1];
    expect(latest?.projectedCases).toBe(18000);
    expect(latest?.confidenceLow).toBeLessThan(18000);
    expect(latest?.confidenceHigh).toBeGreaterThan(18000);
  });
});
