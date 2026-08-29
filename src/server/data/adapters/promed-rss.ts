import Parser from "rss-parser";

import type { NewsItem } from "@/lib/types";
import { tagNewsItem } from "@/server/data/news-tagging";

import type { NewsAdapter } from "./types";

const parser = new Parser();

function safeLink(rawLink: string | undefined): string {
  if (!rawLink) return "https://promedmail.org";
  return rawLink.startsWith("http://") || rawLink.startsWith("https://")
    ? rawLink
    : "https://promedmail.org";
}

async function fetchNews(): Promise<NewsItem[]> {
  const rss = await parser.parseURL("https://promedmail.org/feed/");
  return (rss.items ?? []).slice(0, 25).map((item, index) => {
    const title = item.title ?? "ProMED-mail update";
    const summary = item.contentSnippet ?? "ProMED-mail outbreak report.";
    return {
      id: item.guid ?? `promed-${index}`,
      title,
      link: safeLink(item.link),
      source: "ProMED-mail",
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      summary,
      virusTags: tagNewsItem(title, summary),
    };
  });
}

export const promedRssAdapter: NewsAdapter = {
  id: "promed-rss",
  sourceName: "ProMED-mail",
  kind: "news",
  fetchNews,
};
