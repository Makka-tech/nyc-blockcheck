import type { Metadata } from "next";
import Link from "next/link";
import { HEALTH_SCORING } from "@/lib/scoring/building-health";

export const metadata: Metadata = { title: "Methodology" };
const datasets = [
  [
    "NYC Planning GeoSearch",
    "Address selection and coordinates",
    "https://geosearch.planninglabs.nyc/",
  ],
  [
    "PLUTO",
    "Property and land-use attributes",
    "https://data.cityofnewyork.us/d/64uk-42ks",
  ],
  [
    "HPD Housing Maintenance Code Violations",
    "Violation history and severity",
    "https://data.cityofnewyork.us/d/wvxf-dwi5",
  ],
  [
    "HPD Housing Maintenance Code Complaints and Problems",
    "Housing-condition problems reported to HPD",
    "https://data.cityofnewyork.us/d/ygpa-z7cr",
  ],
  [
    "Bedbug Reporting",
    "Property-owner bedbug filings",
    "https://data.cityofnewyork.us/d/wz6d-d3jb",
  ],
  [
    "Rodent Inspection",
    "Inspection records and result text",
    "https://data.cityofnewyork.us/d/p937-wjvj",
  ],
  [
    "DOB Complaints Received",
    "DOB complaint activity",
    "https://data.cityofnewyork.us/d/eabe-havv",
  ],
  [
    "Evictions",
    "Executed residential evictions when BBL matches",
    "https://data.cityofnewyork.us/d/6z8x-wfk4",
  ],
  [
    "311 Service Requests",
    "Nearby service-request reporting activity",
    "https://data.cityofnewyork.us/d/erm2-nwe9",
  ],
];
export default function MethodologyPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <Link href="/" className="focus-ring text-sm text-civic">
        ← Search addresses
      </Link>
      <h1 className="mt-5 font-serif text-5xl font-semibold tracking-tight">
        Methodology & limitations
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
        NYC BlockCheck combines public records for a selected address. It is
        designed to make the records legible—not to make a claim that a building
        or block is safe, unsafe, good, or bad.
      </p>
      <Section title="Data sources">
        {datasets.map(([name, use, href]) => (
          <div
            className="border-b border-slate-200 py-4 last:border-0 dark:border-slate-800"
            key={name}
          >
            <a
              className="font-semibold text-civic"
              href={href}
              target="_blank"
              rel="noreferrer"
            >
              {name} ↗
            </a>
            <p className="mt-1 text-slate-600 dark:text-slate-300">{use}</p>
          </div>
        ))}
      </Section>
      <Section title="Matching and queries">
        <p>
          GeoSearch supplies a normalized address, coordinates, and, where
          available, a Borough-Block-Lot (BBL) or Building Identification Number
          (BIN). Building-level datasets are queried by BBL when available;
          otherwise the application attempts an exact house-number and street
          match. DOB uses BIN where available. Evictions are shown only where a
          BBL match supports a reasonable building-level association.
        </p>
        <p className="mt-3">
          The application requests only fields used in the interface and uses
          Socrata server-side filters. 311 uses Socrata’s geographic
          `within_circle` filter centered on the selected coordinates; the
          report defaults to 250 m and computes a limited 500 m outer-area
          comparison for noise-report context.
        </p>
      </Section>
      <Section title="Experimental Building Health Indicator">
        <p>
          Starts at 100 and applies the visible, deterministic deductions below.
          It draws only on selected building-level condition records and never
          uses demographics, protected characteristics, crime data, or an LLM.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>
            Open Class C HPD violations: {HEALTH_SCORING.classC.pointsEach}{" "}
            points each, maximum {HEALTH_SCORING.classC.maximum}.
          </li>
          <li>
            Open Class B HPD violations: {HEALTH_SCORING.classB.pointsEach}{" "}
            points each, maximum {HEALTH_SCORING.classB.maximum}.
          </li>
          <li>
            Persistent open violations: {HEALTH_SCORING.unresolved.pointsEach}{" "}
            point per {HEALTH_SCORING.unresolved.perViolations}, maximum{" "}
            {HEALTH_SCORING.unresolved.maximum}.
          </li>
          <li>
            Heat / hot-water reports: {HEALTH_SCORING.heatHotWater.pointsEach}{" "}
            point per {HEALTH_SCORING.heatHotWater.perComplaints} in the last 12
            months, maximum {HEALTH_SCORING.heatHotWater.maximum}.
          </li>
          <li>
            Latest bedbug filing: {HEALTH_SCORING.bedbug.pointsEach} points per
            self-reported infested unit, maximum {HEALTH_SCORING.bedbug.maximum}
            .
          </li>
          <li>
            Recent rodent record that reports active rat signs:{" "}
            {HEALTH_SCORING.activeRatSigns} points.
          </li>
        </ul>
      </Section>
      <Section title="Important limitations">
        <ul className="list-disc space-y-3 pl-5">
          <li>
            “No records found” does not mean that no condition, complaint, or
            event exists.
          </li>
          <li>
            Complaint data measures reports made to government agencies.
            Reporting behavior varies and is not a direct measurement of housing
            quality, noise, or neighborhood conditions.
          </li>
          <li>
            Data can be incomplete, delayed, corrected, or have address-matching
            errors. Always open original records and verify current conditions
            in person.
          </li>
          <li>
            Bedbug filings are property-owner self-reports where applicable.
            Eviction counts do not establish landlord misconduct and never
            expose tenant names.
          </li>
          <li>
            Data is cached for up to 30 minutes to reduce load on public
            services; individual source status is shown in every relevant card.
          </li>
        </ul>
      </Section>
      <Section title="Privacy">
        <p>
          NYC BlockCheck has no accounts, analytics, trackers, or address
          database. Searches are sent to NYC Planning and report data is
          requested server-side from NYC Open Data. Normal hosting and
          public-service request logs may still exist outside the application’s
          control.
        </p>
      </Section>
    </main>
  );
}
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <h2 className="font-serif text-3xl font-semibold tracking-tight">
        {title}
      </h2>
      <div className="mt-4 leading-7 text-slate-700 dark:text-slate-200">
        {children}
      </div>
    </section>
  );
}
