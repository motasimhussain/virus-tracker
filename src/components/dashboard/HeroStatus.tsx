import { DataFreshnessBadge } from "@/components/dashboard/DataFreshnessBadge";
import { AnimatedNumber, PulseDot } from "@/components/motion";
import { Button } from "@/components/ui";

export type HeroStatusProps = {
  /** Total number of distinct viruses this dashboard tracks. */
  virusCount: number;
  /** Total number of distinct countries represented in the current snapshot. */
  countryCount: number;
  /** Total active cases across the current snapshot. */
  activeTotal: number;
  /** ISO timestamp the snapshot was generated at. */
  generatedAt: string;
};

/**
 * Dashboard hero: plain-English framing of what this site does, a headline
 * stat row, a live/freshness indicator, and the two primary calls to action.
 * Server component — everything interactive (AnimatedNumber, PulseDot) is a
 * client component imported and rendered here.
 */
export function HeroStatus({ virusCount, countryCount, activeTotal, generatedAt }: HeroStatusProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border-default bg-surface-raised p-6 sm:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--color-accent-soft),_transparent_65%)]"
      />
      <div className="relative flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <PulseDot color="accent" label="Live data" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Live</span>
          </div>
          <DataFreshnessBadge generatedAt={generatedAt} />
        </div>

        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            Global outbreak monitoring
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-text-primary sm:text-5xl">
            Virus Tracker
          </h1>
          <p className="mt-3 text-base text-text-secondary">
            We track {virusCount} viruses across {countryCount} countries, in plain English.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <p className="text-3xl font-bold text-text-primary sm:text-4xl">
              <AnimatedNumber value={virusCount} className="tabular-nums" />
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-text-muted">Viruses tracked</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-text-primary sm:text-4xl">
              <AnimatedNumber value={countryCount} className="tabular-nums" />
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-text-muted">Countries covered</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-text-primary sm:text-4xl">
              <AnimatedNumber value={activeTotal} format="compact" className="tabular-nums" />
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-text-muted">People currently sick</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button href="/map">Open the world map</Button>
          <Button href="/viruses" variant="outline">
            Browse the virus guide
          </Button>
        </div>
      </div>
    </section>
  );
}
