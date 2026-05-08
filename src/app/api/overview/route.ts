import { NextResponse } from "next/server";

import { env } from "@/lib/config";
import { getDashboardSnapshot } from "@/server/dashboard-service";

export async function GET() {
  const snapshot = await getDashboardSnapshot();
  return NextResponse.json(snapshot, {
    status: 200,
    headers: {
      "Cache-Control": `public, s-maxage=${env.REVALIDATE_SECONDS}, stale-while-revalidate=${env.REVALIDATE_SECONDS}`,
    },
  });
}
