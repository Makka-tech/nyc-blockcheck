export type AddressResult = {
  label: string;
  houseNumber?: string;
  street?: string;
  borough?: string;
  postcode?: string;
  latitude: number;
  longitude: number;
  bbl?: string;
  bin?: string;
};

export type SourceId =
  | "geosearch"
  | "pluto"
  | "hpd-violations"
  | "hpd-complaints"
  | "bedbugs"
  | "rodents"
  | "dob"
  | "evictions"
  | "311";

export type DataSourceStatus = {
  id: SourceId;
  name: string;
  datasetUrl: string;
  status: "available" | "unavailable";
  fetchedAt: string;
  message?: string;
};

export type BuildingInfo = {
  yearBuilt?: number;
  residentialUnits?: number;
  buildingsOnLot?: number;
  floors?: number;
  landUse?: string;
  buildingClass?: string;
  lotArea?: number;
  buildingArea?: number;
  zoning?: string;
};

export type Violation = {
  id: string;
  date?: string;
  class: "A" | "B" | "C" | "Unknown";
  description: string;
  status?: string;
  isOpen: boolean;
};

export type ViolationSummary = {
  total: number;
  open: number;
  classA: number;
  classB: number;
  classC: number;
  last12Months: number;
  last36Months: number;
  monthly: MonthlyCount[];
  latest: Violation[];
};

export type ComplaintCategory =
  | "Heat / hot water"
  | "Mold"
  | "Pests"
  | "Plumbing"
  | "Electricity"
  | "Leaks"
  | "Doors / windows"
  | "Sanitation"
  | "Other";

export type MonthlyCount = { month: string; count: number };

export type ComplaintSummary = {
  last12Months: number;
  last24Months: number;
  last5Years: number;
  categories: { category: ComplaintCategory; count: number }[];
  monthly: MonthlyCount[];
  heatHotWater12Months: number;
  heatHotWaterPrevious12Months: number;
  trend: "increased" | "decreased" | "steady" | "insufficient-data";
};

export type BedbugSummary = {
  reports: number;
  latest?: {
    year: number;
    dwellingUnits: number;
    infested: number;
    eradicated: number;
    reinfested: number;
  };
  annual: {
    year: number;
    dwellingUnits: number;
    infested: number;
    eradicated: number;
    reinfested: number;
  }[];
};

export type RodentInspection = {
  date?: string;
  type?: string;
  result?: string;
  location?: string;
};
export type RodentSummary = {
  records: RodentInspection[];
  activeRatSignsRecent: boolean | null;
};

export type DobComplaint = {
  date?: string;
  category?: string;
  status?: string;
  inspectionDate?: string;
  disposition?: string;
};
export type DOBSummary = {
  count: number;
  recentCount: number;
  records: DobComplaint[];
};

export type EvictionSummary = {
  count: number;
  yearly: { year: number; count: number }[];
};

export type Neighborhood311Summary = {
  radius: number;
  last30Days: { category: string; count: number }[];
  monthly: MonthlyCount[];
  noiseByTime: { band: string; count: number }[];
  noiseInsight?: string;
  referenceNoiseMonthly?: number;
};

export type ScoreFactor = { label: string; points: number; detail: string };
export type HealthIndicator = { score: number; factors: ScoreFactor[] };
export type Finding = {
  kind: "check" | "positive";
  title: string;
  detail: string;
};

export interface BuildingReport {
  address: AddressResult;
  building: BuildingInfo | null;
  hpd: { violations: ViolationSummary; complaints: ComplaintSummary };
  dob: DOBSummary;
  bedbugs: BedbugSummary;
  rodents: RodentSummary;
  evictions: EvictionSummary;
  neighborhood311: Neighborhood311Summary;
  healthIndicator: HealthIndicator;
  redFlags: Finding[];
  positiveSignals: Finding[];
  metadata: { generatedAt: string; sources: DataSourceStatus[] };
}
