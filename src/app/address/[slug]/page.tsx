import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { parseAddressParams } from "@/lib/address";
import { getBuildingReport } from "@/lib/report";
import {
  BedbugsCard,
  BuildingOverview,
  ComplaintsCard,
  DobCard,
  EvictionsCard,
  FindingsCard,
  HealthCard,
  NeighborhoodCard,
  ReportHeader,
  RodentsCard,
  ViolationsCard,
} from "@/components/report-cards";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const address = parseAddressParams(await searchParams);
  return { title: address ? address.label : "Address report" };
}
export default async function AddressPage({ searchParams }: Props) {
  const address = parseAddressParams(await searchParams);
  if (!address) notFound();
  const report = await getBuildingReport(address);
  return (
    <main>
      <ReportHeader report={report} />
      <div className="mx-auto max-w-6xl px-5 py-8">
        <p className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          <strong>Read this as public-record context, not a verdict.</strong>{" "}
          “No records found” is different from “no problem exists”; complaint
          counts reflect reports submitted to agencies and may vary with
          reporting behavior.
        </p>
        <div className="report-grid">
          <BuildingOverview report={report} />
          <HealthCard report={report} />
          <ViolationsCard report={report} />
          <ComplaintsCard report={report} />
          <BedbugsCard report={report} />
          <RodentsCard report={report} />
          <DobCard report={report} />
          <EvictionsCard report={report} />
          <NeighborhoodCard report={report} />
          <FindingsCard
            title="Things worth checking"
            findings={report.redFlags}
          />
          <FindingsCard
            title="Positive signals"
            findings={report.positiveSignals}
          />
        </div>
      </div>
    </main>
  );
}
