import type { AddressResult, Violation, ViolationSummary } from "@/lib/types";
import { daysAgo, isSince, monthlySeries } from "./date-utils";
import { DATASETS, bblWhere, querySocrata, value } from "./socrata";

const EMPTY: ViolationSummary = {
  total: 0,
  open: 0,
  classA: 0,
  classB: 0,
  classC: 0,
  last12Months: 0,
  last36Months: 0,
  monthly: [],
  latest: [],
};

function severity(raw?: string): Violation["class"] {
  const normalized = raw?.toUpperCase().replace("CLASS ", "");
  return normalized === "A" || normalized === "B" || normalized === "C"
    ? normalized
    : "Unknown";
}

export function isOpenViolation(status?: string) {
  return !/(close|dismiss|correct|vacat)/i.test(status ?? "");
}

export function summarizeViolations(
  violations: Violation[],
  now = new Date(),
): ViolationSummary {
  if (!violations.length)
    return { ...EMPTY, monthly: monthlySeries([], 12, now) };
  return {
    total: violations.length,
    open: violations.filter((violation) => violation.isOpen).length,
    classA: violations.filter(
      (violation) => violation.class === "A" && violation.isOpen,
    ).length,
    classB: violations.filter(
      (violation) => violation.class === "B" && violation.isOpen,
    ).length,
    classC: violations.filter(
      (violation) => violation.class === "C" && violation.isOpen,
    ).length,
    last12Months: violations.filter((violation) =>
      isSince(violation.date, daysAgo(365, now)),
    ).length,
    last36Months: violations.filter((violation) =>
      isSince(violation.date, daysAgo(365 * 3, now)),
    ).length,
    monthly: monthlySeries(
      violations.map((violation) => violation.date),
      12,
      now,
    ),
    latest: [...violations]
      .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
      .slice(0, 12),
  };
}

export async function getHpdViolations(address: AddressResult) {
  const where = bblWhere(address.bbl, address.houseNumber, address.street);
  if (!where) return summarizeViolations([]);
  const rows = await querySocrata(DATASETS.hpdViolations.id, {
    $select:
      "violationid,class,novdescription,novissueddate,currentstatus,violationstatus,currentstatusdate",
    $where: where,
    $limit: "5000",
    $order: "novissueddate DESC",
  });
  return summarizeViolations(
    rows.map((row) => {
      const status =
        value(row, "violationstatus") ?? value(row, "currentstatus");
      return {
        id: value(row, "violationid") ?? crypto.randomUUID(),
        date: value(row, "novissueddate"),
        class: severity(value(row, "class")),
        description: value(row, "novdescription") ?? "Description not provided",
        status,
        isOpen: isOpenViolation(status),
      };
    }),
  );
}
