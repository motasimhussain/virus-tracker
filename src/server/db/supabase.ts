import { env } from "@/lib/config";
import type { NewsItem, RegionMetric } from "@/lib/types";
import type { CacheEnvelope, SourceHealthRecord } from "@/server/cache/snapshot-cache";

/**
 * Thin, server-only PostgREST client for the Supabase project.
 *
 * SERVER-ONLY: this module reads SUPABASE_SERVICE_ROLE_KEY, which must never
 * reach the client bundle. Do not import it from client components.
 *
 * Every exported helper degrades gracefully when Supabase env vars are
 * absent: it no-ops (or returns null/[]) immediately, and never throws to
 * its caller — all network/parsing errors are caught and logged with a
 * "[supabase]" prefix.
 */

const REQUEST_TIMEOUT_MS = 10_000;
const INSERT_CHUNK_SIZE = 500;

class SupabaseRequestError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly body: string;

  constructor(status: number, statusText: string, body: string) {
    super(`[supabase] request failed: ${status} ${statusText} — ${body.slice(0, 500)}`);
    this.name = "SupabaseRequestError";
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

function restBaseUrl(): string {
  return `${(env.SUPABASE_URL ?? "").replace(/\/+$/, "")}/rest/v1`;
}

async function sbFetch(
  path: string,
  init: { method?: string; body?: unknown; prefer?: string } = {},
): Promise<Response> {
  if (!isSupabaseConfigured()) {
    throw new Error("[supabase] not configured");
  }

  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY as string;
  const headers: Record<string, string> = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
  };
  if (init.prefer) {
    headers.Prefer = init.prefer;
  }

  const response = await fetch(`${restBaseUrl()}${path}`, {
    method: init.method ?? "GET",
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new SupabaseRequestError(response.status, response.statusText, body);
  }

  return response;
}

function isValidCacheEnvelope(value: unknown): value is CacheEnvelope {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<CacheEnvelope>;
  return Boolean(candidate.snapshot && typeof candidate.generatedAtMs === "number");
}

/** Fetch the most recently stored snapshot envelope for `key`, or null. */
export async function getLatestSnapshot(key: string): Promise<CacheEnvelope | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const response = await sbFetch(
      `/snapshots?key=eq.${encodeURIComponent(key)}&select=payload&limit=1`,
    );
    const rows = (await response.json()) as Array<{ payload: unknown }>;
    const payload = rows[0]?.payload;
    if (!isValidCacheEnvelope(payload)) return null;
    return payload;
  } catch (error) {
    console.warn("[supabase] getLatestSnapshot failed:", error);
    return null;
  }
}

/** Upsert (insert-or-replace) the snapshot envelope stored under `key`. */
export async function upsertSnapshot(key: string, envelope: CacheEnvelope): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    await sbFetch("/snapshots", {
      method: "POST",
      prefer: "resolution=merge-duplicates,return=minimal",
      body: [
        {
          key,
          payload: envelope,
          generated_at: new Date(envelope.generatedAtMs).toISOString(),
        },
      ],
    });
  } catch (error) {
    console.warn("[supabase] upsertSnapshot failed:", error);
  }
}

/** Record the start of an ingestion run; returns its id, or null on failure/unconfigured. */
export async function insertIngestionRun(
  sourceHealth: SourceHealthRecord[],
): Promise<number | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const response = await sbFetch("/ingestion_runs", {
      method: "POST",
      prefer: "return=representation",
      body: [
        {
          finished_at: new Date().toISOString(),
          source_health: sourceHealth,
        },
      ],
    });
    const rows = (await response.json()) as Array<{ id: number }>;
    return rows[0]?.id ?? null;
  } catch (error) {
    console.warn("[supabase] insertIngestionRun failed:", error);
    return null;
  }
}

function toObservationRow(runId: number | null, metric: RegionMetric) {
  const {
    slug,
    countryCode,
    locationId,
    locationLevel,
    activeCases,
    confirmedCases,
    deaths,
    recovered,
    updatedAt,
    ...rest
  } = metric;

  return {
    run_id: runId,
    observed_at: updatedAt || new Date().toISOString(),
    virus_slug: slug,
    country_code: countryCode,
    location_id: locationId,
    location_level: locationLevel,
    active_cases: activeCases ?? null,
    confirmed_cases: confirmedCases ?? null,
    deaths: deaths ?? null,
    recovered: recovered ?? null,
    extra: rest,
  };
}

/** Append a batch of per-region metric observations, chunked at 500 rows/request. */
export async function appendMetricObservations(
  runId: number | null,
  metrics: RegionMetric[],
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  if (metrics.length === 0) return;
  try {
    const rows = metrics.map((metric) => toObservationRow(runId, metric));
    for (let i = 0; i < rows.length; i += INSERT_CHUNK_SIZE) {
      const chunk = rows.slice(i, i + INSERT_CHUNK_SIZE);
      await sbFetch("/metric_observations", {
        method: "POST",
        prefer: "return=minimal",
        body: chunk,
      });
    }
  } catch (error) {
    console.warn("[supabase] appendMetricObservations failed:", error);
  }
}

/** Upsert news items (merge-duplicates on the `link` primary key), chunked at 500 rows/request. */
export async function upsertNewsItems(items: NewsItem[]): Promise<void> {
  if (!isSupabaseConfigured()) return;
  if (items.length === 0) return;
  try {
    const rows = items.map((item) => ({
      link: item.link,
      title: item.title,
      source: item.source,
      published_at: item.publishedAt || null,
      summary: item.summary,
      virus_tags: item.virusTags,
    }));
    for (let i = 0; i < rows.length; i += INSERT_CHUNK_SIZE) {
      const chunk = rows.slice(i, i + INSERT_CHUNK_SIZE);
      await sbFetch("/news_items", {
        method: "POST",
        prefer: "resolution=merge-duplicates,return=minimal",
        body: chunk,
      });
    }
  } catch (error) {
    console.warn("[supabase] upsertNewsItems failed:", error);
  }
}

export type VirusHistoryPoint = {
  observedAt: string;
  countryCode: string;
  activeCases: number | null;
  confirmedCases: number | null;
  deaths: number | null;
};

/** Time-series of observations for a virus, optionally scoped to a country, over the trailing `days`. */
export async function getVirusHistory(
  slug: string,
  countryCode: string | null,
  days: number,
): Promise<VirusHistoryPoint[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const params = new URLSearchParams();
    params.set("virus_slug", `eq.${slug}`);
    params.append("observed_at", `gte.${since}`);
    if (countryCode) {
      params.set("country_code", `eq.${countryCode}`);
    }
    params.set("select", "observed_at,country_code,active_cases,confirmed_cases,deaths");
    params.set("order", "observed_at.asc");

    const response = await sbFetch(`/metric_observations?${params.toString()}`);
    const rows = (await response.json()) as Array<{
      observed_at: string;
      country_code: string;
      active_cases: number | null;
      confirmed_cases: number | null;
      deaths: number | null;
    }>;

    return rows.map((row) => ({
      observedAt: row.observed_at,
      countryCode: row.country_code,
      activeCases: row.active_cases,
      confirmedCases: row.confirmed_cases,
      deaths: row.deaths,
    }));
  } catch (error) {
    console.warn("[supabase] getVirusHistory failed:", error);
    return [];
  }
}
