import { NextResponse } from "next/server";

import { env } from "@/lib/config";
import { getDashboardSnapshot, getFilteredDashboardView } from "@/server/dashboard-service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const virus = url.searchParams.get("virus");
  const threat = url.searchParams.get("threat");

  const snapshot = await getDashboardSnapshot();
  const filteredView = getFilteredDashboardView(snapshot, virus, threat);
  const maxActive = Math.max(...filteredView.filteredHotspots.map((item) => item.activeCases), 0);

  return NextResponse.json(
    {
      points: filteredView.filteredHotspots.map((item) => ({
        virus: item.virus,
        region: item.region,
        locationId: item.locationId,
        locationLevel: item.locationLevel,
        countryName: item.countryName,
        admin1Name: item.admin1Name,
        countryCode: item.countryCode,
        latitude: item.latitude,
        longitude: item.longitude,
        activeCases: item.activeCases,
        updatedAt: item.updatedAt,
      })),
      countryIntensity: filteredView.filteredHotspots.reduce<Record<string, number>>((acc, item) => {
        acc[item.countryCode] = Math.max(acc[item.countryCode] ?? 0, item.activeCases);
        return acc;
      }, {}),
      subnationalPoints: filteredView.filteredHotspots.filter((item) => item.locationLevel !== "country"),
      availableRegions: filteredView.regionOptions,
      selectedVirus: filteredView.selectedVirusSlug,
      selectedThreat: filteredView.selectedThreatKey,
      maxActiveCases: maxActive,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": `public, s-maxage=${env.REVALIDATE_SECONDS}, stale-while-revalidate=${env.REVALIDATE_SECONDS}`,
      },
    },
  );
}
