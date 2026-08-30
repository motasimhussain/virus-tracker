import { beforeEach, describe, expect, it, vi } from "vitest";

import cdcFixture from "./__fixtures__/cdc-outbreaks-sample.json";

const parseURLMock = vi.hoisted(() => vi.fn());

vi.mock("rss-parser", () => ({
  default: vi.fn().mockImplementation(function MockParser(this: { parseURL: typeof parseURLMock }) {
    this.parseURL = parseURLMock;
  }),
}));

import { cdcOutbreaksRssAdapter } from "./cdc-outbreaks-rss";

describe("cdcOutbreaksRssAdapter", () => {
  beforeEach(() => {
    parseURLMock.mockReset();
  });

  it("has the expected adapter identity", () => {
    expect(cdcOutbreaksRssAdapter.id).toBe("cdc-outbreaks-rss");
    expect(cdcOutbreaksRssAdapter.sourceName).toBe("CDC Outbreaks");
    expect(cdcOutbreaksRssAdapter.kind).toBe("news");
  });

  it("fetches the CDC outbreaks feed and maps + tags items", async () => {
    parseURLMock.mockResolvedValue(cdcFixture);

    const news = await cdcOutbreaksRssAdapter.fetchNews();

    expect(parseURLMock).toHaveBeenCalledWith("https://tools.cdc.gov/api/v2/resources/media/285676.rss");
    expect(news).toHaveLength(3);

    expect(news[0].source).toBe("CDC Outbreaks");
    expect(news[0].virusTags).toContain("Avian Influenza (H5N1)");

    expect(news[1].virusTags).toEqual(["Mpox"]);

    expect(news[2].virusTags).toEqual(["General"]);
  });

  it("caps output at 25 items", async () => {
    const items = Array.from({ length: 40 }, (_, i) => ({
      guid: `cdc-${i}`,
      title: `Untitled advisory ${i}`,
      link: `https://www.cdc.gov/outbreaks/${i}`,
      pubDate: "Thu, 01 Jan 2026 12:00:00 GMT",
      contentSnippet: "Advisory body.",
    }));
    parseURLMock.mockResolvedValue({ items });

    const news = await cdcOutbreaksRssAdapter.fetchNews();

    expect(news).toHaveLength(25);
  });

  it("falls back to a safe link and default fields when data is missing", async () => {
    parseURLMock.mockResolvedValue({
      items: [{}],
    });

    const news = await cdcOutbreaksRssAdapter.fetchNews();

    expect(news[0].link).toBe("https://www.cdc.gov/outbreaks/");
    expect(news[0].title).toBe("CDC outbreak update");
    expect(news[0].virusTags).toEqual(["General"]);
  });
});
