/**
 * Netlify Scheduled Function — periodic ingestion trigger.
 *
 * Runs on Netlify's infrastructure independently of the Next.js app's own
 * request-driven stale-while-revalidate refresh (see
 * src/server/dashboard-service.ts). Rather than importing
 * "@/server/data/ingestion" directly — which would require Netlify's
 * Functions bundler (zip-it-and-ship-it, invoked outside `next build`) to
 * resolve this project's "@/*" path aliases and independently trace every
 * dependency of the ingestion pipeline (rss-parser, papaparse, the Supabase
 * REST client, etc.) — this function POSTs to the app's own
 * `/api/ingestion` route. That route already does exactly this work
 * (`getDashboardSnapshot(true)` -> `runIngestion()`) and is built and
 * deployed by @netlify/plugin-nextjs as part of the normal Next.js build, so
 * it's the more reliable integration point for a Next-on-Netlify deployment.
 *
 * Schedule: every 30 minutes, matching the INGESTION_TTL_SECONDS /
 * REVALIDATE_SECONDS defaults (1800s) in src/lib/config.ts.
 */

const DEFAULT_APP_URL = "https://virus-tracker.com";

export default async () => {
  // APP_URL is this project's own canonical-domain config var (see
  // src/lib/config.ts); Netlify also injects `URL` (the site's primary
  // deploy URL) automatically, which is used as a fallback so this works
  // even before APP_URL is set for a given environment.
  const appUrl = process.env.APP_URL || process.env.URL || DEFAULT_APP_URL;
  const adminKey = process.env.INGESTION_ADMIN_KEY;
  const target = new URL("/api/ingestion", appUrl).toString();

  try {
    const response = await fetch(target, {
      method: "GET",
      headers: adminKey ? { "x-admin-key": adminKey } : undefined,
    });

    const bodyText = await response.text();

    if (!response.ok) {
      console.error(
        `[scheduled-ingestion] /api/ingestion returned ${response.status}: ${bodyText.slice(0, 500)}`,
      );
      return new Response(JSON.stringify({ ok: false, status: response.status, body: bodyText }), {
        status: 502,
        headers: { "content-type": "application/json" },
      });
    }

    console.log(`[scheduled-ingestion] refreshed successfully via ${target}`);
    return new Response(JSON.stringify({ ok: true, status: response.status, body: bodyText }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("[scheduled-ingestion] failed to reach /api/ingestion:", error);
    return new Response(
      JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
};

export const config = {
  schedule: "*/30 * * * *",
};
