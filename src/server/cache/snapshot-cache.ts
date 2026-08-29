import type { DashboardSnapshot } from "@/lib/types";
import { getLatestSnapshot, upsertSnapshot } from "@/server/db/supabase";

export type SourceHealthRecord = { source: string; healthy: boolean; message: string };

export type CacheEnvelope = {
  snapshot: DashboardSnapshot;
  sourceHealth: SourceHealthRecord[];
  generatedAtMs: number;
};

const CACHE_KEY = "virus-tracker:snapshot:v1";

// L2 shared cache, backed by Supabase (see src/server/db/supabase.ts). Every
// call there already no-ops/returns null when Supabase env vars are absent
// and never throws, so these wrappers stay simple pass-throughs; the
// try/catch here is defense-in-depth against unexpected rejections.

export async function getSnapshotFromSharedCache(): Promise<CacheEnvelope | null> {
  try {
    return await getLatestSnapshot(CACHE_KEY);
  } catch {
    return null;
  }
}

export async function setSnapshotToSharedCache(payload: CacheEnvelope): Promise<void> {
  try {
    await upsertSnapshot(CACHE_KEY, payload);
  } catch {
    // Best-effort write. In-memory cache continues to function if shared cache fails.
  }
}
