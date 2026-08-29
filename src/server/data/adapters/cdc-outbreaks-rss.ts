import Parser from "rss-parser";

import type { NewsItem } from "@/lib/types";
import { tagNewsItem } from "@/server/data/news-tagging";

import type { NewsAdapter } from "./types";

const parser = new Parser();

// CDC's media/syndication RSS feeds are served from tools.cdc.gov/api/v2/resources/media/<id>.rss.
// 285676 is CDC's "Outbreaks" topic feed (Current Outbreak List / outbreak advisories). CDC rotates
// feed ids occasionally; if this feed goes stale or 404s, the orchestrator's source health record
// will surface it as unhealthy rather than failing ingestion outright.
const CDC_OUTBREAKS_FEED_URL = "https://tools.cdc.gov/api/v2/resources/media/285676.rss";

function safeLink(rawLink: string | undefined): string {
  if (!rawLink) return "https://www.cdc.gov/outbreaks/";
  return rawLink.startsWith("http://") || rawLink.startsWith("https://")
    ? rawLink
    : "https://www.cdc.gov/outbreaks/";
}

async function fetchNews(): Promise<NewsItem[]> {
  const rss = await parser.parseURL(CDC_OUTBREAKS_FEED_URL);
  return (rss.items ?? []).slice(0, 25).map((item, index) => {
    const title = item.title ?? "CDC outbreak update";
    const summary = item.contentSnippet ?? "CDC outbreak advisory.";
    return {
      id: item.guid ?? `cdc-outbreaks-${index}`,
      title,
      link: safeLink(item.link),
      source: "CDC Outbreaks",
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      summary,
      virusTags: tagNewsItem(title, summary),
    };
  });
}

export const cdcOutbreaksRssAdapter: NewsAdapter = {
  id: "cdc-outbreaks-rss",
  sourceName: "CDC Outbreaks",
  kind: "news",
  fetchNews,
};
