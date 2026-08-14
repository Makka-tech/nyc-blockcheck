import type { DataSourceStatus } from "@/lib/types";

export function SourceNote({ source }: { source: DataSourceStatus }) {
  return (
    <div
      className={`mt-5 border-t pt-3 text-xs leading-5 ${source.status === "unavailable" ? "border-clay/30 text-clay" : "border-slate-100 text-slate-500 dark:border-slate-800"}`}
    >
      <span className="font-semibold">
        {source.status === "unavailable" ? "Source unavailable" : "Source"}:
      </span>{" "}
      <a href={source.datasetUrl} target="_blank" rel="noreferrer">
        {source.name} ↗
      </a>
      {source.status === "available" ? (
        <span>
          {" "}
          · checked{" "}
          {new Date(source.fetchedAt).toLocaleString("en-US", {
            timeZone: "America/New_York",
          })}
        </span>
      ) : (
        <span> · {source.message ?? "Could not retrieve records."}</span>
      )}
    </div>
  );
}
