import { z } from "zod";

/**
 * Client-safe environment subset. Only NEXT_PUBLIC_* vars belong here —
 * anything imported by a "use client" component ends up in the browser
 * bundle, so server-only secrets (Supabase service role key, admin keys)
 * must never be re-exported from this module. Server code should keep
 * importing the full `env` from `@/lib/config` instead.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_ADSENSE_CLIENT: z.string().optional().default("ca-pub-2437840875186827"),
  NEXT_PUBLIC_ADSENSE_SLOT_TOP_BANNER: z.string().optional().default(""),
  NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR: z.string().optional().default(""),
  NEXT_PUBLIC_ADSENSE_SLOT_IN_FEED: z.string().optional().default(""),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional().default(""),
});

export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_ADSENSE_CLIENT: process.env.NEXT_PUBLIC_ADSENSE_CLIENT,
  NEXT_PUBLIC_ADSENSE_SLOT_TOP_BANNER: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP_BANNER,
  NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR,
  NEXT_PUBLIC_ADSENSE_SLOT_IN_FEED: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_FEED,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
});
