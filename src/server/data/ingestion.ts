import Parser from "rss-parser";
import Papa from "papaparse";

import type { NewsItem, RegionMetric } from "@/lib/types";
import { calculateGrowthRate } from "@/server/analysis";
import { fallbackMetrics, fallbackNews } from "@/server/data/fallback-data";
import { buildLocationId, dedupeAndMergeMetrics } from "@/server/data/location-normalization";

const parser = new Parser();

type SourceHealthRecord = { source: string; healthy: boolean; message: string };

type MetricAdapter = {
  source: string;
  run: () => Promise<RegionMetric[]>;
};

type NewsAdapter = {
  source: string;
  run: () => Promise<NewsItem[]>;
};

function safeLink(rawLink: string | undefined): string {
  if (!rawLink) return "https://news.google.com";
  return rawLink.startsWith("http://") || rawLink.startsWith("https://")
    ? rawLink
    : "https://news.google.com";
}

function parseEcdcDate(rawDate: string): string {
  const [day, month, year] = rawDate.split("/");
  if (!day || !month || !year) return new Date().toISOString();
  return new Date(`${year}-${month}-${day}T00:00:00.000Z`).toISOString();
}

function toSafeNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function baseMetric(input: Omit<RegionMetric, "locationId">): RegionMetric {
  return {
    ...input,
    locationId: buildLocationId(input),
  };
}

async function fetchDiseaseShCountries(): Promise<RegionMetric[]> {
  const response = await fetch("https://disease.sh/v3/covid-19/countries", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Disease.sh feed failed with status ${response.status}`);
  }

  const payload = (await response.json()) as Array<{
    country: string;
    countryInfo: { iso2: string | null; lat: number; long: number };
    active: number;
    cases: number;
    deaths: number;
    recovered: number;
    updated: number;
  }>;

  return payload.map((item) =>
    baseMetric({
      virus: "COVID-19",
      slug: "covid-19",
      region: item.country,
      locationLevel: "country",
      countryName: item.country,
      source: "disease.sh-countries",
      sourceConfidence: 0.95,
      countryCode: item.countryInfo.iso2 ?? "N/A",
      latitude: item.countryInfo.lat,
      longitude: item.countryInfo.long,
      activeCases: toSafeNumber(item.active),
      confirmedCases: toSafeNumber(item.cases),
      deaths: toSafeNumber(item.deaths),
      recovered: toSafeNumber(item.recovered),
      updatedAt: new Date(item.updated).toISOString(),
    }),
  );
}

async function fetchDiseaseShUsStates(): Promise<RegionMetric[]> {
  const response = await fetch("https://disease.sh/v3/covid-19/states", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Disease.sh US states feed failed with status ${response.status}`);
  }

  const payload = (await response.json()) as Array<{
    state: string;
    cases: number;
    active: number;
    deaths: number;
    recovered?: number;
    updated: number;
  }>;

  return payload.map((item) =>
    baseMetric({
      virus: "COVID-19",
      slug: "covid-19",
      region: item.state,
      locationLevel: "admin1",
      countryName: "United States",
      admin1Name: item.state,
      admin1Code: item.state,
      source: "disease.sh-us-states",
      sourceConfidence: 0.92,
      countryCode: "US",
      latitude: 37.09,
      longitude: -95.71,
      activeCases: toSafeNumber(item.active),
      confirmedCases: toSafeNumber(item.cases),
      deaths: toSafeNumber(item.deaths),
      recovered: Math.max(
        toSafeNumber(item.recovered ?? item.cases) -
          toSafeNumber(item.active) -
          toSafeNumber(item.deaths),
        0,
      ),
      updatedAt: new Date(item.updated).toISOString(),
    }),
  );
}

async function fetchEcdcWeeklyCovid(): Promise<RegionMetric[]> {
  const response = await fetch(
    "https://opendata.ecdc.europa.eu/covid19/casedistribution/csv",
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(`ECDC feed failed with status ${response.status}`);
  }

  const csv = await response.text();
  const parsed = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });
  const latestByCountry = new Map<string, Record<string, string>>();

  for (const row of parsed.data) {
    const geoId = row.geoId?.trim();
    const countriesAndTerritories = row.countriesAndTerritories?.replace(/_/g, " ").trim();
    const dateRep = row.dateRep?.trim();
    if (!geoId || !countriesAndTerritories || !dateRep) continue;

    const current = latestByCountry.get(geoId);
    if (!current) {
      latestByCountry.set(geoId, row);
      continue;
    }

    const currentDate = new Date(parseEcdcDate(current.dateRep ?? "")).getTime();
    const nextDate = new Date(parseEcdcDate(dateRep)).getTime();
    if (nextDate > currentDate) {
      latestByCountry.set(geoId, row);
    }
  }

  return Array.from(latestByCountry.entries()).map(([geoId, row]) =>
    baseMetric({
      virus: "COVID-19",
      slug: "covid-19",
      region: (row.countriesAndTerritories ?? geoId).replace(/_/g, " "),
      locationLevel: "country",
      countryName: (row.countriesAndTerritories ?? geoId).replace(/_/g, " "),
      source: "ecdc-covid",
      sourceConfidence: 0.88,
      countryCode: geoId,
      latitude: 0,
      longitude: 0,
      activeCases: toSafeNumber(row.cases),
      confirmedCases: toSafeNumber(row.cases),
      deaths: toSafeNumber(row.deaths),
      recovered: 0,
      updatedAt: parseEcdcDate(row.dateRep ?? ""),
    }),
  );
}

