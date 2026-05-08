import Link from "next/link";

import type { TopThreat } from "@/lib/types";

type TopThreatCardsProps = {
  threats: TopThreat[];
  maxCards?: number;
};

export function TopThreatCards({ threats, maxCards = 6 }: TopThreatCardsProps) {
  const cards = threats.slice(0, maxCards);

  return (
    <section className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm uppercase tracking-[0.2em] text-cyan-300">Top Threats</h3>
        <span className="text-xs text-cyan-100/60">Showing {cards.length} threats</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((threat) => (
          <Link
            key={threat.key}
            href={`/map?virus=${encodeURIComponent(threat.virusSlug)}&threat=${encodeURIComponent(threat.key)}`}
            className="group rounded-lg border border-cyan-500/20 bg-slate-950/70 p-3 transition hover:border-cyan-300/60"
          >
            <p className="text-sm font-semibold text-cyan-50 group-hover:text-fuchsia-300">{threat.label}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-cyan-100/65">{threat.virusSlug}</p>
            <p className="mt-1 text-lg font-bold text-cyan-100">{threat.activeCases.toLocaleString()}</p>
            <p className="text-xs text-cyan-100/65">active cases</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
