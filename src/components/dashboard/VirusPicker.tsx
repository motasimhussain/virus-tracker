"use client";

type VirusPickerProps = {
  options: Array<{ slug: string; name: string }>;
  selectedVirusSlug: string | null;
  onChange: (virusSlug: string | null) => void;
};

export function VirusPicker({ options, selectedVirusSlug, onChange }: VirusPickerProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-[0.18em] text-cyan-300">Virus</span>
      <select
        className="rounded-lg border border-cyan-500/30 bg-slate-950 px-3 py-2 text-sm text-cyan-100 focus:border-cyan-300 focus:outline-none"
        value={selectedVirusSlug ?? ""}
        onChange={(event) => onChange(event.target.value || null)}
      >
        <option value="">All Viruses</option>
        {options.map((option) => (
          <option key={option.slug} value={option.slug}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}
