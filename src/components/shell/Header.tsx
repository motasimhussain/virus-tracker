"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/map", label: "World Map" },
  { href: "/news", label: "Outbreak News" },
  { href: "/viruses", label: "Virus Guide" },
  { href: "/about-data", label: "About the Data" },
] as const;

/** Small virus glyph reusing the ring + spike motif from src/app/icon.svg. */
function VirusGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={className}
      fill="none"
    >
      <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="3" className="text-accent" />
      <g fill="currentColor" className="text-highlight">
        <polygon points="30,21 34,21 32,14" />
        <g transform="rotate(45 32 32)"><polygon points="30,21 34,21 32,14" /></g>
        <g transform="rotate(90 32 32)"><polygon points="30,21 34,21 32,14" /></g>
        <g transform="rotate(135 32 32)"><polygon points="30,21 34,21 32,14" /></g>
        <g transform="rotate(180 32 32)"><polygon points="30,21 34,21 32,14" /></g>
        <g transform="rotate(225 32 32)"><polygon points="30,21 34,21 32,14" /></g>
        <g transform="rotate(270 32 32)"><polygon points="30,21 34,21 32,14" /></g>
        <g transform="rotate(315 32 32)"><polygon points="30,21 34,21 32,14" /></g>
      </g>
      <circle cx="32" cy="32" r="11" fill="currentColor" className="text-highlight" />
    </svg>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-border-default bg-surface-page/80 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-[0.2em] text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page rounded-md"
        >
          <VirusGlyph className="size-6" />
          <span>VIRUS TRACKER</span>
        </Link>

        <div className="hidden items-center gap-5 text-sm md:flex">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-1 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page",
                  active ? "text-accent" : "text-text-secondary hover:text-accent",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-text-secondary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-panel"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        </button>
      </nav>

      <div
        id="mobile-nav-panel"
        className={cn(
          "overflow-hidden border-t border-border-default bg-surface-page/95 backdrop-blur transition-[max-height] duration-200 ease-out md:hidden",
          menuOpen ? "max-h-80" : "max-h-0 border-t-0",
        )}
      >
        <div className="flex flex-col gap-1 px-6 py-3 text-sm">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-2 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page",
                  active ? "text-accent" : "text-text-secondary hover:text-accent",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
