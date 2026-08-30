# Virus Tracker

Virus Tracker is an SSR-first Next.js application for monitoring global virus spread through heat zones, trend analysis, trajectory forecasts, and realtime news ingestion from open feeds.

## Core Features

- Global outbreak dashboard with top hotspots and trend cards.
- Heat map view with geospatial coordinates per region.
- Virus-specific detail pages with trajectory projection.
- Public news aggregation through RSS ingestion.
- Provider-agnostic ad slots for future ad network integration.
- Security headers, sitemap, robots, and API endpoints for frontend/data clients.

## Tech Stack

- Next.js App Router (SSR + revalidation)
- TypeScript + Tailwind CSS
- Runtime validation with Zod
- RSS parsing via `rss-parser`
- Vitest for unit tests
- Supabase (Postgres) for shared snapshot cache and ingestion history

## Local Development

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

## Data and APIs

- `GET /api/overview` - full dashboard snapshot
- `GET /api/map` - map-ready hotspot coordinates
- `GET /api/news` - normalized news feed
- `GET /api/ingestion` - force refresh + source health
  - Optional protection via `INGESTION_ADMIN_KEY` and `x-admin-key` request header.

Sources currently include:
- `disease.sh` country-level COVID dataset
- Google News RSS outbreak search feed
- Internal resilient fallback datasets for other viruses

## Ads

Google AdSense is integrated in `src/components/ads/AdSlot.tsx` and `src/app/layout.tsx` (async script + verification meta).

1. In [AdSense](https://www.google.com/adsense/), create **Display** ad units for each placement.
2. Set environment variables (e.g. on Netlify):

- `NEXT_PUBLIC_ADSENSE_CLIENT` — publisher ID (`ca-pub-…`, default matches site meta)
- `NEXT_PUBLIC_ADSENSE_SLOT_TOP_BANNER` — slot ID for the top banner unit
- `NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR` — slot ID for the sidebar unit
- `NEXT_PUBLIC_ADSENSE_SLOT_IN_FEED` — slot ID for the in-feed unit

Until slot IDs are set, placeholders explain which variable to configure. Ensure your privacy/consent setup meets AdSense policy in your regions.

## Verification

```bash
npm run lint
npm run test
npm run build
```

## Deployment

### Netlify (request refresh + SWR cache)

This project includes `netlify.toml` and is configured for request-driven stale-while-revalidate behavior.

Required environment variables on Netlify:

- `APP_URL` (e.g. `https://virus-tracker.com`)
- `INGESTION_TTL_SECONDS` (recommended: `1800`)
- `REVALIDATE_SECONDS` (recommended: `1800`)
- `INGESTION_ADMIN_KEY` (optional but recommended)
- `SUPABASE_URL` (recommended for shared cache + ingestion history across function instances)
- `SUPABASE_SERVICE_ROLE_KEY` (recommended for shared cache + ingestion history across function instances)

SWR behavior:
- API routes serve cached snapshots with `Cache-Control: public, s-maxage=1800, stale-while-revalidate=1800`.
- If snapshot is stale, stale data is served and refresh runs in background.
- If no snapshot exists, request computes and stores a fresh snapshot.

### Other platforms

- Vercel is still supported.
- Use managed Redis/Postgres in production for stronger durability and performance.
