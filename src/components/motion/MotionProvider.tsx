"use client";

import type { ReactNode } from "react";
import { LazyMotion, domAnimation } from "motion/react";

export type MotionProviderProps = {
  children: ReactNode;
};

/**
 * Loads the `domAnimation` feature bundle (transforms, opacity, gestures,
 * layout excluded) so the rest of the app can use `m.*` components without
 * pulling in the full animation engine. `strict` makes framer-motion throw
 * in dev if any `motion.*` component sneaks in instead of `m.*`.
 *
 * Mount once, near the root of the tree (root layout).
 */
export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
