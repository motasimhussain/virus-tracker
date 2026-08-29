import Link from "next/link";
import { SearchX } from "lucide-react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/viruses", label: "Virus Guide" },
  { href: "/map", label: "World Map" },
] as const;

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border-default bg-surface-inset px-6 py-10 text-center">
        <span className="flex size-10 items-center justify-center rounded-full bg-surface-raised text-text-faint">
          <SearchX className="size-5" aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-text-primary">
            We couldn&apos;t find that page
          </p>
          <p className="max-w-sm text-sm text-text-muted">
            The page you&apos;re looking for may have moved or no longer exists. Try one of
            these instead.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md border border-border-default px-3 py-1.5 text-text-secondary transition-colors hover:border-border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
