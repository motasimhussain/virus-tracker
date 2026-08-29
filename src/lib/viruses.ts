/**
 * Canonical virus registry.
 *
 * This is the single source of truth for which pathogens Virus Tracker knows
 * about. `src/data/virus-wiki.ts` (wiki content) and
 * `src/server/data/fallback-data.ts` (seed metrics/trajectory) are typed
 * against `VirusSlug` so that adding, removing, or renaming a slug here is a
 * compile-time-visible change across the codebase instead of a silent
 * runtime mismatch.
 */

export type VirusSlug =
  | "covid-19"
  | "zika"
  | "chikungunya"
  | "nipah"
  | "avian-influenza-h5n1"
  | "lassa-fever"
  | "marburg"
  | "hantavirus"
  | "dengue"
  | "cholera"
  | "mpox"
  | "influenza"
  | "ebola";

export type VirusCategory =
  | "respiratory"
  | "vector-borne"
  | "zoonotic"
  | "waterborne"
  | "hemorrhagic"
  | "other";

export interface VirusDefinition {
  slug: VirusSlug;
  name: string;
  shortName: string;
  newsAliases: string[];
  category: VirusCategory;
  /** Whether live/ingested metrics can exist for this virus today. */
  hasLiveData: boolean;
}

export const VIRUSES: readonly VirusDefinition[] = [
  {
    slug: "covid-19",
    name: "COVID-19",
    shortName: "COVID-19",
    newsAliases: ["covid", "covid-19", "coronavirus", "sars-cov-2"],
    category: "respiratory",
    hasLiveData: true,
  },
  {
    slug: "zika",
    name: "Zika",
    shortName: "Zika",
    newsAliases: ["zika", "zika virus"],
    category: "vector-borne",
    hasLiveData: false,
  },
  {
    slug: "chikungunya",
    name: "Chikungunya",
    shortName: "Chikungunya",
    newsAliases: ["chikungunya", "chik-v"],
    category: "vector-borne",
    hasLiveData: false,
  },
  {
    slug: "nipah",
    name: "Nipah",
    shortName: "Nipah",
    newsAliases: ["nipah", "nipah virus"],
    category: "zoonotic",
    hasLiveData: false,
  },
  {
    slug: "avian-influenza-h5n1",
    name: "Avian Influenza (H5N1)",
    shortName: "H5N1",
    newsAliases: ["h5n1", "bird flu", "avian influenza", "avian flu"],
    category: "zoonotic",
    hasLiveData: false,
  },
  {
    slug: "lassa-fever",
    name: "Lassa Fever",
    shortName: "Lassa",
    newsAliases: ["lassa", "lassa fever"],
    category: "hemorrhagic",
    hasLiveData: false,
  },
  {
    slug: "marburg",
    name: "Marburg",
    shortName: "Marburg",
    newsAliases: ["marburg", "marburg virus", "mvd"],
    category: "hemorrhagic",
    hasLiveData: false,
  },
  {
    slug: "hantavirus",
    name: "Hantavirus",
    shortName: "Hanta",
    newsAliases: ["hantavirus", "hantavirus pulmonary syndrome", "hps", "hfrs"],
    category: "hemorrhagic",
    hasLiveData: false,
  },
  {
    slug: "dengue",
    name: "Dengue",
    shortName: "Dengue",
    newsAliases: ["dengue", "dengue fever", "breakbone fever"],
    category: "vector-borne",
    hasLiveData: false,
  },
  {
    slug: "cholera",
    name: "Cholera",
    shortName: "Cholera",
    newsAliases: ["cholera", "vibrio cholerae"],
    category: "waterborne",
    hasLiveData: false,
  },
  {
    slug: "mpox",
    name: "Mpox",
    shortName: "Mpox",
    newsAliases: ["mpox", "monkeypox"],
    category: "zoonotic",
    hasLiveData: false,
  },
  {
    slug: "influenza",
    name: "Influenza",
    shortName: "Flu",
    newsAliases: ["flu", "influenza", "seasonal flu"],
    category: "respiratory",
    hasLiveData: false,
  },
  {
    slug: "ebola",
    name: "Ebola",
    shortName: "Ebola",
    newsAliases: ["ebola", "ebola virus disease", "evd"],
    category: "hemorrhagic",
    hasLiveData: false,
  },
] as const;

export const VIRUS_SLUGS: readonly VirusSlug[] = VIRUSES.map((virus) => virus.slug);

const VIRUS_SLUG_SET: ReadonlySet<string> = new Set(VIRUS_SLUGS);

const VIRUS_BY_SLUG: Readonly<Record<VirusSlug, VirusDefinition>> = VIRUSES.reduce(
  (acc, virus) => {
    acc[virus.slug] = virus;
    return acc;
  },
  {} as Record<VirusSlug, VirusDefinition>,
);

export function isVirusSlug(s: string): s is VirusSlug {
  return VIRUS_SLUG_SET.has(s);
}

export function getVirusDef(slug: string): VirusDefinition | null {
  return isVirusSlug(slug) ? VIRUS_BY_SLUG[slug] : null;
}
