"use client";

import { ChevronDown } from "lucide-react";

import type { TopThreat } from "@/lib/types";
import { formatCompactNumber } from "@/lib/copy";

export type TopThreatPickerProps = {
  options: TopThreat[];
  selectedThreatKey: string | null;
  onChange: (threatKey: string | null) => void;
};

/** Plain-English hotspot filter, styled as a themed native `<select>` for reliable keyboard/a11y behavior. */
export function TopThreatPicker({ options, selectedThreatKey, onChange }: TopThreatPickerProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Choose a hotspot</span>
      <div className="relative">
        <select
          style={{ colorScheme: "dark" }}
          className="w-full appearance-none rounded-lg border border-border-default bg-surface-inset px-3 py-2 pr-9 text-sm text-text-primary transition-colors hover:border-border-strong focus:border-border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          value={selectedThreatKey ?? ""}
          onChange={(event) => onChange(event.target.value || null)}
        >
          <option value="">All hotspots</option>
          {options.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label} &mdash; {formatCompactNumber(option.activeCases)} active
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-faint"
          aria-hidden="true"
        />
      </div>
    </label>
  );
}
