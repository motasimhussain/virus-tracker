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

export const googleNewsAdapter: NewsAdapter = {
  id: "google-news-rss",
  sourceName: "google-news-rss",
  kind: "news",
  fetchNews,
};
