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
- Optional local Postgres + Redis via Docker Compose

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

Ad slots are implemented as provider-agnostic UI containers in `src/components/ads/AdSlot.tsx`.
Attach approved provider SDK snippets (AdSense, Media.net, APS, etc.) after policy and consent compliance checks.

## Verification

```bash
npm run lint
npm run test
npm run build
```

## Deployment

- Recommended: Vercel for frontend + cron triggers.
- Use managed Postgres/Redis in production.
- Set `APP_URL` to `https://virus-tracker.com` in environment variables.
