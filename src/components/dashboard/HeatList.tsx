import type { RegionMetric } from "@/lib/types";

type HeatListProps = {
  items: RegionMetric[];
};

function heatColor(activeCases: number) {
  if (activeCases > 100000) return "bg-red-500/70";
  if (activeCases > 50000) return "bg-orange-500/70";
  if (activeCases > 10000) return "bg-yellow-500/70";
  return "bg-cyan-500/70";
}

export function HeatList({ items }: HeatListProps) {
  return (
    <div className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-4">
      <h3 className="text-sm uppercase tracking-[0.2em] text-cyan-300">Global Heat Zones</h3>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={`${item.slug}-${item.countryCode}-${item.region}`} className="grid grid-cols-[1fr_auto] gap-3">
            <div>
              <p className="text-sm font-semibold text-cyan-50">
                {item.locationLevel === "admin1" && item.admin1Name
                  ? `${item.admin1Name}, ${item.countryName}`
                  : item.region}
              </p>
              <p className="text-xs text-cyan-100/70">
                {item.virus} - {item.countryCode} - {item.locationLevel}
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${heatColor(item.activeCases)}`}>
                {item.activeCases.toLocaleString()} active
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
