import fs from "node:fs";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildCovidTrajectory,
  covidHistoricalProvider,
  parseDiseaseShDateKey,
} from "./covid-historical";

const FIXTURES_DIR = path.join(__dirname, "__fixtures__");

const HISTORICAL_FIXTURE = JSON.parse(
  fs.readFileSync(path.join(FIXTURES_DIR, "covid-historical-all.json"), "utf-8"),
);

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
  } as Response;
}

describe("parseDiseaseShDateKey", () => {
  it("converts M/D/YY keys to ISO date strings", () => {
    expect(parseDiseaseShDateKey("1/29/23")).toBe("2023-01-29");
    expect(parseDiseaseShDateKey("3/9/23")).toBe("2023-03-09");
  });

  it("throws on an unparseable key", () => {
    expect(() => parseDiseaseShDateKey("not-a-date")).toThrow();
  });
});

describe("buildCovidTrajectory", () => {
  const trajectory = buildCovidTrajectory(HISTORICAL_FIXTURE);

  it("produces one point per day in the feed", () => {
    expect(trajectory).toHaveLength(Object.keys(HISTORICAL_FIXTURE.cases).length);
  });

  it("marks every point as real (non-synthetic) data", () => {
    expect(trajectory.every((point) => point.isSynthetic === false)).toBe(true);
  });

  it("converts cumulative totals into non-negative daily new-case counts", () => {
    expect(trajectory.every((point) => point.projectedCases >= 0)).toBe(true);
  });

  it("emits ISO dates in chronological order matching the feed", () => {
    expect(trajectory[0]?.date).toBe("2023-01-29");
    expect(trajectory[trajectory.length - 1]?.date).toBe("2023-03-09");
  });

  it("computes a 7-day trailing smoothed value for the last point", () => {
    // Cumulative cases for the last 7 days of the fixture (3/3 .. 3/9):
    // 675914580, 675968775, 676024901, 676082941, 676213378, 676392824, 676570149
    // Daily diffs vs. the prior day: 182669, 54195, 56126, 58040, 130437, 179446, 177325
    const expectedAverage = (182669 + 54195 + 56126 + 58040 + 130437 + 179446 + 177325) / 7;
    expect(trajectory[trajectory.length - 1]?.projectedCases).toBe(Math.round(expectedAverage));
  });

  it("derives a +-10% confidence band around the smoothed value", () => {
    const point = trajectory[trajectory.length - 1]!;
    expect(point.confidenceLow).toBe(Math.round(point.projectedCases * 0.9));
    expect(point.confidenceHigh).toBe(Math.round(point.projectedCases * 1.1));
  });

  it("treats the first day as zero new cases (no prior cumulative baseline)", () => {
    // First point's smoothed value is just its own (zero) new-case count.
    expect(trajectory[0]?.projectedCases).toBe(0);
  });
});

describe("covidHistoricalProvider", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse(HISTORICAL_FIXTURE)),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("exposes the covid-19 virus slug", () => {
    expect(covidHistoricalProvider.virusSlug).toBe("covid-19");
  });

  it("fetches and parses a real trajectory", async () => {
    const trajectory = await covidHistoricalProvider.fetchTrajectory();
    expect(trajectory.length).toBeGreaterThan(0);
    expect(trajectory.every((point) => point.isSynthetic === false)).toBe(true);
  });

  it("rejects when the upstream fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({}, false, 503)),
    );

    await expect(covidHistoricalProvider.fetchTrajectory()).rejects.toThrow(/status 503/);
  });

  it("rejects when the network request itself throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );

    await expect(covidHistoricalProvider.fetchTrajectory()).rejects.toThrow("network down");
  });
});
