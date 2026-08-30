import type { TrajectoryPoint } from "@/lib/types";

/**
 * disease.sh historical/all COVID-19 trajectory feed.
 *
 * https://disease.sh/v3/covid-19/historical/all?lastdays=90 returns global
 * CUMULATIVE totals keyed by date (format "M/D/YY", e.g. "1/5/26"):
 *   { cases: { "1/5/26": 671032404, ... }, deaths: {...}, recovered: {...} }
 *
 * This adapter converts the cumulative `cases` series into a daily
 * new-cases series, applies a trailing 7-day rolling average to smooth
 * reporting noise/weekend dips, and emits a real (non-synthetic)
 * TrajectoryPoint[] — `isSynthetic` is always `false` here because every
 * point is derived directly from reported cumulative totals, not a
 * projection model.
 */

const COVID_HISTORICAL_URL = "https://disease.sh/v3/covid-19/historical/all?lastdays=90";

const SMOOTHING_WINDOW_DAYS = 7;
const CONFIDENCE_BAND_RATIO = 0.1;

export type DiseaseShHistoricalAllPayload = {
  cases?: Record<string, number>;
  deaths?: Record<string, number>;
  recovered?: Record<string, number>;
};

function toSafeNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * disease.sh date keys look like "1/5/26" (M/D/YY, no leading zeros).
 * Two-digit years are assumed to be 2000+YY, which matches every date
 * range this feed has ever returned.
 */
export function parseDiseaseShDateKey(dateKey: string): string {
  const parts = dateKey.split("/").map((part) => Number(part));
  const [month, day, twoDigitYear] = parts;

  if (!Number.isFinite(month) || !Number.isFinite(day) || !Number.isFinite(twoDigitYear)) {
    throw new Error(`Unrecognized disease.sh date key: "${dateKey}"`);
  }

  const fullYear = 2000 + (twoDigitYear as number);
  const date = new Date(Date.UTC(fullYear, (month as number) - 1, day as number));
  return date.toISOString().slice(0, 10);
}

type DailySeriesPoint = { date: string; newCases: number };

/** Object key order for JSON-parsed non-numeric-looking string keys matches insertion order, so this walks the feed chronologically as returned. */
function toDailyNewCases(cumulative: Record<string, number>): DailySeriesPoint[] {
  const series: DailySeriesPoint[] = [];
  let previousCumulative: number | null = null;

  for (const [dateKey, rawValue] of Object.entries(cumulative)) {
    const cumulativeValue = toSafeNumber(rawValue);
    const newCases = previousCumulative === null ? 0 : Math.max(0, cumulativeValue - previousCumulative);
    previousCumulative = cumulativeValue;
    series.push({ date: parseDiseaseShDateKey(dateKey), newCases });
  }

  return series;
}

function smoothTrailingAverage(series: DailySeriesPoint[], windowDays: number): number[] {
  return series.map((_, index) => {
    const windowStart = Math.max(0, index - (windowDays - 1));
    const window = series.slice(windowStart, index + 1);
    const sum = window.reduce((total, point) => total + point.newCases, 0);
    return sum / window.length;
  });
}

/** Pure transform from the raw feed payload to trajectory points — exported for direct unit testing. */
export function buildCovidTrajectory(payload: DiseaseShHistoricalAllPayload): TrajectoryPoint[] {
  const daily = toDailyNewCases(payload.cases ?? {});
  const smoothed = smoothTrailingAverage(daily, SMOOTHING_WINDOW_DAYS);

  return daily.map((point, index) => {
    const projectedCases = Math.round(smoothed[index] ?? 0);
    return {
      date: point.date,
      projectedCases,
      confidenceLow: Math.round(projectedCases * (1 - CONFIDENCE_BAND_RATIO)),
      confidenceHigh: Math.round(projectedCases * (1 + CONFIDENCE_BAND_RATIO)),
      isSynthetic: false,
    };
  });
}

async function fetchTrajectory(signal?: AbortSignal): Promise<TrajectoryPoint[]> {
  const response = await fetch(COVID_HISTORICAL_URL, { cache: "no-store", signal });

  if (!response.ok) {
    throw new Error(`disease.sh historical/all feed failed with status ${response.status}`);
  }

  const payload = (await response.json()) as DiseaseShHistoricalAllPayload;
  return buildCovidTrajectory(payload);
}

export const covidHistoricalProvider = {
  virusSlug: "covid-19" as const,
  fetchTrajectory,
};
