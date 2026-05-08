type AdSlotProps = {
  slotName: string;
  className?: string;
  provider?: string;
};

export function AdSlot({ slotName, className, provider = "manual" }: AdSlotProps) {
  return (
    <aside
      aria-label={`Advertisement slot: ${slotName}`}
      className={`rounded-xl border border-cyan-500/20 bg-slate-900/60 p-4 text-xs text-cyan-200 ${className ?? ""}`}
    >
      <p className="mb-1 uppercase tracking-[0.2em] text-cyan-400">Sponsored</p>
      <p className="font-semibold">{slotName}</p>
      <p className="mt-2 text-cyan-100/80">
        Provider: <span className="font-mono">{provider}</span>
      </p>
      <p className="mt-1 text-cyan-100/60">
        Replace this placeholder with your approved ad provider SDK snippet.
      </p>
    </aside>
  );
}
