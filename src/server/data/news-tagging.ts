import { VIRUSES } from "@/lib/viruses";
import type { NewsItem } from "@/lib/types";

/** Fallback tag applied when no known virus is mentioned in a news item. */
const GENERAL_TAG = "General";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Builds a case-insensitive, word-boundary regex for a single alias/name term.
 * Word-boundary matching prevents short aliases (e.g. "flu") from matching
 * inside unrelated words (e.g. "influenza" would otherwise self-match "flu").
 */
function buildTermPattern(term: string): RegExp | null {
  const trimmed = term.trim();
  if (!trimmed) return null;
  return new RegExp(`\\b${escapeRegExp(trimmed)}\\b`, "i");
}

/**
 * Tags a news item with every virus (from the live VIRUSES registry) whose
 * name, shortName, or newsAliases appear in the title/summary text, matched
 * case-insensitively on word boundaries. Returns display names matching the
 * existing virusTags convention (e.g. "COVID-19"). Falls back to ["General"]
 * when nothing matches.
 */
export function tagNewsItem(title: string, summary: string | undefined): string[] {
  const haystack = `${title ?? ""} ${summary ?? ""}`;
  const matched: string[] = [];

  for (const virus of VIRUSES) {
    const terms = [virus.name, virus.shortName, ...virus.newsAliases];
    const isMatch = terms.some((term) => {
      const pattern = buildTermPattern(term);
      return pattern ? pattern.test(haystack) : false;
    });

    if (isMatch && !matched.includes(virus.name)) {
      matched.push(virus.name);
    }
  }

  return matched.length > 0 ? matched : [GENERAL_TAG];
}

/**
 * Normalizes a title for near-duplicate detection: lowercases and strips all
 * punctuation/whitespace so that titles differing only in casing, dashes, or
 * spacing collapse to the same key.
 */
export function normalizeTitleKey(title: string): string {
  return (title ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/**
 * Deduplicates news items whose normalized titles match, keeping the copy
 * with the earliest publishedAt timestamp (the earliest-source report of the
 * same story) for each group, while preserving the relative order in which
 * each distinct story was first seen.
 */
export function dedupeNews(items: NewsItem[]): NewsItem[] {
  const bestByKey = new Map<string, NewsItem>();
  const keyOrder: string[] = [];

  for (const item of items) {
    const key = normalizeTitleKey(item.title);
    const existing = bestByKey.get(key);

    if (!existing) {
      bestByKey.set(key, item);
      keyOrder.push(key);
      continue;
    }

    const existingTime = Date.parse(existing.publishedAt);
    const itemTime = Date.parse(item.publishedAt);
    const existingIsValid = !Number.isNaN(existingTime);
    const itemIsValid = !Number.isNaN(itemTime);

    if (itemIsValid && (!existingIsValid || itemTime < existingTime)) {
      bestByKey.set(key, item);
    }
  }

  return keyOrder.map((key) => bestByKey.get(key)!);
}
