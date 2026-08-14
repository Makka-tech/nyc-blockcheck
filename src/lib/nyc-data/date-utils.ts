import type { MonthlyCount } from "@/lib/types";

export function parseDate(value?: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function daysAgo(days: number, now = new Date()) {
  const date = new Date(now);
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

export function isSince(value: string | undefined, date: Date) {
  const parsed = parseDate(value);
  return Boolean(parsed && parsed >= date);
}

export function monthlySeries(
  values: (string | undefined)[],
  months = 12,
  now = new Date(),
): MonthlyCount[] {
  const starts: Date[] = [];
  for (let index = months - 1; index >= 0; index -= 1)
    starts.push(
      new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - index, 1)),
    );
  const counts = new Map(
    starts.map((start) => [start.toISOString().slice(0, 7), 0]),
  );
  for (const value of values) {
    const date = parseDate(value);
    if (!date) continue;
    const key = date.toISOString().slice(0, 7);
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts].map(([month, count]) => ({ month, count }));
}

export function byYear(values: (string | undefined)[]) {
  const counts = new Map<number, number>();
  for (const value of values) {
    const date = parseDate(value);
    if (date)
      counts.set(
        date.getUTCFullYear(),
        (counts.get(date.getUTCFullYear()) ?? 0) + 1,
      );
  }
  return [...counts]
    .sort(([a], [b]) => a - b)
    .map(([year, count]) => ({ year, count }));
}
