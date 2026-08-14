import Link from "next/link";
export default function AddressNotFound() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-24">
      <p className="label">Address report</p>
      <h1 className="mt-3 font-serif text-4xl font-semibold">
        We need a complete address selection.
      </h1>
      <p className="mt-4 text-slate-600 dark:text-slate-300">
        Return to search and choose an address from the NYC Planning results so
        the report has location coordinates.
      </p>
      <Link
        className="focus-ring mt-7 inline-block rounded-lg bg-civic px-4 py-2 text-white no-underline"
        href="/"
      >
        Search NYC addresses
      </Link>
    </main>
  );
}
