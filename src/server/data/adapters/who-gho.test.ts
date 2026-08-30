import fs from "node:fs";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { whoGhoAdapter } from "./who-gho";

const FIXTURES_DIR = path.join(__dirname, "__fixtures__");

const CHOLERA_FIXTURE = JSON.parse(
  fs.readFileSync(path.join(FIXTURES_DIR, "who-gho-cholera.json"), "utf-8"),
);
const MEASLES_FIXTURE = JSON.parse(
  fs.readFileSync(path.join(FIXTURES_DIR, "who-gho-measles.json"), "utf-8"),
);

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
  } as Response;
}

describe("whoGhoAdapter", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("CHOLERA_0000000001")) {
          return jsonResponse(CHOLERA_FIXTURE);
        }
        if (url.includes("WHS3_62")) {
          return jsonResponse(MEASLES_FIXTURE);
        }
        throw new Error(`Unexpected URL in test: ${url}`);
      }),
    );
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("exposes the expected adapter metadata", () => {
    expect(whoGhoAdapter.id).toBe("who-gho");
    expect(whoGhoAdapter.sourceName).toBe("WHO Global Health Observatory");
    expect(whoGhoAdapter.kind).toBe("metrics");
  });

  it("maps both indicators, keeping only the latest year per country", async () => {
    const metrics = await whoGhoAdapter.fetchMetrics();

    const cholera = metrics.filter((m) => m.slug === "cholera");
    const measles = metrics.filter((m) => m.slug === "measles");

    // XYZ / QQQ have no centroid mapping and the REGION-level rows are not
    // countries, so they must not appear.
    expect(cholera.map((m) => m.countryCode).sort()).toEqual(["CD", "NG", "SO", "YE"].sort());
    expect(measles.map((m) => m.countryCode).sort()).toEqual(["IN", "PH", "UA", "US"].sort());

    // Yemen has 2018 and 2019 rows — the higher-value 2018 figure must be
    // discarded in favor of the latest (2019) year, not the largest value.
    const yemen = cholera.find((m) => m.countryCode === "YE");
    expect(yemen?.confirmedCases).toBe(92003);
    expect(yemen?.asOf).toBe("2019");

    const somalia = cholera.find((m) => m.countryCode === "SO");
    expect(somalia?.confirmedCases).toBe(1928);
    expect(somalia?.asOf).toBe("2019");

    const philippines = measles.find((m) => m.countryCode === "PH");
    expect(philippines?.confirmedCases).toBe(47871);
    expect(philippines?.asOf).toBe("2019");
  });

  it("sets virus identity, conservative activeCases proxy, and annual metadata", async () => {
    const metrics = await whoGhoAdapter.fetchMetrics();
    const yemen = metrics.find((m) => m.slug === "cholera" && m.countryCode === "YE");

    expect(yemen).toBeDefined();
    expect(yemen?.virus).toBe("Cholera");
    expect(yemen?.source).toBe("who-gho");
    expect(yemen?.sourceConfidence).toBeCloseTo(0.85);
    expect(yemen?.deaths).toBe(0);
    // Documented proxy: activeCases mirrors the annual confirmedCases total.
    expect(yemen?.activeCases).toBe(yemen?.confirmedCases);
    expect(yemen?.updatedAt).toBe(new Date(Date.UTC(2019, 11, 31)).toISOString());
    expect(yemen?.latitude).toBeCloseTo(15.5527);
    expect(yemen?.longitude).toBeCloseTo(48.5164);
    expect(yemen?.locationId).toBe("country:YE");
  });

  it("does not export any trajectory data (annual totals must not fake a daily trajectory)", () => {
    const adapterAsUnknown = whoGhoAdapter as unknown as Record<string, unknown>;
    expect(adapterAsUnknown.fetchTrajectory).toBeUndefined();
    expect(adapterAsUnknown.trajectory).toBeUndefined();
  });

  it("rejects when the upstream fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ value: [] }, false, 503)),
    );

    await expect(whoGhoAdapter.fetchMetrics()).rejects.toThrow(/status 503/);
  });

  it("rejects when the network request itself throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );

    await expect(whoGhoAdapter.fetchMetrics()).rejects.toThrow("network down");
  });
});
