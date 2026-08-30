"use client";

import { useEffect, useRef } from "react";

import { clientEnv as env } from "@/lib/env-client";

export type AdPlacement = "top-banner" | "sidebar" | "in-feed";

type AdSlotProps = {
  placement: AdPlacement;
  slotName: string;
  className?: string;
  /** AdSense layout key, e.g. horizontal for leaderboard-style */
  layout?: string;
  layoutKey?: string;
};

function getSlotId(placement: AdPlacement): string {
  switch (placement) {
    case "top-banner":
      return env.NEXT_PUBLIC_ADSENSE_SLOT_TOP_BANNER;
    case "sidebar":
      return env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR;
    case "in-feed":
      return env.NEXT_PUBLIC_ADSENSE_SLOT_IN_FEED;
    default:
      return "";
  }
}

export function AdSlot({ placement, slotName, className, layout, layoutKey }: AdSlotProps) {
  const insRef = useRef<HTMLModElement>(null);
  const clientId = env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const slotId = getSlotId(placement);

  useEffect(() => {
    if (!clientId || !slotId || !insRef.current) return;
    const el = insRef.current;
    if (el.getAttribute("data-adsbygoogle-status")) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers or CSP; leave slot empty
    }
  }, [clientId, slotId]);

  if (!clientId) {
    return (
      <aside
        aria-label={`Advertisement slot: ${slotName}`}
        className={`rounded-xl border border-cyan-500/20 bg-slate-900/60 p-4 text-xs text-cyan-200 ${className ?? ""}`}
      >
        <p className="mb-1 uppercase tracking-[0.2em] text-cyan-400">Sponsored</p>
        <p className="font-semibold">{slotName}</p>
        <p className="mt-2 text-cyan-100/60">Set NEXT_PUBLIC_ADSENSE_CLIENT to enable Google AdSense.</p>
      </aside>
    );
  }

  if (!slotId) {
    return (
      <aside
        aria-label={`Advertisement slot: ${slotName}`}
        className={`rounded-xl border border-amber-500/30 bg-slate-900/60 p-4 text-xs text-amber-100/90 ${className ?? ""}`}
      >
        <p className="mb-1 uppercase tracking-[0.2em] text-amber-400">AdSense</p>
        <p className="font-semibold text-cyan-100">{slotName}</p>
        <p className="mt-2 text-cyan-100/70">
          Create an ad unit in AdSense and set{" "}
          <span className="font-mono text-cyan-200">
            {placement === "top-banner"
              ? "NEXT_PUBLIC_ADSENSE_SLOT_TOP_BANNER"
              : placement === "sidebar"
                ? "NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR"
                : "NEXT_PUBLIC_ADSENSE_SLOT_IN_FEED"}
          </span>{" "}
          to the slot ID.
        </p>
      </aside>
    );
  }

  return (
    <aside
      aria-label={`Advertisement: ${slotName}`}
      className={`overflow-hidden rounded-xl border border-cyan-500/15 bg-slate-900/40 ${className ?? ""}`}
    >
      <ins
        ref={insRef}
        className="adsbygoogle block min-h-[90px] w-full"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
        {...(layout ? { "data-ad-layout": layout } : {})}
        {...(layoutKey ? { "data-ad-layout-key": layoutKey } : {})}
      />
    </aside>
  );
}
