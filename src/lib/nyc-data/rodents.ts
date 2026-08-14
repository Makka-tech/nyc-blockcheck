import type { AddressResult, RodentSummary } from "@/lib/types";
import { daysAgo, isSince } from "./date-utils";
import { DATASETS, bblWhere, querySocrata, value } from "./socrata";

export function hasActiveRatSigns(result?: string) {
  if (!result) return null;
  if (/active rat signs/i.test(result)) return true;
  if (/no active rat signs/i.test(result)) return false;
  return null;
}

export async function getRodents(
  address: AddressResult,
): Promise<RodentSummary> {
  const where = bblWhere(
    address.bbl,
    address.houseNumber,
    address.street,
    "house_number",
    "street_name",
  );
  if (!where) return { records: [], activeRatSignsRecent: null };
  const rows = await querySocrata(DATASETS.rodents.id, {
    $select: "inspection_date,inspection_type,result,location",
    $where: where,
    $limit: "100",
    $order: "inspection_date DESC",
  });
  const records = rows.map((row) => ({
    date: value(row, "inspection_date"),
    type: value(row, "inspection_type"),
    result: value(row, "result"),
    location: value(row, "location"),
  }));
  const recent = records.filter((record) => isSince(record.date, daysAgo(365)));
  return {
    records,
    activeRatSignsRecent:
      recent
        .map((record) => hasActiveRatSigns(record.result))
        .find((result) => result !== null) ?? null,
  };
}
