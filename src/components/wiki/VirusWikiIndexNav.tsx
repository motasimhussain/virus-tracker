"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type VirusWikiIndexItem = {
  slug: string;
  name: string;
  summary: string;
};

type VirusWikiIndexNavProps = {
  viruses: VirusWikiIndexItem[];
};

export function VirusWikiIndexNav({ viruses }: VirusWikiIndexNavProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return viruses;
    return viruses.filter(
      (v) => v.name.toLowerCase().includes(q) || v.slug.toLowerCase().includes(q) || v.summary.toLowerCase().includes(q),
    );
  }, [viruses, query]);

  return (
    <div className="space-y-4">
      <label className="block text-sm text-cyan-200/90">
        <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-cyan-400">Find a virus</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or topic…"
          className="w-full max-w-md rounded-lg border border-cyan-500/35 bg-slate-950/80 px-4 py-2.5 text-cyan-50 placeholder:text-cyan-100/40 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      <p className="text-xs text-cyan-100/55">
        Showing {filtered.length} of {viruses.length} tracked pathogens
      </p>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((virus) => (
          <li key={virus.slug}>
            <Link
              href={`/viruses/${virus.slug}`}
              className="block rounded-xl border border-cyan-500/25 bg-slate-900/70 p-4 transition-colors hover:border-cyan-400/45 hover:bg-slate-900/90"
            >
              <span className="font-semibold text-cyan-100">{virus.name}</span>
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-cyan-100/70">{virus.summary}</p>
              <span className="mt-3 inline-block text-xs font-medium text-fuchsia-300/90">Open wiki →</span>
            </Link>
          </li>
        ))}
      </ul>
      {filtered.length === 0 ? (
        <p className="text-sm text-cyan-100/70">No viruses match “{query}”. Try another term or browse the full list.</p>
      ) : null}
    </div>
  );
}
