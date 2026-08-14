import { month } from "@/lib/format";
import type { MonthlyCount } from "@/lib/types";

export function LineChart({
  data,
  label,
}: {
  data: MonthlyCount[];
  label: string;
}) {
  const max = Math.max(1, ...data.map((item) => item.count));
  const width = 640;
  const height = 150;
  const points = data
    .map(
      (item, index) =>
        `${data.length <= 1 ? width / 2 : (index / (data.length - 1)) * width},${height - 12 - (item.count / max) * (height - 28)}`,
    )
    .join(" ");
  const total = data.reduce((sum, item) => sum + item.count, 0);
  return (
    <figure className="mt-4">
      <svg
        className="h-36 w-full overflow-visible"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${label}. ${total} records across ${data.length} months; highest monthly count is ${max}.`}
      >
        <line
          x1="0"
          x2={width}
          y1={height - 12}
          y2={height - 12}
          className="stroke-slate-200 dark:stroke-slate-700"
        />
        <polyline
          fill="none"
          points={points}
          className="stroke-civic"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((item, index) => (
          <circle
            key={item.month}
            cx={
              data.length <= 1 ? width / 2 : (index / (data.length - 1)) * width
            }
            cy={height - 12 - (item.count / max) * (height - 28)}
            r="3"
            className="fill-civic"
          >
            <title>
              {item.month}: {item.count}
            </title>
          </circle>
        ))}
      </svg>
      <figcaption className="flex justify-between text-xs text-slate-500">
        <span>
          {data[0]
            ? month.format(new Date(`${data[0].month}-01T00:00:00Z`))
            : ""}
        </span>
        <span>
          {data.at(-1)
            ? month.format(new Date(`${data.at(-1)?.month}-01T00:00:00Z`))
            : ""}
        </span>
      </figcaption>
    </figure>
  );
}

export function BarList({
  items,
  label,
}: {
  items: { label: string; count: number }[];
  label: string;
}) {
  const max = Math.max(1, ...items.map((item) => item.count));
  if (!items.length)
    return <p className="subtle mt-4">No records found in this time window.</p>;
  return (
    <div
      className="mt-4 space-y-3"
      role="img"
      aria-label={`${label}: ${items.map((item) => `${item.label} ${item.count}`).join(", ")}`}
    >
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex justify-between gap-4 text-sm">
            <span>{item.label}</span>
            <span className="font-medium tabular-nums">{item.count}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-civic"
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
