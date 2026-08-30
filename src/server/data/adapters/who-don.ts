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
  const rss = await parser.parseURL("https://www.who.int/feeds/entity/csr/don/en/rss.xml");
  return (rss.items ?? []).slice(0, 25).map((item, index) => {
    const title = item.title ?? "WHO DON update";
    const summary = item.contentSnippet ?? "WHO outbreak bulletin update.";
    return {
      id: item.guid ?? `who-don-${index}`,
      title,
      link: safeLink(item.link),
      source: "WHO Disease Outbreak News",
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      summary,
      virusTags: tagNewsItem(title, summary),
    };
  });
}

export const whoDonAdapter: NewsAdapter = {
  id: "who-don-rss",
  sourceName: "who-don-rss",
  kind: "news",
  fetchNews,
};
