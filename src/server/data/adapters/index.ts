import { cdcOutbreaksRssAdapter } from "./cdc-outbreaks-rss";
import { covidHistoricalProvider } from "./covid-historical";
import { delphiFluViewAdapter, influenzaTrajectoryProvider } from "./delphi-fluview";
import { diseaseShCountriesAdapter } from "./disease-sh-countries";
import { diseaseShUsStatesAdapter } from "./disease-sh-us-states";
import { ecdcCovidAdapter } from "./ecdc-covid";
import { googleNewsAdapter } from "./google-news";
import { owidCovidAdapter } from "./owid-covid";
import { mpoxTrajectoryProvider, owidMpoxAdapter } from "./owid-mpox";
import { promedRssAdapter } from "./promed-rss";
import { reliefWebAdapter } from "./reliefweb";
import type { MetricsAdapter, NewsAdapter, TrajectoryProvider } from "./types";
import { whoDonAdapter } from "./who-don";
import { whoGhoAdapter } from "./who-gho";

export const METRIC_ADAPTERS: MetricsAdapter[] = [
  diseaseShCountriesAdapter,
  diseaseShUsStatesAdapter,
  ecdcCovidAdapter,
  owidCovidAdapter,
  owidMpoxAdapter,
  delphiFluViewAdapter,
  whoGhoAdapter,
];

export const NEWS_ADAPTERS: NewsAdapter[] = [
  googleNewsAdapter,
  whoDonAdapter,
  reliefWebAdapter,
  promedRssAdapter,
  cdcOutbreaksRssAdapter,
];

/**
 * Real (non-synthetic) per-virus trajectory providers. Every entry here
 * fetches a genuine reported/derived time series for its `virusSlug`;
 * viruses without a provider fall back to the curated fallback-data.ts
 * trajectory (or the synthetic buildTrajectory projection) — see
 * `analysis.ts`'s `selectTrajectory` and dashboard-service.ts.
 */
export const TRAJECTORY_PROVIDERS: TrajectoryProvider[] = [
  covidHistoricalProvider,
  mpoxTrajectoryProvider,
  influenzaTrajectoryProvider,
];

export type { IngestionAdapter, MetricsAdapter, NewsAdapter, TrajectoryProvider } from "./types";
