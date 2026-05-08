import { z } from "zod";

const envSchema = z.object({
  APP_URL: z.string().url().default("https://virus-tracker.com"),
  INGESTION_TTL_SECONDS: z.coerce.number().min(60).default(600),
  REVALIDATE_SECONDS: z.coerce.number().min(60).default(300),
  MAPBOX_TOKEN: z.string().optional(),
  INGESTION_ADMIN_KEY: z.string().optional(),
});

export const env = envSchema.parse({
  APP_URL: process.env.APP_URL,
  INGESTION_TTL_SECONDS: process.env.INGESTION_TTL_SECONDS,
  REVALIDATE_SECONDS: process.env.REVALIDATE_SECONDS,
  MAPBOX_TOKEN: process.env.MAPBOX_TOKEN,
  INGESTION_ADMIN_KEY: process.env.INGESTION_ADMIN_KEY,
});
