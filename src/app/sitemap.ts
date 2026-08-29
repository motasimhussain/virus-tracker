import type { MetadataRoute } from "next";

import { env } from "@/lib/config";
import { slugify } from "@/lib/seo";
import { getDashboardSnapshot } from "@/server/dashboard-service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const snapshot = await getDashboardSnapshot();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = ["", "/map", "/news", "/viruses", "/about-data"].map((path) => ({
    url: `${env.APP_URL}${path}`,
    lastModified: now,
    changeFrequency: "hourly",
    priority: path === "" ? 1 : path === "/viruses" ? 0.92 : path === "/about-data" ? 0.6 : 0.85,
  }));

  const virusRoutes: MetadataRoute.Sitemap = snapshot.viruses.map((virus) => ({
    url: `${env.APP_URL}/viruses/${virus.slug}`,
    lastModified: now,
    changeFrequency: "hourly",
    priority: 0.9,
  }));

  const threatRoutes: MetadataRoute.Sitemap = Array.from(
    new Set(
      snapshot.hotspots.slice(0, 200).map(
        (threat) => `${env.APP_URL}/threats/${threat.slug}/${slugify(`${threat.region}-${threat.countryCode}`)}`,
      ),
    ),
  ).map((url) => ({
    url,
    lastModified: now,
    changeFrequency: "hourly" as const,
    priority: 0.8,
  }));

  const regionRoutes: MetadataRoute.Sitemap = Array.from(
    new Set(snapshot.hotspots.map((item) => item.countryCode.toLowerCase())),
  ).map((countryCode) => ({
    url: `${env.APP_URL}/regions/${countryCode}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.78,
  }));

  const regionVirusRoutes: MetadataRoute.Sitemap = Array.from(
    new Set(
      snapshot.hotspots.map(
        (item) => `${env.APP_URL}/regions/${item.countryCode.toLowerCase()}/${item.slug}`,
      ),
    ),
  ).map((url) => ({
    url,
    lastModified: now,
    changeFrequency: "hourly" as const,
    priority: 0.74,
  }));

  const newsTopics: MetadataRoute.Sitemap = Array.from(
    new Set(snapshot.news.flatMap((item) => item.virusTags)),
  ).map((tag) => ({
    url: `${env.APP_URL}/news/topic/${slugify(tag)}`,
    lastModified: now,
    changeFrequency: "hourly" as const,
    priority: 0.75,
  }));

  const newsSources: MetadataRoute.Sitemap = Array.from(new Set(snapshot.news.map((item) => item.source))).map(
    (source) => ({
      url: `${env.APP_URL}/news/source/${slugify(source)}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.72,
    }),
  );

  return [
    ...staticRoutes,
    ...virusRoutes,
    ...threatRoutes,
    ...regionRoutes,
    ...regionVirusRoutes,
    ...newsTopics,
    ...newsSources,
  ];
}
