"use client";

import type { TopThreat } from "@/lib/types";

type TopThreatPickerProps = {
  options: TopThreat[];
  selectedThreatKey: string | null;
  onChange: (threatKey: string | null) => void;
};

export function TopThreatPicker({ options, selectedThreatKey, onChange }: TopThreatPickerProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-[0.18em] text-cyan-300">Top Threat</span>
      <select
        className="rounded-lg border border-cyan-500/30 bg-slate-950 px-3 py-2 text-sm text-cyan-100 focus:border-cyan-300 focus:outline-none"
        value={selectedThreatKey ?? ""}
        onChange={(event) => onChange(event.target.value || null)}
      >
        <option value="">All Threat Zones</option>
        {options.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label} - {option.activeCases.toLocaleString()}
          </option>
        ))}
      </select>
    </label>
  );
}
