import type { AddressResult, BedbugSummary } from "@/lib/types";
import {
  DATASETS,
  bblWhere,
  numberValue,
  querySocrata,
  value,
} from "./socrata";

export async function getBedbugs(
  address: AddressResult,
): Promise<BedbugSummary> {
  const where = bblWhere(
    address.bbl,
    address.houseNumber,
    address.street,
    "house_number",
    "street_name",
  );
  if (!where) return { reports: 0, annual: [] };
  const rows = await querySocrata(DATASETS.bedbugs.id, {
    $select:
      "filing_date,of_dwelling_units,infested_dwelling_unit_count,eradicated_unit_count,re_infested_dwelling_unit",
    $where: where,
    $limit: "500",
    $order: "filing_date DESC",
  });
  const annualMap = new Map<
    number,
    {
      year: number;
      dwellingUnits: number;
      infested: number;
      eradicated: number;
      reinfested: number;
    }
  >();
  for (const row of rows) {
    const filing = value(row, "filing_date");
    const year = filing ? new Date(filing).getUTCFullYear() : undefined;
    if (!year || !Number.isFinite(year)) continue;
    const current = annualMap.get(year) ?? {
      year,
      dwellingUnits: 0,
      infested: 0,
      eradicated: 0,
      reinfested: 0,
    };
    current.dwellingUnits += numberValue(row, "of_dwelling_units") ?? 0;
    current.infested += numberValue(row, "infested_dwelling_unit_count") ?? 0;
    current.eradicated += numberValue(row, "eradicated_unit_count") ?? 0;
    current.reinfested += numberValue(row, "re_infested_dwelling_unit") ?? 0;
    annualMap.set(year, current);
  }
  const annual = [...annualMap.values()].sort((a, b) => a.year - b.year);
  return { reports: rows.length, latest: annual.at(-1), annual };
}
