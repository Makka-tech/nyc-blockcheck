import { z } from "zod";

export const DATASETS = {
  pluto: {
    id: "64uk-42ks",
    name: "PLUTO",
    url: "https://data.cityofnewyork.us/d/64uk-42ks",
  },
  hpdViolations: {
    id: "wvxf-dwi5",
    name: "HPD Housing Maintenance Code Violations",
    url: "https://data.cityofnewyork.us/d/wvxf-dwi5",
  },
  hpdComplaints: {
    id: "ygpa-z7cr",
    name: "HPD Housing Maintenance Code Complaints and Problems",
    url: "https://data.cityofnewyork.us/d/ygpa-z7cr",
  },
  bedbugs: {
    id: "wz6d-d3jb",
    name: "Bedbug Reporting",
    url: "https://data.cityofnewyork.us/d/wz6d-d3jb",
  },
  rodents: {
    id: "p937-wjvj",
    name: "Rodent Inspection",
    url: "https://data.cityofnewyork.us/d/p937-wjvj",
  },
  dob: {
    id: "eabe-havv",
    name: "DOB Complaints Received",
    url: "https://data.cityofnewyork.us/d/eabe-havv",
  },
  evictions: {
    id: "6z8x-wfk4",
    name: "Evictions",
    url: "https://data.cityofnewyork.us/d/6z8x-wfk4",
  },
  threeOneOne: {
    id: "erm2-nwe9",
    name: "311 Service Requests from 2020 to Present",
    url: "https://data.cityofnewyork.us/d/erm2-nwe9",
  },
} as const;

const recordArray = z.array(z.record(z.unknown()));
export type SocrataRecord = z.infer<typeof recordArray>[number];

export class ExternalDataError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ExternalDataError";
  }
}

export function socrataLiteral(value: string) {
  return value.replace(/'/g, "''");
}

export async function querySocrata(
  datasetId: string,
  params: Record<string, string>,
): Promise<SocrataRecord[]> {
  const search = new URLSearchParams(params);
  const response = await fetch(
    `https://data.cityofnewyork.us/resource/${datasetId}.json?${search.toString()}`,
    {
      headers: process.env.SOCRATA_APP_TOKEN
        ? { "X-App-Token": process.env.SOCRATA_APP_TOKEN }
        : undefined,
      next: { revalidate: 60 * 30 },
    },
  );
  if (!response.ok)
    throw new ExternalDataError(
      `NYC Open Data returned ${response.status}.`,
      response.status,
    );
  const parsed = recordArray.safeParse(await response.json());
  if (!parsed.success)
    throw new ExternalDataError(
      "NYC Open Data returned records in an unexpected format.",
    );
  return parsed.data;
}

export function value(
  record: SocrataRecord,
  field: string,
): string | undefined {
  const raw = record[field];
  return typeof raw === "string" && raw.trim() ? raw.trim() : undefined;
}

export function numberValue(
  record: SocrataRecord,
  field: string,
): number | undefined {
  const raw = value(record, field);
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function bblWhere(
  bbl?: string,
  houseNumber?: string,
  street?: string,
  houseField = "housenumber",
  streetField = "streetname",
) {
  if (bbl) return `bbl='${socrataLiteral(bbl)}'`;
  if (houseNumber && street)
    return `upper(${houseField})='${socrataLiteral(houseNumber.toUpperCase())}' AND upper(${streetField})='${socrataLiteral(street.toUpperCase())}'`;
  return undefined;
}
