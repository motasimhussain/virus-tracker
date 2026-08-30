import { clsx, type ClassValue } from "clsx";

/**
 * Combine class name fragments, dropping falsy values.
 * Thin wrapper around clsx — no tailwind-merge, so conflicting
 * utility classes are not deduped (last one wins per Tailwind's cascade).
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(...inputs);
}
