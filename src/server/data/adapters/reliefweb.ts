import Parser from "rss-parser";

import type { NewsItem } from "@/lib/types";

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

export const reliefWebAdapter: NewsAdapter = {
  id: "reliefweb-rss",
  sourceName: "reliefweb-rss",
  kind: "news",
  fetchNews,
};
