import { getBedbugs } from "@/lib/nyc-data/bedbugs";
import { getDobComplaints } from "@/lib/nyc-data/dob-complaints";
import { getEvictions } from "@/lib/nyc-data/evictions";
import { getHpdComplaints } from "@/lib/nyc-data/hpd-complaints";
import { getHpdViolations } from "@/lib/nyc-data/hpd-violations";
import { getPluto } from "@/lib/nyc-data/pluto";
import { getRodents } from "@/lib/nyc-data/rodents";
import { DATASETS } from "@/lib/nyc-data/socrata";
import { getNeighborhood311 } from "@/lib/nyc-data/three-one-one";
import { calculateBuildingHealth } from "@/lib/scoring/building-health";
import type {
  AddressResult,
  BuildingReport,
  DataSourceStatus,
  Finding,
  RodentSummary,
  SourceId,
} from "@/lib/types";

type DatasetKey = keyof typeof DATASETS;
const sourceId: Record<DatasetKey, SourceId> = {
  pluto: "pluto",
  hpdViolations: "hpd-violations",
  hpdComplaints: "hpd-complaints",
  bedbugs: "bedbugs",
  rodents: "rodents",
  dob: "dob",
  evictions: "evictions",
  threeOneOne: "311",
};

async function loaded<T>(
  dataset: DatasetKey,
  load: () => Promise<T>,
  fallback: T,
) {
  const fetchedAt = new Date().toISOString();
  try {
    const value = await load();
    const data = DATASETS[dataset];
    return {
      value,
      source: {
        id: sourceId[dataset],
        name: data.name,
        datasetUrl: data.url,
        status: "available",
        fetchedAt,
      } satisfies DataSourceStatus,
    };
  } catch (error) {
    const data = DATASETS[dataset];
    return {
      value: fallback,
      source: {
        id: sourceId[dataset],
        name: data.name,
        datasetUrl: data.url,
        status: "unavailable",
        fetchedAt,
        message:
          error instanceof Error
            ? error.message
            : "The data source could not be reached.",
      } satisfies DataSourceStatus,
    };
  }
}

export async function getBuildingReport(
  address: AddressResult,
): Promise<BuildingReport> {
  if (process.env.E2E_MOCK_REPORT === "1") return mockReport(address);
  const [
    pluto,
    violations,
    complaints,
    bedbugs,
    rodents,
    dob,
    evictions,
    neighborhood311,
  ] = await Promise.all([
    loaded("pluto", () => getPluto(address), null),
    loaded("hpdViolations", () => getHpdViolations(address), {
      total: 0,
      open: 0,
      classA: 0,
      classB: 0,
      classC: 0,
      last12Months: 0,
      last36Months: 0,
      monthly: [],
      latest: [],
    }),
    loaded("hpdComplaints", () => getHpdComplaints(address), {
      last12Months: 0,
      last24Months: 0,
      last5Years: 0,
      categories: [],
      monthly: [],
      heatHotWater12Months: 0,
      heatHotWaterPrevious12Months: 0,
      trend: "insufficient-data" as const,
    }),
    loaded("bedbugs", () => getBedbugs(address), { reports: 0, annual: [] }),
    loaded("rodents", () => getRodents(address), {
      records: [],
      activeRatSignsRecent: null,
    }),
    loaded("dob", () => getDobComplaints(address), {
      count: 0,
      recentCount: 0,
      records: [],
    }),
    loaded("evictions", () => getEvictions(address), { count: 0, yearly: [] }),
    loaded("threeOneOne", () => getNeighborhood311(address), {
      radius: 250,
      last30Days: [],
      monthly: [],
      noiseByTime: [],
      referenceNoiseMonthly: 0,
    }),
  ]);
  const healthIndicator = calculateBuildingHealth(
    violations.value,
    complaints.value,
    bedbugs.value,
    rodents.value,
  );
  const sources = [
    {
      id: "geosearch" as const,
      name: "NYC Planning GeoSearch",
      datasetUrl: "https://geosearch.planninglabs.nyc/",
      status: "available" as const,
      fetchedAt: new Date().toISOString(),
    },
    pluto.source,
    violations.source,
    complaints.source,
    bedbugs.source,
    rodents.source,
    dob.source,
    evictions.source,
    neighborhood311.source,
  ];
  return {
    address,
    building: pluto.value,
    hpd: { violations: violations.value, complaints: complaints.value },
    dob: dob.value,
    bedbugs: bedbugs.value,
    rodents: rodents.value,
    evictions: evictions.value,
    neighborhood311: neighborhood311.value,
    healthIndicator,
    redFlags: getRedFlags(
      violations.value,
      complaints.value,
      bedbugs.value,
      dob.value,
    ),
    positiveSignals: getPositiveSignals(
      violations.value,
      complaints.value,
      rodents.value,
      sources,
    ),
    metadata: { generatedAt: new Date().toISOString(), sources },
  };
}

