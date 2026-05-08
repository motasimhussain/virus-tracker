export type RegionMetric = {
  virus: string;
  slug: string;
  region: string;
  locationId: string;
  locationLevel: "country" | "admin1" | "city";
  countryName: string;
  admin1Name?: string;
  admin1Code?: string;
  cityName?: string;
  source: string;
  sourceConfidence: number;
  countryCode: string;
  latitude: number;
  longitude: number;
  activeCases: number;
  confirmedCases: number;
  deaths: number;
  recovered: number;
  updatedAt: string;
};

export type NewsItem = {
  id: string;
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  summary: string;
  virusTags: string[];
};

export type TrajectoryPoint = {
  date: string;
  projectedCases: number;
  confidenceLow: number;
  confidenceHigh: number;
};

export type VirusSnapshot = {
  slug: string;
  name: string;
  summary: string;
  metrics: RegionMetric[];
  trajectory: TrajectoryPoint[];
  latestGrowthRate: number;
};

export type DashboardSnapshot = {
  generatedAt: string;
  viruses: VirusSnapshot[];
  hotspots: RegionMetric[];
  news: NewsItem[];
};

export type TopThreat = {
  key: string;
  label: string;
  virusSlug: string;
  countryCode: string;
  region: string;
  activeCases: number;
};

export type ThreatMetricsSummary = {
  caseFatalityRatio: number;
  pressureIndex: number;
  recoveryRatio: number;
  confidenceAdjustedExposure: number;
  staleDataZones: number;
};

export type ThreatMatrixPoint = {
  key: string;
  label: string;
  pressure: number;
  caseFatalityRatio: number;
  activeCases: number;
  confidence: number;
};

export type SeverityRegionBucket = {
  key: string;
  label: string;
  totalActiveCases: number;
  severityScore: number;
};

export type SourceReliabilitySummary = {
  healthySources: number;
  unhealthySources: number;
  averageConfidence: number;
  confidenceAdjustedExposure: number;
};

export type FilteredDashboardView = {
  virusOptions: Array<{ slug: string; name: string }>;
  regionOptions: Array<{ locationId: string; label: string; level: RegionMetric["locationLevel"] }>;
  topThreats: TopThreat[];
  selectedVirusSlug: string | null;
  selectedThreatKey: string | null;
  leadVirus: VirusSnapshot | null;
  filteredHotspots: RegionMetric[];
  threatMetricsSummary: ThreatMetricsSummary;
  threatMatrixPoints: ThreatMatrixPoint[];
  severityByRegion: SeverityRegionBucket[];
  sourceReliabilitySummary: SourceReliabilitySummary;
};
