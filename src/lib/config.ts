import { z } from "zod";

const envSchema = z.object({
  APP_URL: z.string().url().default("https://virus-tracker.com"),
  INGESTION_TTL_SECONDS: z.coerce.number().min(60).default(1800),
  REVALIDATE_SECONDS: z.coerce.number().min(60).default(1800),
  INGESTION_ADMIN_KEY: z.string().optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  NEXT_PUBLIC_ADSENSE_CLIENT: z.string().optional().default("ca-pub-2437840875186827"),
  NEXT_PUBLIC_ADSENSE_SLOT_TOP_BANNER: z.string().optional().default(""),
  NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR: z.string().optional().default(""),
  NEXT_PUBLIC_ADSENSE_SLOT_IN_FEED: z.string().optional().default(""),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional().default(""),
});

export const env = envSchema.parse({
  APP_URL: process.env.APP_URL,
  INGESTION_TTL_SECONDS: process.env.INGESTION_TTL_SECONDS,
  REVALIDATE_SECONDS: process.env.REVALIDATE_SECONDS,
  INGESTION_ADMIN_KEY: process.env.INGESTION_ADMIN_KEY,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_ADSENSE_CLIENT: process.env.NEXT_PUBLIC_ADSENSE_CLIENT,
  NEXT_PUBLIC_ADSENSE_SLOT_TOP_BANNER: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP_BANNER,
  NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR,
  NEXT_PUBLIC_ADSENSE_SLOT_IN_FEED: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_FEED,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
});
