import type { AddressResult, EvictionSummary } from "@/lib/types";
import { byYear } from "./date-utils";
import { DATASETS, querySocrata, socrataLiteral, value } from "./socrata";

export async function getEvictions(
  address: AddressResult,
): Promise<EvictionSummary> {
  const where = address.bbl
    ? `bbl='${socrataLiteral(address.bbl)}' AND residential_commercial_ind='Residential' AND executed_date >= '2017-01-01T00:00:00.000'`
    : undefined;
  if (!where) return { count: 0, yearly: [] };
  const rows = await querySocrata(DATASETS.evictions.id, {
    $select: "executed_date",
    $where: where,
    $limit: "1000",
    $order: "executed_date DESC",
  });
  const dates = rows.map((row) => value(row, "executed_date"));
  return { count: rows.length, yearly: byYear(dates) };
}
