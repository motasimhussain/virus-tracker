import { describe, expect, it } from "vitest";

import type { NewsItem } from "@/lib/types";
import { dedupeNews, normalizeTitleKey, tagNewsItem } from "@/server/data/news-tagging";

describe("tagNewsItem", () => {
  it("tags a WHO DON-style cholera bulletin", () => {
    expect(tagNewsItem("Cholera – Haiti", undefined)).toEqual(["Cholera"]);
  });

  it("tags a Marburg virus disease bulletin", () => {
    expect(tagNewsItem("Marburg virus disease - Rwanda", "Update on the outbreak in Rwanda.")).toEqual([
      "Marburg",
    ]);
  });

  it("falls back to General when no virus is mentioned", () => {
    expect(tagNewsItem("Regional health ministry budget update", "No outbreak mentioned here.")).toEqual([
      "General",
    ]);
  });

  it("matches multiple viruses mentioned in the same item", () => {
    const tags = tagNewsItem(
      "Ebola and Marburg cases reported in neighboring districts",
      "Health officials are monitoring both outbreaks closely.",
    );
    expect(tags).toContain("Ebola");
    expect(tags).toContain("Marburg");
    expect(tags).toHaveLength(2);
  });

  it("matches on shortName and newsAliases, not just the display name", () => {
    expect(tagNewsItem("New H5N1 case confirmed", undefined)).toEqual(["Avian Influenza (H5N1)"]);
    // "bird flu" matches the H5N1 alias, and the standalone word "flu" also
    // matches Influenza's shortName/alias — both are legitimately relevant.
    const tags = tagNewsItem("Bird flu detected in poultry farm", undefined);
    expect(tags).toContain("Avian Influenza (H5N1)");
    expect(tags).toContain("Influenza");
    expect(tags).toHaveLength(2);
  });

  it("does not false-positive match short aliases inside unrelated words", () => {
    // "flu" is an Influenza alias but must not match inside "influencer"/"fluent" etc.
    expect(tagNewsItem("Fluent speakers needed for influencer campaign", undefined)).toEqual(["General"]);
  });

  it("is case-insensitive", () => {
    expect(tagNewsItem("covid-19 CASES rise", undefined)).toEqual(["COVID-19"]);
  });

  it("dedupes repeated matches into a single tag", () => {
    expect(tagNewsItem("Dengue dengue outbreak: dengue fever spreads", undefined)).toEqual(["Dengue"]);
  });
});

describe("normalizeTitleKey", () => {
  it("lowercases and strips punctuation/whitespace", () => {
    expect(normalizeTitleKey("Cholera – Haiti")).toBe("cholerahaiti");
    expect(normalizeTitleKey("Cholera - Haiti!")).toBe("cholerahaiti");
    expect(normalizeTitleKey("  Cholera   Haiti  ")).toBe("cholerahaiti");
  });

  it("treats differently-cased near-duplicates as the same key", () => {
    expect(normalizeTitleKey("Marburg Virus Disease - Rwanda")).toBe(
      normalizeTitleKey("marburg virus disease: rwanda"),
    );
  });
});

describe("dedupeNews", () => {
  function item(overrides: Partial<NewsItem>): NewsItem {
    return {
      id: "id",
      title: "title",
      link: "https://example.com",
      source: "source",
      publishedAt: "2026-01-01T00:00:00.000Z",
      summary: "summary",
      virusTags: ["General"],
      ...overrides,
    };
  }

  it("keeps the earliest-published copy of near-duplicate titles", () => {
    const later = item({
      id: "later",
      title: "Cholera – Haiti",
      source: "Google News",
      publishedAt: "2026-01-05T00:00:00.000Z",
    });
    const earlier = item({
      id: "earlier",
      title: "Cholera - Haiti",
      source: "WHO Disease Outbreak News",
      publishedAt: "2026-01-01T00:00:00.000Z",
    });

    const result = dedupeNews([later, earlier]);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("earlier");
  });

  it("preserves distinct stories and first-seen ordering", () => {
    const a = item({ id: "a", title: "Cholera outbreak in Haiti", publishedAt: "2026-01-01T00:00:00.000Z" });
    const b = item({ id: "b", title: "Marburg outbreak in Rwanda", publishedAt: "2026-01-02T00:00:00.000Z" });
    const aDup = item({ id: "a-dup", title: "Cholera outbreak in Haiti!", publishedAt: "2025-12-31T00:00:00.000Z" });

    const result = dedupeNews([a, b, aDup]);

    expect(result.map((r) => r.id)).toEqual(["a-dup", "b"]);
  });

  it("returns an empty array unchanged", () => {
    expect(dedupeNews([])).toEqual([]);
  });
});
