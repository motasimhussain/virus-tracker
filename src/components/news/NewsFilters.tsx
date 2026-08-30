"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";
import { slugify } from "@/lib/seo";
import { VIRUSES } from "@/lib/viruses";

/**
 * Horizontally scrollable chip row of virus names + "All" that navigates
 * between /news and /news/topic/{slug}. Server-driven filtering — this
 * component only renders links and highlights the active chip from the
 * current pathname, it never fetches data itself.
 */
export function NewsFilters() {
  const pathname = usePathname() ?? "/news";
  const activeTopicSlug = pathname.startsWith("/news/topic/") ? pathname.split("/news/topic/")[1] : null;
  const isAllActive = pathname === "/news";

  return (
    <nav
      aria-label="Filter news by virus"
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5"
    >
      <FilterChip href="/news" active={isAllActive}>
        All
      </FilterChip>
      {VIRUSES.map((virus) => {
        const slug = slugify(virus.name);
        return (
          <FilterChip key={virus.slug} href={`/news/topic/${slug}`} active={activeTopicSlug === slug}>
            {virus.name}
          </FilterChip>
        );
      })}
    </nav>
  );
}

function FilterChip({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-150",
        active
          ? "border-border-accent bg-accent-soft text-accent"
          : "border-border-default bg-surface-inset text-text-secondary hover:border-border-strong hover:text-text-primary",
      )}
    >
      {children}
    </Link>
  );
}
