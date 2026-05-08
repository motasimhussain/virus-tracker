"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { TopThreat } from "@/lib/types";
import { TopThreatPicker } from "@/components/dashboard/TopThreatPicker";
import { VirusPicker } from "@/components/dashboard/VirusPicker";

type ThreatFiltersProps = {
  virusOptions: Array<{ slug: string; name: string }>;
  topThreats: TopThreat[];
  selectedVirusSlug: string | null;
  selectedThreatKey: string | null;
};

export function ThreatFilters({
  virusOptions,
  topThreats,
  selectedVirusSlug,
  selectedThreatKey,
}: ThreatFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParams(next: { virus?: string | null; threat?: string | null }) {
    const params = new URLSearchParams(searchParams.toString());

    if (next.virus !== undefined) {
      if (next.virus) {
        params.set("virus", next.virus);
      } else {
        params.delete("virus");
      }
      params.delete("threat");
    }

    if (next.threat !== undefined) {
      if (next.threat) {
        params.set("threat", next.threat);
      } else {
        params.delete("threat");
      }
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <section className="grid gap-4 rounded-xl border border-cyan-500/25 bg-slate-900/70 p-4 md:grid-cols-2">
      <VirusPicker options={virusOptions} selectedVirusSlug={selectedVirusSlug} onChange={(value) => updateParams({ virus: value })} />
      <TopThreatPicker options={topThreats} selectedThreatKey={selectedThreatKey} onChange={(value) => updateParams({ threat: value })} />
    </section>
  );
}
