import fs from "node:fs";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildMpoxMetrics,
  buildMpoxTrajectory,
  isAggregateRow,
  mpoxTrajectoryProvider,
  owidMpoxAdapter,
  parseOwidMpoxCsv,
} from "./owid-mpox";

const FIXTURES_DIR = path.join(__dirname, "__fixtures__");

const MPOX_CSV = fs.readFileSync(path.join(FIXTURES_DIR, "owid-mpox-sample.csv"), "utf-8");

function textResponse(body: string, ok = true, status = 200): Response {
  return {
    ok,
    status,
    text: async () => body,
  } as Response;
}

describe("isAggregateRow", () => {
  it("flags blank iso_code (World) rows as aggregates", () => {
    expect(isAggregateRow({ iso_code: "" })).toBe(true);
  });

  it("flags OWID_* continent codes as aggregates", () => {
    expect(isAggregateRow({ iso_code: "OWID_AFR" })).toBe(true);
  });

  it("does not flag real ISO3 country codes", () => {
    expect(isAggregateRow({ iso_code: "USA" })).toBe(false);
  });
});

describe("buildMpoxMetrics", () => {
  const rows = parseOwidMpoxCsv(MPOX_CSV);
  const metrics = buildMpoxMetrics(rows);

  it("keeps only the latest row per country and skips aggregate rows", () => {
    expect(metrics.map((m) => m.countryCode).sort()).toEqual(["BI", "NG", "US"].sort());
  });

  it("shapes each row as a mpox RegionMetric with source metadata", () => {
    const usa = metrics.find((m) => m.countryCode === "US");
    expect(usa).toBeDefined();
    expect(usa?.virus).toBe("Mpox");
    expect(usa?.slug).toBe("mpox");
    expect(usa?.source).toBe("owid-mpox");
    expect(usa?.sourceConfidence).toBeCloseTo(0.9);
    expect(usa?.locationLevel).toBe("country");
    expect(usa?.locationId).toBe("country:US");
  });

  it("takes confirmedCases/deaths from the latest dated row", () => {
    const usa = metrics.find((m) => m.countryCode === "US");
    expect(usa?.confirmedCases).toBe(37789);
    expect(usa?.deaths).toBe(63);
    expect(usa?.asOf).toBe("2026-04-27");
    expect(usa?.updatedAt).toBe(new Date("2026-04-27").toISOString());
  });

  it("approximates activeCases from the trailing new-case window", () => {
    const usa = metrics.find((m) => m.countryCode === "US");
    // Sum of new_cases across all 15 fixture rows for the US: 9+14+10 = 33.
    expect(usa?.activeCases).toBe(33);

    const nigeria = metrics.find((m) => m.countryCode === "NG");
    // Sum of new_cases across the 10 fixture rows for Nigeria: 2.
    expect(nigeria?.activeCases).toBe(2);
  });

  it("derives a trend from the last 7 days vs. the prior 7 days", () => {
    const usa = metrics.find((m) => m.countryCode === "US");
    // last7 new_cases sum = 10, previous7 sum = 14 -> declining.
    expect(usa?.trend).toBe("falling");
  });

  it("resolves centroid coordinates from the inline country map", () => {
    const usa = metrics.find((m) => m.countryCode === "US");
    expect(usa?.latitude).toBeCloseTo(37.09);
    expect(usa?.longitude).toBeCloseTo(-95.71);
  });

  it("drops rows with no iso_code (e.g. the malformed Burundi row) from grouping", () => {
    const burundi = metrics.find((m) => m.countryCode === "BI");
    expect(burundi).toBeDefined();
    expect(burundi?.confirmedCases).toBe(0);
  });
});

describe("buildMpoxTrajectory", () => {
  const rows = parseOwidMpoxCsv(MPOX_CSV);
  const trajectory = buildMpoxTrajectory(rows);

  it("builds one point per World row in the feed", () => {
    expect(trajectory).toHaveLength(12);
  });

  it("marks every point as real (non-synthetic) data", () => {
    expect(trajectory.every((point) => point.isSynthetic === false)).toBe(true);
  });

  it("uses new_cases_smoothed as the projected value, in chronological order", () => {
    expect(trajectory[0]?.date).toBe("2026-04-16");
    expect(trajectory[0]?.projectedCases).toBe(54);
    expect(trajectory[trajectory.length - 1]?.date).toBe("2026-04-27");
    expect(trajectory[trajectory.length - 1]?.projectedCases).toBe(22);
  });

  it("derives a +-10% confidence band", () => {
    const point = trajectory[0]!;
    expect(point.confidenceLow).toBe(Math.round(point.projectedCases * 0.9));
    expect(point.confidenceHigh).toBe(Math.round(point.projectedCases * 1.1));
  });
});

describe("owidMpoxAdapter", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => textResponse(MPOX_CSV)),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("exposes the expected adapter metadata", () => {
    expect(owidMpoxAdapter.id).toBe("owid-mpox");
    expect(owidMpoxAdapter.kind).toBe("metrics");
  });

  it("fetches and parses country metrics", async () => {
    const metrics = await owidMpoxAdapter.fetchMetrics();
    expect(metrics.length).toBeGreaterThan(0);
    expect(metrics.every((m) => m.slug === "mpox")).toBe(true);
  });

  it("rejects when the upstream fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => textResponse("", false, 503)),
    );

    await expect(owidMpoxAdapter.fetchMetrics()).rejects.toThrow(/status 503/);
  });

  it("rejects when the network request itself throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );

    await expect(owidMpoxAdapter.fetchMetrics()).rejects.toThrow("network down");
  });
});

describe("mpoxTrajectoryProvider", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => textResponse(MPOX_CSV)),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("exposes the mpox virus slug", () => {
    expect(mpoxTrajectoryProvider.virusSlug).toBe("mpox");
  });

  it("fetches and parses a real global trajectory", async () => {
    const trajectory = await mpoxTrajectoryProvider.fetchTrajectory();
    expect(trajectory.length).toBeGreaterThan(0);
    expect(trajectory.every((point) => point.isSynthetic === false)).toBe(true);
  });

  it("rejects when the upstream fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => textResponse("", false, 503)),
    );

    await expect(mpoxTrajectoryProvider.fetchTrajectory()).rejects.toThrow(/status 503/);
  });
});
