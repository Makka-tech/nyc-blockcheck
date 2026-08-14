import Link from "next/link";
import { BarList, LineChart } from "@/components/charts";
import { comparisonUrl } from "@/lib/address";
import { formatDate, number, titleCase } from "@/lib/format";
import type { BuildingReport, DataSourceStatus } from "@/lib/types";
import { SourceNote } from "@/components/source-note";

function source(report: BuildingReport, id: DataSourceStatus["id"]) {
  return report.metadata.sources.find((item) => item.id === id)!;
}
function plural(count: number, word: string) {
  return `${number.format(count)} ${word}${count === 1 ? "" : "s"}`;
}

export function ReportHeader({ report }: { report: BuildingReport }) {
  const building = report.building;
  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <Link href="/" className="focus-ring text-sm text-civic">
          ← New search
        </Link>
        <div className="mt-5 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="label">Building report</p>
            <h1 className="mt-2 max-w-3xl font-serif text-4xl font-semibold tracking-tight md:text-5xl">
              {report.address.label}
            </h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              {[report.address.borough, report.address.postcode]
                .filter(Boolean)
                .join(" · ") || "NYC address"}
              {building?.residentialUnits
                ? ` · ${plural(building.residentialUnits, "residential unit")}`
                : ""}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Report generated {formatDate(report.metadata.generatedAt)}. Public
              data can change after this report is generated.
            </p>
          </div>
          <Link
            className="focus-ring w-fit rounded-lg border border-civic px-4 py-2.5 font-medium text-civic no-underline hover:bg-civic hover:text-white"
            href={comparisonUrl([report.address])}
          >
            Compare this address
          </Link>
        </div>
      </div>
    </header>
  );
}

