type MetricCardProps = {
  label: string;
  value: string;
  hint?: string;
};

export function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-4 shadow-[0_0_20px_rgba(34,211,238,0.12)]">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">{label}</p>
      <p className="mt-2 text-2xl font-bold text-cyan-50">{value}</p>
      {hint ? <p className="mt-1 text-xs text-cyan-100/70">{hint}</p> : null}
    </div>
  );
}
