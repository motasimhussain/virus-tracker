/**
 * copy.ts — the single source of plain-English UI language for virus-tracker.
 *
 * Tone rules (apply everywhere copy is written, here and elsewhere):
 * 1. Grade-8 reading level. Short sentences, common words, no filler.
 * 2. Lead with meaning, not jargon. Say what a number MEANS before you say
 *    what it's called. "About 2 of every 100 confirmed cases died" beats
 *    "Case fatality ratio: 2.1%".
 * 3. Numbers are humanized. Round sensibly, use "about", spell out scale
 *    ("1.2 million" style formatting, relative time like "12 minutes ago")
 *    instead of raw decimals or timestamps.
 * 4. Jargon is allowed only as a secondary, technical line — never as the
 *    primary label a reader sees first. Every plain-English entry below
 *    carries its technical name alongside it for readers who want it.
 */

export type MetricKey =
  | "activeCases"
  | "confirmedCases"
  | "deaths"
  | "recovered"
  | "cfr"
  | "growthRate"
  | "pressure"
  | "recoveryRatio"
  | "severityScore"
  | "confidence"
  | "staleness"
  | "trackedViruses"
  | "newCases7d"
  | "incidencePer100k";

export type MetricCopy = {
  /** Plain-English label shown as the primary UI text. */
  label: string;
  /** Technical/jargon name, shown as a secondary line for readers who want it. */
  technical: string;
  /** Humanized sentence describing a specific value. */
  plain: (v: number) => string;
  /** One or two sentences explaining what the metric means and why it matters. */
  explainer: string;
};

export const METRIC_COPY: Record<MetricKey, MetricCopy> = {
  activeCases: {
    label: "Active cases",
    technical: "Active cases",
    plain: (v) => `${formatCompactNumber(v)} people currently have this virus`,
    explainer: "The number of confirmed cases that haven't yet resolved — people who are still sick, as far as reporting shows.",
  },
  confirmedCases: {
    label: "Confirmed cases",
    technical: "Cumulative confirmed cases",
    plain: (v) => `${formatCompactNumber(v)} cases confirmed in total`,
    explainer: "The running total of everyone who has ever tested positive or been diagnosed, since tracking began.",
  },
  deaths: {
    label: "Deaths",
    technical: "Cumulative deaths",
    plain: (v) => `${formatCompactNumber(v)} deaths reported in total`,
    explainer: "The running total of deaths attributed to this virus, since tracking began.",
  },
  recovered: {
    label: "Recovered",
    technical: "Cumulative recoveries",
    plain: (v) => `${formatCompactNumber(v)} people have recovered`,
    explainer: "The running total of confirmed cases that resolved without death.",
  },
  cfr: {
    label: "How deadly",
    technical: "Case fatality ratio (CFR)",
    plain: (v) => `About ${v.toFixed(1)} of every 100 confirmed cases died`,
    explainer: "The share of confirmed cases that ended in death. Higher means the disease is more likely to kill someone who catches it.",
  },
  growthRate: {
    label: "How fast it's spreading",
    technical: "Growth rate",
    plain: (v) => (v >= 0 ? `Cases are growing about ${v.toFixed(1)}% a period` : `Cases are shrinking about ${Math.abs(v).toFixed(1)}% a period`),
    explainer: "How quickly the case count is rising or falling compared to the last period. Positive means it's speeding up, negative means it's slowing down.",
  },
  pressure: {
    label: "Outbreak activity",
    technical: "Pressure index",
    plain: (v) => `Outbreak activity score of ${v.toFixed(2)}`,
    explainer: "A blended score of how much strain this outbreak is putting on a region right now, combining case volume and momentum.",
  },
  recoveryRatio: {
    label: "Recovery rate",
    technical: "Recovery ratio",
    plain: (v) => `About ${v.toFixed(1)} of every 100 confirmed cases have recovered`,
    explainer: "The share of confirmed cases that have recovered so far.",
  },
  severityScore: {
    label: "Overall threat level",
    technical: "Severity score",
    plain: (v) => `Overall threat level of ${v.toFixed(1)}`,
    explainer: "A single score combining how many people are affected and how serious the outbreak is, so regions can be compared at a glance.",
  },
  confidence: {
    label: "Data reliability",
    technical: "Confidence-adjusted exposure",
    plain: (v) => `Data reliability score of ${(v * 100).toFixed(0)}%`,
    explainer: "How much we trust the underlying numbers, based on the track record of the sources reporting them.",
  },
  staleness: {
    label: "Data age",
    technical: "Stale data zones",
    plain: (v) => `${formatCompactNumber(v)} outdated data areas`,
    explainer: "Places where the latest figures haven't been refreshed recently, so the real picture may have changed.",
  },
  trackedViruses: {
    label: "Tracked viruses",
    technical: "Tracked viruses",
    plain: (v) => `Tracking ${formatCompactNumber(v)} viruses`,
    explainer: "The number of distinct viruses this dashboard currently follows.",
  },
  newCases7d: {
    label: "New cases this week",
    technical: "New cases (7-day)",
    plain: (v) => `${formatCompactNumber(v)} new cases in the last 7 days`,
    explainer: "The number of newly confirmed cases over the past week — a quick read on current momentum.",
  },
  incidencePer100k: {
    label: "Cases per 100,000 people",
    technical: "Incidence per 100k",
    plain: (v) => `About ${v.toFixed(1)} cases for every 100,000 people`,
    explainer: "Case counts adjusted for population size, so places of different sizes can be compared fairly.",
  },
};

export const TREND_COPY: Record<"rising" | "stable" | "falling", { label: string; sentence: (virus: string, place?: string) => string }> = {
  rising: {
    label: "Rising",
    sentence: (virus, place) => `${virus} cases are rising${place ? ` in ${place}` : ""}.`,
  },
  stable: {
    label: "Stable",
    sentence: (virus, place) => `${virus} cases are holding steady${place ? ` in ${place}` : ""}.`,
  },
  falling: {
    label: "Falling",
    sentence: (virus, place) => `${virus} cases are falling${place ? ` in ${place}` : ""}.`,
  },
};

export const COVERAGE_COPY: Record<"live" | "periodic" | "curated", { label: string; description: string }> = {
  live: {
    label: "Live data",
    description: "Live data — updated daily from public health sources.",
  },
  periodic: {
    label: "Periodic reports",
    description: "Official periodic reports (e.g. annual WHO totals).",
  },
  curated: {
    label: "Curated estimate",
    description: "Curated estimate — reviewed figures, updated periodically.",
  },
};

/**
 * Format a number the way a person would say it: "1.2M", "84K", "1,204".
 */
export function formatCompactNumber(n: number): string {
  const abs = Math.abs(n);
  if (abs < 1000) {
    return Intl.NumberFormat("en-US").format(n);
  }
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/**
 * Format an ISO date as "Updated 12 minutes ago" / "Updated 3 hours ago".
 */
export function formatRelativeMinutes(isoDate: string): string {
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) {
    return "Updated recently";
  }
  const now = Date.now();
  const diffMs = now - then;
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) {
    return "Updated just now";
  }
  if (diffMinutes < 60) {
    return `Updated ${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `Updated ${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }
  const diffDays = Math.round(diffHours / 24);
  return `Updated ${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}
