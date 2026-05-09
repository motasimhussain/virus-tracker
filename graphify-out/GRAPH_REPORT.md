# Graph Report - virus-tracker  (2026-05-10)

## Corpus Check
- 56 files · ~15,783 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 250 nodes · 507 edges · 16 communities (11 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2a42acf4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]

## God Nodes (most connected - your core abstractions)
1. `getDashboardSnapshot()` - 35 edges
2. `env` - 19 edges
3. `getFilteredDashboardView()` - 18 edges
4. `slugify()` - 11 edges
5. `deslugify()` - 9 edges
6. `RegionMetric` - 9 edges
7. `refreshSnapshot()` - 8 edges
8. `Virus Tracker` - 8 edges
9. `VirusDetailsPage()` - 7 edges
10. `NewsFeed()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `NewsPage()` --calls--> `getDashboardSnapshot()`  [EXTRACTED]
  src/app/news/page.tsx → src/server/dashboard-service.ts
- `Home()` --calls--> `getDashboardSnapshot()`  [EXTRACTED]
  src/app/page.tsx → src/server/dashboard-service.ts
- `Home()` --calls--> `getFilteredDashboardView()`  [EXTRACTED]
  src/app/page.tsx → src/server/dashboard-service.ts
- `sitemap()` --calls--> `getDashboardSnapshot()`  [EXTRACTED]
  src/app/sitemap.ts → src/server/dashboard-service.ts
- `GET()` --calls--> `getFilteredDashboardView()`  [EXTRACTED]
  src/app/api/map/route.ts → src/server/dashboard-service.ts

## Communities (16 total, 5 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (43): CacheEnvelope, getSnapshotFromSharedCache(), setSnapshotToSharedCache(), SourceHealthRecord, upstashGet(), upstashSet(), DashboardSnapshot, VirusSnapshot (+35 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (22): geistMono, geistSans, metadata, sitemap(), RegionPage(), RegionPageProps, GET(), env (+14 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (24): fallbackMetrics, fallbackNews, fallbackTrajectory, baseMetric(), fetchEcdcWeeklyCovid(), IngestionState, MetricAdapter, NewsAdapter (+16 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (27): getSingleParam(), Home(), HomePageProps, metadata, SeverityByRegionPanel(), SeverityByRegionPanelProps, SourceReliabilityPanel(), SourceReliabilityPanelProps (+19 more)

### Community 4 - "Community 4"
Cohesion: 0.17
Nodes (16): NewsFeed(), NewsFeedProps, deslugify(), slugify(), NewsItem, metadata, NewsPage(), generateMetadata() (+8 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (13): HeatList(), HeatListProps, getHeatColor(), HEAT_COLORS, getSingleParam(), MapPage(), MapPageProps, metadata (+5 more)

### Community 6 - "Community 6"
Cohesion: 0.16
Nodes (15): AdPlacement, AdSlot(), AdSlotProps, getSlotId(), MetricCard(), MetricCardProps, getVirusWiki(), getVirusWikiFallback() (+7 more)

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (12): Ads, code:bash (npm install), code:bash (npm run lint), Core Features, Data and APIs, Deployment, Local Development, Netlify (request refresh + SWR cache) (+4 more)

## Knowledge Gaps
- **76 isolated node(s):** `eslintConfig`, `nextConfig`, `config`, `geistSans`, `geistMono` (+71 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDashboardSnapshot()` connect `Community 1` to `Community 0`, `Community 3`, `Community 4`, `Community 5`, `Community 6`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **Why does `env` connect `Community 1` to `Community 0`, `Community 3`, `Community 4`, `Community 5`, `Community 6`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `getFilteredDashboardView()` connect `Community 0` to `Community 1`, `Community 3`, `Community 5`, `Community 6`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `config` to the rest of the system?**
  _76 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._