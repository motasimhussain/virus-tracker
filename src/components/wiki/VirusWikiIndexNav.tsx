"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge, Card, EmptyState } from "@/components/ui";
import { COVERAGE_COPY } from "@/lib/copy";
import { cn } from "@/lib/cn";
import type { VirusCategory } from "@/lib/viruses";

export type VirusWikiIndexItem = {
  slug: string;
  name: string;
  shortName: string;
  category: VirusCategory;
  hasLiveData: boolean;
  /** One-line plain-English excerpt (first sentence of the wiki lead). */
  lead: string;
};

type VirusWikiIndexNavProps = {
  viruses: VirusWikiIndexItem[];
};

const CATEGORY_LABELS: Record<VirusCategory, string> = {
  respiratory: "Respiratory",
  "vector-borne": "Vector-borne",
  zoonotic: "Zoonotic",
  waterborne: "Waterborne",
  hemorrhagic: "Hemorrhagic",
  other: "Other",
};

const chipBase =
  "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";
const chipActive = "border-border-accent bg-accent-soft text-accent";
const chipInactive = "border-border-default text-text-secondary hover:border-border-accent hover:text-accent";

export function VirusWikiIndexNav({ viruses }: VirusWikiIndexNavProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<VirusCategory | "all">("all");

  const categories = useMemo(() => {
    const set = new Set<VirusCategory>();
    viruses.forEach((v) => set.add(v.category));
    return Array.from(set).sort((a, b) => CATEGORY_LABELS[a].localeCompare(CATEGORY_LABELS[b]));
  }, [viruses]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return viruses.filter((v) => {
      if (category !== "all" && v.category !== category) return false;
      if (!q) return true;
      return (
        v.name.toLowerCase().includes(q) ||
        v.shortName.toLowerCase().includes(q) ||
        v.slug.toLowerCase().includes(q) ||
        v.lead.toLowerCase().includes(q)
      );
    });
  }, [viruses, query, category]);

  return (
    <div className="space-y-4">
      <label className="block text-sm text-text-secondary">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-accent">Find a virus</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or topic…"
          className="w-full max-w-md rounded-lg border border-border-default bg-surface-inset px-4 py-2.5 text-text-primary placeholder:text-text-faint focus:border-border-accent focus:outline-none focus:ring-1 focus:ring-accent/50"
          autoComplete="off"
          spellCheck={false}
        />
      </label>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <button type="button" onClick={() => setCategory("all")} className={cn(chipBase, category === "all" ? chipActive : chipInactive)}>
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cn(chipBase, category === cat ? chipActive : chipInactive)}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <p className="text-xs text-text-muted">
        Showing {filtered.length} of {viruses.length} tracked pathogens
      </p>

      {filtered.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((virus) => {
            const coverage = COVERAGE_COPY[virus.hasLiveData ? "live" : "curated"];
            return (
              <li key={virus.slug}>
                <Link href={`/viruses/${virus.slug}`} className="block h-full">
                  <Card glow className="flex h-full flex-col gap-3 transition-colors hover:border-border-accent">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-text-primary">{virus.name}</p>
                        {virus.shortName !== virus.name ? (
                          <p className="text-xs text-text-faint">{virus.shortName}</p>
                        ) : null}
                      </div>
                      <Badge variant={virus.hasLiveData ? "accent" : "neutral"}>{coverage.label}</Badge>
                    </div>
                    <p className="line-clamp-3 text-xs leading-relaxed text-text-secondary">{virus.lead}</p>
                    <div className="mt-auto flex items-center justify-between pt-1">
                      <Badge variant="outline">{CATEGORY_LABELS[virus.category]}</Badge>
                      <span className="text-xs font-medium text-highlight">Open wiki →</span>
                    </div>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState title="No matches" message={`No viruses match "${query}". Try another term or clear filters.`} />
      )}
    </div>
  );
}
