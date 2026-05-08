import { env } from "@/lib/config";
import type { DashboardSnapshot } from "@/lib/types";

export type SourceHealthRecord = { source: string; healthy: boolean; message: string };

export type CacheEnvelope = {
  snapshot: DashboardSnapshot;
  sourceHealth: SourceHealthRecord[];
  generatedAtMs: number;
};

const CACHE_KEY = "virus-tracker:snapshot:v1";

async function upstashGet(key: string): Promise<string | null> {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) return null;
  const response = await fetch(`${env.UPSTASH_REDIS_REST_URL}/get/${encodeURIComponent(key)}`, {
    headers: {
      Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
    },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as { result?: string | null };
  return payload.result ?? null;
}

async function upstashSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) return;
  await fetch(
    `${env.UPSTASH_REDIS_REST_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}?EX=${ttlSeconds}`,
    {
      headers: {
        Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
      },
      cache: "no-store",
    },
  );
}

export async function getSnapshotFromSharedCache(): Promise<CacheEnvelope | null> {
  try {
    const raw = await upstashGet(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEnvelope;
    if (!parsed?.snapshot || !parsed?.generatedAtMs) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function setSnapshotToSharedCache(payload: CacheEnvelope): Promise<void> {
  try {
    await upstashSet(CACHE_KEY, JSON.stringify(payload), env.INGESTION_TTL_SECONDS + env.REVALIDATE_SECONDS);
  } catch {
    // Best-effort write. In-memory cache continues to function if shared cache fails.
  }
}