async function fetchOurWorldInDataCovid(): Promise<RegionMetric[]> {
  const response = await fetch(
    "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/latest/owid-covid-latest.csv",
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(`OWID latest feed failed with status ${response.status}`);
  }

  const csv = await response.text();
  const parsed = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });

  return parsed.data
    .filter((row) => (row.iso_code ?? "").length === 3 && row.location)
    .map((row) =>
      baseMetric({
        virus: "COVID-19",
        slug: "covid-19",
        region: row.location ?? "Unknown",
        locationLevel: "country",
        countryName: row.location ?? "Unknown",
        source: "owid-covid-latest",
        sourceConfidence: 0.9,
        countryCode: row.iso_code ?? "N/A",
        latitude: toSafeNumber(row.latitude),
        longitude: toSafeNumber(row.longitude),
        activeCases: toSafeNumber(row.new_cases),
        confirmedCases: toSafeNumber(row.total_cases),
        deaths: toSafeNumber(row.total_deaths),
        recovered: 0,
        updatedAt: new Date().toISOString(),
      }),
    );
}

async function fetchGoogleOutbreakNews(): Promise<NewsItem[]> {
  const rss = await parser.parseURL(
    "https://news.google.com/rss/search?q=virus+outbreak+when:7d&hl=en-US&gl=US&ceid=US:en",
  );

  return (rss.items ?? []).slice(0, 20).map((item, index) => {
    const title = item.title ?? "Virus update";
    const description = item.contentSnippet ?? "No summary available.";
    const lower = `${title} ${description}`.toLowerCase();
    const tags = ["COVID-19", "Dengue", "Influenza", "Ebola"].filter((label) =>
      lower.includes(label.toLowerCase().split("-")[0]),
    );

    return {
      id: item.guid ?? `rss-${index}`,
      title,
      link: safeLink(item.link),
      source: item.creator ?? "Google News RSS",
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      summary: description,
      virusTags: tags.length > 0 ? tags : ["General"],
    };
  });
}

async function fetchWhoDonNews(): Promise<NewsItem[]> {
  const rss = await parser.parseURL("https://www.who.int/feeds/entity/csr/don/en/rss.xml");
  return (rss.items ?? []).slice(0, 25).map((item, index) => ({
    id: item.guid ?? `who-don-${index}`,
    title: item.title ?? "WHO DON update",
    link: safeLink(item.link),
    source: "WHO Disease Outbreak News",
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    summary: item.contentSnippet ?? "WHO outbreak bulletin update.",
    virusTags: ["General"],
  }));
}

async function fetchReliefWebNews(): Promise<NewsItem[]> {
  const rss = await parser.parseURL("https://reliefweb.int/updates/rss.xml?search=epidemic%20OR%20virus");
  return (rss.items ?? []).slice(0, 25).map((item, index) => ({
    id: item.guid ?? `relief-${index}`,
    title: item.title ?? "ReliefWeb outbreak update",
    link: safeLink(item.link),
    source: "ReliefWeb",
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    summary: item.contentSnippet ?? "Global health emergency bulletin.",
    virusTags: ["General"],
  }));
}

export type IngestionState = {
  metrics: RegionMetric[];
  news: NewsItem[];
  sourceHealth: SourceHealthRecord[];
};

export async function runIngestion(): Promise<IngestionState> {
  const sourceHealth: IngestionState["sourceHealth"] = [];
  const metricAdapters: MetricAdapter[] = [
    { source: "disease.sh-countries", run: fetchDiseaseShCountries },
    { source: "disease.sh-us-states", run: fetchDiseaseShUsStates },
    { source: "ecdc-covid", run: fetchEcdcWeeklyCovid },
    { source: "owid-covid-latest", run: fetchOurWorldInDataCovid },
  ];
  const newsAdapters: NewsAdapter[] = [
    { source: "google-news-rss", run: fetchGoogleOutbreakNews },
    { source: "who-don-rss", run: fetchWhoDonNews },
    { source: "reliefweb-rss", run: fetchReliefWebNews },
  ];

  const metricResults: RegionMetric[] = [];
  for (const adapter of metricAdapters) {
    try {
      const records = await adapter.run();
      metricResults.push(...records);
      sourceHealth.push({
        source: adapter.source,
        healthy: true,
        message: `Fetched ${records.length} records`,
      });
    } catch (error) {
      sourceHealth.push({
        source: adapter.source,
        healthy: false,
        message: error instanceof Error ? error.message : `Unknown ${adapter.source} error`,
      });
    }
  }

  const newsResults: NewsItem[] = [];
  for (const adapter of newsAdapters) {
    try {
      const stories = await adapter.run();
      newsResults.push(...stories);
      sourceHealth.push({
        source: adapter.source,
        healthy: true,
        message: `Fetched ${stories.length} stories`,
      });
    } catch (error) {
      sourceHealth.push({
        source: adapter.source,
        healthy: false,
        message: error instanceof Error ? error.message : `Unknown ${adapter.source} error`,
      });
    }
  }

  const enrichedFallback = fallbackMetrics.map((item) => ({
    ...item,
    activeCases: Math.round(item.activeCases * (1 + calculateGrowthRate(item) / 1000)),
    updatedAt: new Date().toISOString(),
  }));

  const metricsPool = metricResults.length > 0 ? [...metricResults, ...enrichedFallback] : fallbackMetrics;
  const metrics = dedupeAndMergeMetrics(metricsPool);
  const uniqueNews = Array.from(
    new Map((newsResults.length > 0 ? newsResults : fallbackNews).map((item) => [item.link, item])).values(),
  ).slice(0, 120);

  return {
    metrics,
    news: uniqueNews,
    sourceHealth,
  };
}
