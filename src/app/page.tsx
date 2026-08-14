import Link from "next/link";
import { SearchBox } from "@/components/search-box";
import { addressUrl } from "@/lib/address";

const examples = [
  {
    label: "350 5 AVENUE, New York, NY, USA",
    houseNumber: "350",
    street: "5 AVENUE",
    borough: "Manhattan",
    postcode: "10118",
    latitude: 40.748441,
    longitude: -73.985656,
    bbl: "1008350041",
    bin: "1015862",
  },
  {
    label: "20 HENRY STREET, Brooklyn, NY, USA",
    houseNumber: "20",
    street: "HENRY STREET",
    borough: "Brooklyn",
    postcode: "11201",
    latitude: 40.70094,
    longitude: -73.99369,
  },
  {
    label: "1 CENTRE STREET, New York, NY, USA",
    houseNumber: "1",
    street: "CENTRE STREET",
    borough: "Manhattan",
    postcode: "10007",
    latitude: 40.71355,
    longitude: -74.00346,
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-20 md:pb-28 md:pt-28">
        <p className="label text-civic">NYC public records, connected</p>
        <h1 className="mt-5 max-w-3xl font-serif text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
          Know your building before you move in.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
          Search an NYC address for resident-relevant public records: building
          facts, housing conditions, inspections, and nearby 311
          reporting—always with sources and context.
        </p>
        <div className="mt-10 max-w-2xl">
          <SearchBox />
          <p className="mt-3 text-sm text-slate-500">
            No account. No tracking. Search results come from NYC Planning
            GeoSearch.
          </p>
        </div>
        <div className="mt-10">
          <p className="label">Try an example</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {examples.map((example) => (
              <Link
                className="focus-ring rounded-full border border-slate-300 px-3 py-2 text-sm no-underline hover:border-civic hover:text-civic dark:border-slate-700"
                key={example.label}
                href={addressUrl(example)}
              >
                {example.houseNumber} {example.street}, {example.borough}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3">
          <Feature
            number="01"
            title="Building first"
            text="HPD records and property facts are kept distinct from nearby reporting activity."
          />
          <Feature
            number="02"
            title="Show the receipts"
            text="Every section links to its original NYC government dataset and says when a source is unavailable."
          />
          <Feature
            number="03"
            title="No black box"
            text="The experimental indicator is fully deterministic, with every deduction visible."
          />
        </div>
      </section>
    </main>
  );
}

function Feature({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div>
      <p className="font-serif text-2xl text-civic">{number}</p>
      <h2 className="mt-3 font-serif text-2xl font-semibold">{title}</h2>
      <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">
        {text}
      </p>
    </div>
  );
}
