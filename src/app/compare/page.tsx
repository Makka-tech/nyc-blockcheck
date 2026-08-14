import type { Metadata } from "next";
import Link from "next/link";
import { parseComparison } from "@/lib/address";
import { ComparePicker } from "@/components/compare-picker";
import { getBuildingReport } from "@/lib/report";
import { number } from "@/lib/format";

export const metadata: Metadata = { title: "Compare addresses" };
type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export default async function ComparePage({ searchParams }: Props) {
  const addresses = parseComparison((await searchParams).addresses);
  const reports = await Promise.all(addresses.map(getBuildingReport));
  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <Link href="/" className="focus-ring text-sm text-civic">
        ← New search
      </Link>
      <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight md:text-5xl">
        Compare building records
      </h1>
      <p className="mt-3 max-w-3xl leading-7 text-slate-600 dark:text-slate-300">
        This view puts selected public-record metrics side by side. It does not
        choose a “winner,” and a zero can mean no matching record was found.
      </p>
      <div className="mt-7">
        <ComparePicker addresses={addresses} />
      </div>
      {reports.length ? (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full min-w-[720px] text-left">
            <caption className="sr-only">
              Comparison of selected NYC building records
            </caption>
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="w-52 p-4 text-sm text-slate-500">Metric</th>
                {reports.map((report) => (
                  <th
                    className="p-4 align-top font-serif text-lg font-semibold"
                    key={report.address.label}
                  >
                    {report.address.houseNumber} {report.address.street}
                    <span className="mt-1 block font-sans text-sm font-normal text-slate-500">
                      {report.address.borough}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows(reports).map((row) => (
                <tr
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                  key={row.label}
                >
                  <th scope="row" className="p-4 text-sm font-medium">
                    {row.label}
                  </th>
                  {row.values.map((value, index) => (
                    <td className="p-4 tabular-nums" key={index}>
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
          <h2 className="font-serif text-2xl font-semibold">
            Add an address to start
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Choose up to three addresses above for a transparent, side-by-side
            record comparison.
          </p>
        </div>
      )}
      <p className="mt-6 text-sm leading-6 text-slate-500">
        Nearby noise and sanitation values are 311 reports within 250 m during
        the last 30 days, not direct measurements of neighborhood conditions.
        Bedbug reporting is property-owner self-report data where applicable.
      </p>
    </main>
  );
}

function rows(reports: Awaited<ReturnType<typeof getBuildingReport>>[]) {
  return [
    ["Year built", reports.map((r) => r.building?.yearBuilt ?? "—")],
    [
      "Residential units",
      reports.map((r) =>
        r.building?.residentialUnits
          ? number.format(r.building.residentialUnits)
          : "—",
      ),
    ],
    ["Open HPD violations", reports.map((r) => r.hpd.violations.open)],
    ["Open Class C violations", reports.map((r) => r.hpd.violations.classC)],
    [
      "Heat / hot-water reports (12 mo)",
      reports.map((r) => r.hpd.complaints.heatHotWater12Months),
    ],
    [
      "Latest bedbug filing: infested units",
      reports.map((r) => r.bedbugs.latest?.infested ?? "—"),
    ],
    ["Rodent inspection records", reports.map((r) => r.rodents.records.length)],
    ["DOB complaints", reports.map((r) => r.dob.count)],
    [
      "Executed residential evictions since 2017",
      reports.map((r) => r.evictions.count),
    ],
    [
      "Nearby noise reports (30 days)",
      reports.map(
        (r) =>
          r.neighborhood311.last30Days.find((item) => item.category === "Noise")
            ?.count ?? 0,
      ),
    ],
    [
      "Nearby sanitation reports (30 days)",
      reports.map(
        (r) =>
          r.neighborhood311.last30Days.find(
            (item) => item.category === "Sanitation",
          )?.count ?? 0,
      ),
    ],
    [
      "Building Health Indicator (experimental)",
      reports.map((r) => `${r.healthIndicator.score}/100`),
    ],
  ].map(([label, values]) => ({
    label: label as string,
    values: values as (string | number)[],
  }));
}
