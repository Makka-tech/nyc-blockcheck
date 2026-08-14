import type {
  AddressResult,
  ComplaintCategory,
  ComplaintSummary,
} from "@/lib/types";
import { daysAgo, isSince, monthlySeries } from "./date-utils";
import { DATASETS, bblWhere, querySocrata, value } from "./socrata";

const CATEGORIES: [ComplaintCategory, RegExp][] = [
  ["Heat / hot water", /heat|hot water/i],
  ["Mold", /mold|mildew/i],
  ["Pests", /pest|rodent|vermin|insect|roach|bed ?bug/i],
  ["Plumbing", /plumb|toilet|drain|water leak/i],
  ["Electricity", /electric|outlet|wiring/i],
  ["Leaks", /leak|water damage/i],
  ["Doors / windows", /door|window/i],
  ["Sanitation", /sanitation|garbage|waste|filth/i],
];

export function classifyComplaint(value: string): ComplaintCategory {
  return CATEGORIES.find(([, pattern]) => pattern.test(value))?.[0] ?? "Other";
}

export function summarizeComplaints(
  records: { date?: string; text: string }[],
  now = new Date(),
): ComplaintSummary {
  const last12 = daysAgo(365, now);
  const previous12 = daysAgo(365 * 2, now);
  const last24 = previous12;
  const last5 = daysAgo(365 * 5, now);
  const categorized = records.map((record) => ({
    ...record,
    category: classifyComplaint(record.text),
  }));
  const heat12 = categorized.filter(
    (record) =>
      record.category === "Heat / hot water" && isSince(record.date, last12),
  ).length;
  const heatPrevious = categorized.filter(
    (record) =>
      record.category === "Heat / hot water" &&
      isSince(record.date, previous12) &&
      !isSince(record.date, last12),
  ).length;
  const trend =
    heat12 + heatPrevious < 3
      ? "insufficient-data"
      : heat12 > heatPrevious * 1.2
        ? "increased"
        : heat12 < heatPrevious * 0.8
          ? "decreased"
          : "steady";
  return {
    last12Months: records.filter((record) => isSince(record.date, last12))
      .length,
    last24Months: records.filter((record) => isSince(record.date, last24))
      .length,
    last5Years: records.filter((record) => isSince(record.date, last5)).length,
    categories: [...new Set(CATEGORIES.map(([category]) => category))]
      .map((category) => ({
        category,
        count: categorized.filter(
          (record) =>
            record.category === category && isSince(record.date, last5),
        ).length,
      }))
      .filter((item) => item.count > 0),
    monthly: monthlySeries(
      records.map((record) => record.date),
      24,
      now,
    ),
    heatHotWater12Months: heat12,
    heatHotWaterPrevious12Months: heatPrevious,
    trend,
  };
}

export async function getHpdComplaints(address: AddressResult) {
  const where = bblWhere(
    address.bbl,
    address.houseNumber,
    address.street,
    "house_number",
    "street_name",
  );
  if (!where) return summarizeComplaints([]);
  const rows = await querySocrata(DATASETS.hpdComplaints.id, {
    $select: "received_date,major_category,minor_category,type",
    $where: where,
    $limit: "5000",
    $order: "received_date DESC",
  });
  return summarizeComplaints(
    rows.map((row) => ({
      date: value(row, "received_date"),
      text: [
        value(row, "major_category"),
        value(row, "minor_category"),
        value(row, "type"),
      ]
        .filter(Boolean)
        .join(" "),
    })),
  );
}