export function BuildingOverview({ report }: { report: BuildingReport }) {
  const entries = report.building
    ? [
        ["Year built", report.building.yearBuilt],
        [
          "Residential units",
          report.building.residentialUnits &&
            number.format(report.building.residentialUnits),
        ],
        ["Buildings on lot", report.building.buildingsOnLot],
        ["Floors", report.building.floors],
        ["Land use", titleCase(report.building.landUse)],
        ["Building class", report.building.buildingClass],
        [
          "Lot area",
          report.building.lotArea &&
            `${number.format(report.building.lotArea)} sq ft`,
        ],
        [
          "Building area",
          report.building.buildingArea &&
            `${number.format(report.building.buildingArea)} sq ft`,
        ],
        ["Primary zoning", report.building.zoning],
      ].filter((entry): entry is [string, string | number] =>
        Boolean(entry[1] !== undefined && entry[1] !== "Not provided"),
      )
    : [];
  return (
    <section className="card">
      <h2>Building overview</h2>
      {entries.length ? (
        <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-3">
          {entries.map(([label, value]) => (
            <div key={label}>
              <dt className="label">{label}</dt>
              <dd className="mt-1 font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <NoRecords source={source(report, "pluto")} />
      )}
      <SourceNote source={source(report, "pluto")} />
    </section>
  );
}

export function HealthCard({ report }: { report: BuildingReport }) {
  const health = report.healthIndicator;
  return (
    <section className="card border-civic/30 bg-civic/[.035] dark:bg-civic/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label text-civic">Experimental</p>
          <h2 className="mt-1">Building Health Indicator</h2>
        </div>
        <p className="font-serif text-5xl font-semibold text-civic">
          <span>{health.score}</span>
          <span className="text-xl text-slate-500">/100</span>
        </p>
      </div>
      <p className="subtle mt-3">
        A transparent, building-level summary of selected public records—not a
        safety rating.
      </p>
      <details className="mt-4 rounded-xl border border-civic/20 bg-white/70 p-3 text-sm dark:bg-slate-900/70">
        <summary className="cursor-pointer font-semibold">
          Why this score?
        </summary>
        <ul className="mt-3 space-y-2">
          {health.factors.map((factor) => (
            <li className="flex gap-3" key={`${factor.label}-${factor.points}`}>
              <span
                className={`font-bold tabular-nums ${factor.points < 0 ? "text-clay" : "text-moss"}`}
              >
                {factor.points > 0 ? "+" : ""}
                {factor.points}
              </span>
              <span>
                <strong>{factor.label}</strong>
                <span className="block text-slate-600 dark:text-slate-300">
                  {factor.detail}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}

export function ViolationsCard({ report }: { report: BuildingReport }) {
  const violations = report.hpd.violations;
  return (
    <section className="card">
      <div className="flex items-start justify-between">
        <div>
          <h2>HPD violations</h2>
          <p className="subtle mt-1">Housing maintenance code records</p>
        </div>
        <p className="text-right">
          <span className="label">Open</span>
          <span className="metric block">{violations.open}</span>
        </p>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <Metric label="Class A" value={violations.classA} />
        <Metric label="Class B" value={violations.classB} />
        <Metric label="Class C" value={violations.classC} severe />
      </div>
      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
        <strong>Class A</strong> — non-hazardous · <strong>Class B</strong> —
        hazardous · <strong>Class C</strong> — immediately hazardous
      </p>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <caption className="sr-only">Latest HPD violations</caption>
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700">
            <tr>
              <th className="pb-2">Date</th>
              <th className="pb-2">Class</th>
              <th className="pb-2">Description</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {violations.latest.map((item) => (
              <tr
                className="border-b border-slate-100 align-top dark:border-slate-800"
                key={item.id}
              >
                <td className="py-3 whitespace-nowrap">
                  {formatDate(item.date)}
                </td>
                <td
                  className={`py-3 font-bold ${item.class === "C" ? "text-clay" : ""}`}
                >
                  {item.class}
                </td>
                <td className="py-3 pr-4">{item.description}</td>
                <td className="py-3">{item.status ?? "Not provided"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!violations.latest.length && (
          <p className="subtle py-4">
            No records found. This is not evidence that no housing-condition
            problem exists.
          </p>
        )}
      </div>
      <a
        className="mt-4 inline-block text-sm font-semibold text-civic"
        href={source(report, "hpd-violations").datasetUrl}
        target="_blank"
        rel="noreferrer"
      >
        View all violations ↗
      </a>
      <SourceNote source={source(report, "hpd-violations")} />
    </section>
  );
}

export function ComplaintsCard({ report }: { report: BuildingReport }) {
  const complaints = report.hpd.complaints;
  const trendText =
    complaints.trend === "increased"
      ? "Heat / hot-water reports increased compared with the previous 12 months."
      : complaints.trend === "decreased"
        ? "Heat / hot-water reports decreased compared with the previous 12 months."
        : complaints.trend === "steady"
          ? "Heat / hot-water reports were broadly steady across the two 12-month windows."
          : "Too few heat / hot-water records for a reliable year-over-year comparison.";
  return (
    <section className="card">
      <h2>HPD complaints & problems</h2>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Metric label="12 months" value={complaints.last12Months} />
        <Metric label="24 months" value={complaints.last24Months} />
        <Metric label="5 years" value={complaints.last5Years} />
      </div>
      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
        {trendText}
      </p>
      <LineChart
        data={complaints.monthly}
        label="Monthly HPD complaints and problems"
      />
      <BarList
        label="HPD problem categories in the past five years"
        items={complaints.categories.map((item) => ({
          label: item.category,
          count: item.count,
        }))}
      />
      <SourceNote source={source(report, "hpd-complaints")} />
    </section>
  );
}

export function BedbugsCard({ report }: { report: BuildingReport }) {
  const bedbugs = report.bedbugs;
  return (
    <section className="card">
      <h2>Bedbug reporting</h2>
      <p className="subtle mt-2">
        These filings are property-owner self-reports where applicable, not
        independent inspection findings.
      </p>
      {bedbugs.latest ? (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric
              label={`${bedbugs.latest.year} dwelling units`}
              value={bedbugs.latest.dwellingUnits}
            />
            <Metric label="Infested" value={bedbugs.latest.infested} />
            <Metric label="Eradicated" value={bedbugs.latest.eradicated} />
            <Metric label="Re-infested" value={bedbugs.latest.reinfested} />
          </div>
          <BarList
            label="Annual self-reported infested dwelling units"
            items={bedbugs.annual.map((item) => ({
              label: String(item.year),
              count: item.infested,
            }))}
          />
        </>
      ) : (
        <NoRecords source={source(report, "bedbugs")} />
      )}
      <SourceNote source={source(report, "bedbugs")} />
    </section>
  );
}

export function RodentsCard({ report }: { report: BuildingReport }) {
  const rodents = report.rodents;
  return (
    <section className="card">
      <h2>Rodent inspections</h2>
      {rodents.records.length ? (
        <div className="mt-4 space-y-3">
          {rodents.records.slice(0, 6).map((record, index) => (
            <div
              className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800"
              key={`${record.date}-${index}`}
            >
              <div className="flex justify-between gap-3">
                <strong>{formatDate(record.date)}</strong>
                <span>{record.type}</span>
              </div>
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                {record.result ?? "Result not provided"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <NoRecords source={source(report, "rodents")} />
      )}
      <SourceNote source={source(report, "rodents")} />
    </section>
  );
}

export function DobCard({ report }: { report: BuildingReport }) {
  const dob = report.dob;
  return (
    <section className="card">
      <div className="flex justify-between gap-4">
        <div>
          <h2>DOB complaint activity</h2>
          <p className="subtle mt-1">
            Construction and building-code complaint records
          </p>
        </div>
        <p className="metric">{dob.count}</p>
      </div>
      {dob.recentCount >= 3 && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
          {dob.recentCount} records were entered in the last year. This signals
          recent activity, not a finding about danger.
        </p>
      )}
      {dob.records.length ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700">
              <tr>
                <th className="pb-2">Date</th>
                <th className="pb-2">Category</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Disposition</th>
              </tr>
            </thead>
            <tbody>
              {dob.records.map((record, index) => (
                <tr
                  className="border-b border-slate-100 dark:border-slate-800"
                  key={`${record.date}-${index}`}
                >
                  <td className="py-2">{formatDate(record.date)}</td>
                  <td className="py-2">{record.category ?? "Not provided"}</td>
                  <td className="py-2">{record.status ?? "Not provided"}</td>
                  <td className="py-2">
                    {record.disposition ?? "Not provided"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <NoRecords source={source(report, "dob")} />
      )}
      <SourceNote source={source(report, "dob")} />
    </section>
  );
}

export function EvictionsCard({ report }: { report: BuildingReport }) {
  const evictions = report.evictions;
  return (
    <section className="card">
      <h2>Executed residential evictions</h2>
      <p className="mt-3 font-serif text-4xl font-semibold">
        {evictions.count}
      </p>
      <p className="subtle mt-1">
        Recorded since 2017 when the public data supported a BBL match. A count
        alone does not establish landlord misconduct or identify tenants.
      </p>
      <BarList
        label="Executed residential evictions by year"
        items={evictions.yearly.map((item) => ({
          label: String(item.year),
          count: item.count,
        }))}
      />
      <SourceNote source={source(report, "evictions")} />
    </section>
  );
}

export function NeighborhoodCard({ report }: { report: BuildingReport }) {
  const neighborhood = report.neighborhood311;
  return (
    <section className="card lg:col-span-2">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h2>Nearby 311 profile</h2>
          <p className="subtle mt-1">
            Reported incidents within {neighborhood.radius} m in the last 12
            months. 311 measures reporting activity, not actual conditions.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm dark:bg-slate-800">
          Default radius · {neighborhood.radius} m
        </span>
      </div>
      <div className="mt-5 grid gap-7 md:grid-cols-2">
        <div>
          <p className="label">Last 30 days</p>
          <BarList
            label="311 records by category in the last 30 days"
            items={neighborhood.last30Days.map((item) => ({
              label: item.category,
              count: item.count,
            }))}
          />
        </div>
        <div>
          <p className="label">Reported noise by time of day</p>
          <BarList
            label="Noise reports by time band"
            items={neighborhood.noiseByTime.map((item) => ({
              label: item.band,
              count: item.count,
            }))}
          />
          {neighborhood.noiseInsight && (
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              {neighborhood.noiseInsight}
            </p>
          )}
        </div>
      </div>
      <div className="mt-7">
        <p className="label">Monthly reports</p>
        <LineChart
          data={neighborhood.monthly}
          label="Monthly 311 reports within the selected radius"
        />
      </div>
      {neighborhood.referenceNoiseMonthly !== undefined && (
        <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          Nearby-relative context: the outer part of a 500 m reference area
          averaged {neighborhood.referenceNoiseMonthly.toFixed(1)} reported
          noise incidents per month after a simple area adjustment. This is 311
          reporting activity, not a direct noise measurement.
        </p>
      )}
      <SourceNote source={source(report, "311")} />
    </section>
  );
}

export function FindingsCard({
  title,
  findings,
}: {
  title: string;
  findings: BuildingReport["redFlags"];
}) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {findings.length ? (
        <ul className="mt-4 space-y-4">
          {findings.map((finding) => (
            <li key={finding.title}>
              <p className="font-semibold">{finding.title}</p>
              <p className="subtle mt-1">{finding.detail}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="subtle mt-4">
          No additional data-supported signals to highlight from the sources
          currently available.
        </p>
      )}
    </section>
  );
}

function Metric({
  label,
  value,
  severe = false,
}: {
  label: string;
  value: number;
  severe?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-3 ${severe && value > 0 ? "bg-clay/10 text-clay" : "bg-slate-50 dark:bg-slate-800"}`}
    >
      <p className="label">{label}</p>
      <p className="mt-1 font-serif text-2xl font-semibold tabular-nums">
        {number.format(value)}
      </p>
    </div>
  );
}
function NoRecords({ source }: { source: DataSourceStatus }) {
  return (
    <p className="subtle mt-4">
      {source.status === "unavailable"
        ? "Records could not be retrieved because this source is unavailable."
        : "No records found. This is not evidence that no problem exists."}
    </p>
  );
}
