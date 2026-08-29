"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Info } from "lucide-react";

import { cn } from "@/lib/cn";

export type InfoTipProps = {
  /** Accessible label for the trigger button, e.g. "What does this metric mean?". */
  label: string;
  /** Plain-English explanation shown inside the popover. */
  children: ReactNode;
  className?: string;
};

/**
 * Small accessible info popover: an (i) button that reveals an explanation
 * on hover, focus, or tap. Keyboard: Escape closes and returns focus to the
 * trigger. No external popover library — positioning is a simple absolute
 * panel anchored to the trigger.
 */
export function InfoTip({ label, children, className }: InfoTipProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLSpanElement>(null);
  const popoverId = useId();

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [open]);

  return (
    <span ref={containerRef} className={cn("relative inline-flex", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? popoverId : undefined}
        onClick={() => setOpen((value) => !value)}
        onFocus={() => setOpen(true)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onBlur={(event) => {
          if (!containerRef.current?.contains(event.relatedTarget as Node)) {
            setOpen(false);
          }
        }}
        className="flex size-4 items-center justify-center rounded-full text-text-faint transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-surface-raised"
      >
        <Info className="size-3.5" aria-hidden="true" />
      </button>
      {open ? (
        <span
          id={popoverId}
          role="tooltip"
          className="animate-scale-in absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-lg border border-border-default bg-surface-overlay p-3 text-xs leading-relaxed text-text-secondary shadow-elevated"
        >
          {children}
        </span>
      ) : null}
    </span>
  );
}
