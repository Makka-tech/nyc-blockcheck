import type { AddressResult, DOBSummary } from "@/lib/types";
import { daysAgo, isSince } from "./date-utils";
import { DATASETS, querySocrata, socrataLiteral, value } from "./socrata";

export async function getDobComplaints(
  address: AddressResult,
): Promise<DOBSummary> {
  const where = address.bin
    ? `bin='${socrataLiteral(address.bin)}'`
    : address.houseNumber && address.street
      ? `upper(house_number)='${socrataLiteral(address.houseNumber.toUpperCase())}' AND upper(house_street)='${socrataLiteral(address.street.toUpperCase())}'`
      : undefined;
  if (!where) return { count: 0, recentCount: 0, records: [] };
  const rows = await querySocrata(DATASETS.dob.id, {
    $select:
      "date_entered,complaint_category,status,inspection_date,disposition_code",
    $where: where,
    $limit: "500",
    $order: "date_entered DESC",
  });
  const records = rows.map((row) => ({
    date: value(row, "date_entered"),
    category: value(row, "complaint_category"),
    status: value(row, "status"),
    inspectionDate: value(row, "inspection_date"),
    disposition: value(row, "disposition_code"),
  }));
  return {
    count: records.length,
    recentCount: records.filter((record) => isSince(record.date, daysAgo(365)))
      .length,
    records: records.slice(0, 12),
  };
}
