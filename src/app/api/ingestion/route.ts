import { NextResponse } from "next/server";

import { env } from "@/lib/config";
import { getDashboardSnapshot, getSourceHealth } from "@/server/dashboard-service";

export async function GET(request: Request) {
  if (env.INGESTION_ADMIN_KEY) {
    const providedKey = request.headers.get("x-admin-key");
    if (providedKey !== env.INGESTION_ADMIN_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const refreshed = await getDashboardSnapshot(true);
  return NextResponse.json(
    {
      generatedAt: refreshed.generatedAt,
      sourceHealth: getSourceHealth(),
      trackedViruses: refreshed.viruses.length,
      hotspotCount: refreshed.hotspots.length,
    },
    { status: 200 },
  );
}
