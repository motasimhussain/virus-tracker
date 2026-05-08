import type { NewsItem } from "@/lib/types";

type NewsFeedProps = {
  items: NewsItem[];
};

export function NewsFeed({ items }: NewsFeedProps) {
  return (
    <div className="rounded-xl border border-cyan-500/25 bg-slate-900/70 p-4">
      <h3 className="text-sm uppercase tracking-[0.2em] text-cyan-300">Realtime News Feed</h3>
      <div className="mt-4 space-y-4">
        {items.map((item) => (
          <article key={item.id} className="border-l-2 border-cyan-400/40 pl-3">
            <a href={item.link} target="_blank" rel="noreferrer" className="text-sm font-semibold text-cyan-50 hover:text-fuchsia-300">
              {item.title}
            </a>
            <p className="mt-1 text-xs text-cyan-100/75">{item.summary}</p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-cyan-100/60">
              {item.source} - {new Date(item.publishedAt).toLocaleString()}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
