import { beforeEach, describe, expect, it, vi } from "vitest";

import promedFixture from "./__fixtures__/promed-sample.json";

const parseURLMock = vi.hoisted(() => vi.fn());

vi.mock("rss-parser", () => ({
  default: vi.fn().mockImplementation(function MockParser(this: { parseURL: typeof parseURLMock }) {
    this.parseURL = parseURLMock;
  }),
}));

import { promedRssAdapter } from "./promed-rss";

describe("promedRssAdapter", () => {
  beforeEach(() => {
    parseURLMock.mockReset();
  });

  it("has the expected adapter identity", () => {
    expect(promedRssAdapter.id).toBe("promed-rss");
    expect(promedRssAdapter.sourceName).toBe("ProMED-mail");
    expect(promedRssAdapter.kind).toBe("news");
  });

  it("fetches the ProMED feed and maps + tags items", async () => {
    parseURLMock.mockResolvedValue(promedFixture);

    const news = await promedRssAdapter.fetchNews();

    expect(parseURLMock).toHaveBeenCalledWith("https://promedmail.org/feed/");
    expect(news).toHaveLength(3);

    expect(news[0].source).toBe("ProMED-mail");
    expect(news[0].virusTags).toEqual(["Cholera"]);

    expect(news[1].virusTags).toEqual(["Marburg"]);

    expect(news[2].virusTags).toEqual(["General"]);
  });

  it("caps output at 25 items", async () => {
    const items = Array.from({ length: 40 }, (_, i) => ({
      guid: `promed-${i}`,
      title: `Untitled outbreak report ${i}`,
      link: `https://promedmail.org/promed-post/?id=${i}`,
      pubDate: "Thu, 01 Jan 2026 12:00:00 GMT",
      contentSnippet: "Report body.",
    }));
    parseURLMock.mockResolvedValue({ items });

    const news = await promedRssAdapter.fetchNews();

    expect(news).toHaveLength(25);
  });

  it("falls back to a safe link and default fields when data is missing", async () => {
    parseURLMock.mockResolvedValue({
      items: [{}],
    });

    const news = await promedRssAdapter.fetchNews();

    expect(news[0].link).toBe("https://promedmail.org");
    expect(news[0].title).toBe("ProMED-mail update");
    expect(news[0].virusTags).toEqual(["General"]);
  });
});
