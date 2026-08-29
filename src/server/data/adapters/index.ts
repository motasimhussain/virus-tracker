import { diseaseShCountriesAdapter } from "./disease-sh-countries";
import { diseaseShUsStatesAdapter } from "./disease-sh-us-states";
import { ecdcCovidAdapter } from "./ecdc-covid";
import { googleNewsAdapter } from "./google-news";
import { owidCovidAdapter } from "./owid-covid";
import { reliefWebAdapter } from "./reliefweb";
import type { MetricsAdapter, NewsAdapter } from "./types";
import { whoDonAdapter } from "./who-don";

export const METRIC_ADAPTERS: MetricsAdapter[] = [
  diseaseShCountriesAdapter,
  diseaseShUsStatesAdapter,
  ecdcCovidAdapter,
  owidCovidAdapter,
];

export const NEWS_ADAPTERS: NewsAdapter[] = [googleNewsAdapter, whoDonAdapter, reliefWebAdapter];

export type { IngestionAdapter, MetricsAdapter, NewsAdapter } from "./types";
