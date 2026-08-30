import Parser from "rss-parser";

import type { NewsItem } from "@/lib/types";
import { tagNewsItem } from "@/server/data/news-tagging";

import type { NewsAdapter } from "./types";

const parser = new Parser();

function safeLink(rawLink: string | undefined): string {
  if (!rawLink) return "https://news.google.com";
  return rawLink.startsWith("http://") || rawLink.startsWith("https://")
    ? rawLink
    : "https://news.google.com";
}

async function fetchNews(): Promise<NewsItem[]> {
  const rss = await parser.parseURL("https://reliefweb.int/updates/rss.xml?search=epidemic%20OR%20virus");
  return (rss.items ?? []).slice(0, 25).map((item, index) => {
    const title = item.title ?? "ReliefWeb outbreak update";
    const summary = item.contentSnippet ?? "Global health emergency bulletin.";
    return {
      id: item.guid ?? `relief-${index}`,
      title,
      link: safeLink(item.link),
      source: "ReliefWeb",
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      summary,
      virusTags: tagNewsItem(title, summary),
    };
  });
}

export const reliefWebAdapter: NewsAdapter = {
  id: "reliefweb-rss",
  sourceName: "reliefweb-rss",
  kind: "news",
  fetchNews,
};