function mockReport(address: AddressResult): BuildingReport {
  const fetchedAt = new Date().toISOString();
  const sources: DataSourceStatus[] = [
    {
      id: "geosearch",
      name: "NYC Planning GeoSearch",
      datasetUrl: "https://geosearch.planninglabs.nyc/",
      status: "available",
      fetchedAt,
    },
    ...Object.entries(DATASETS).map(([key, dataset]) => ({
      id: sourceId[key as DatasetKey],
      name: dataset.name,
      datasetUrl: dataset.url,
      status: "available" as const,
      fetchedAt,
    })),
  ];
  const violations = {
    total: 2,
    open: 1,
    classA: 0,
    classB: 1,
    classC: 0,
    last12Months: 1,
    last36Months: 2,
    monthly: [],
    latest: [],
  };
  const complaints = {
    last12Months: 1,
    last24Months: 2,
    last5Years: 2,
    categories: [],
    monthly: [],
    heatHotWater12Months: 0,
    heatHotWaterPrevious12Months: 0,
    trend: "insufficient-data" as const,
  };
  const bedbugs = { reports: 0, annual: [] };
  const rodents: RodentSummary = { records: [], activeRatSignsRecent: null };
  return {
    address,
    building: {
      yearBuilt: 1925,
      residentialUnits: 24,
      floors: 6,
      landUse: "Residential",
      buildingClass: "C1",
    },
    hpd: { violations, complaints },
    bedbugs,
    rodents,
    dob: { count: 0, recentCount: 0, records: [] },
    evictions: { count: 0, yearly: [] },
    neighborhood311: {
      radius: 250,
      last30Days: [],
      monthly: [],
      noiseByTime: [],
      referenceNoiseMonthly: 0,
    },
    healthIndicator: calculateBuildingHealth(
      violations,
      complaints,
      bedbugs,
      rodents,
    ),
    redFlags: [],
    positiveSignals: getPositiveSignals(
      violations,
      complaints,
      rodents,
      sources,
    ),
    metadata: { generatedAt: fetchedAt, sources },
  };
}

function getRedFlags(
  violations: BuildingReport["hpd"]["violations"],
  complaints: BuildingReport["hpd"]["complaints"],
  bedbugs: BuildingReport["bedbugs"],
  dob: BuildingReport["dob"],
): Finding[] {
  const findings: Finding[] = [];
  if (violations.classC)
    findings.push({
      kind: "check",
      title: `${violations.classC} open Class C HPD violation${violations.classC === 1 ? "" : "s"}`,
      detail:
        "Class C is HPD's immediately hazardous severity class. Review the underlying records and current status.",
    });
  if (
    complaints.heatHotWater12Months + complaints.heatHotWaterPrevious12Months >=
    4
  )
    findings.push({
      kind: "check",
      title: `${complaints.last24Months} HPD problems recorded in the last 24 months`,
      detail: `${complaints.heatHotWater12Months} were categorized as heat / hot-water related in the last 12 months.`,
    });
  if ((bedbugs.latest?.infested ?? 0) > 0)
    findings.push({
      kind: "check",
      title: `Recent bedbug filing reports ${bedbugs.latest?.infested} affected unit${bedbugs.latest?.infested === 1 ? "" : "s"}`,
      detail:
        "Bedbug filings are property-owner self-reports; they are not an inspection finding.",
    });
  if (dob.recentCount >= 3)
    findings.push({
      kind: "check",
      title: `${dob.recentCount} DOB complaints were entered in the last year`,
      detail:
        "This is construction and building-code complaint activity, not a finding about risk.",
    });
  return findings;
}

function getPositiveSignals(
  violations: BuildingReport["hpd"]["violations"],
  complaints: BuildingReport["hpd"]["complaints"],
  rodents: BuildingReport["rodents"],
  sources: DataSourceStatus[],
): Finding[] {
  const available = (id: SourceId) =>
    sources.some((source) => source.id === id && source.status === "available");
  const findings: Finding[] = [];
  if (available("hpd-violations") && violations.classC === 0)
    findings.push({
      kind: "positive",
      title: "No open Class C HPD violations found",
      detail:
        "This only reflects records returned by HPD at the time of this report.",
    });
  if (available("rodents") && rodents.activeRatSignsRecent === false)
    findings.push({
      kind: "positive",
      title: "A recent rodent inspection recorded no active rat signs",
      detail: "This does not mean no rodents are present now.",
    });
  if (available("hpd-complaints") && complaints.trend === "decreased")
    findings.push({
      kind: "positive",
      title:
        "Heat / hot-water complaint activity decreased from the prior year",
      detail: "This compares HPD problem records in two 12-month windows.",
    });
  return findings;
}
