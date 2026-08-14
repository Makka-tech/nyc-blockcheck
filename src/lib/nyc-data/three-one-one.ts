import type { AddressResult, Neighborhood311Summary } from "@/lib/types";
import { daysAgo, monthlySeries } from "./date-utils";
import { DATASETS, querySocrata, value } from "./socrata";

type Incident = { date?: string; type: string; descriptor: string };
const EMPTY = (radius: number): Neighborhood311Summary => ({
  radius,
  last30Days: [],
  monthly: monthlySeries([], 12),
  noiseByTime: [
    { band: "00–06", count: 0 },
    { band: "06–12", count: 0 },
    { band: "12–18", count: 0 },
    { band: "18–24", count: 0 },
  ],
});

export function group311Category(type: string, descriptor = "") {
  const text = `${type} ${descriptor}`.toLowerCase();
  if (text.includes("noise")) return "Noise";
  if (
    text.includes("sanitation") ||
    text.includes("dirty") ||
    text.includes("litter") ||
    text.includes("waste")
  )
    return "Sanitation";
  if (text.includes("parking")) return "Illegal parking";
  if (
    text.includes("street condition") ||
    text.includes("pothole") ||
    text.includes("sidewalk")
  )
    return "Street conditions";
  if (text.includes("rodent") || text.includes("rat")) return "Rodents";
  if (
    text.includes("construction") ||
    text.includes("building") ||
    text.includes("dob")
  )
    return "Construction-related";
  if (text.includes("heat") || text.includes("hot water"))
    return "Heat / hot water";
  return "Other";
}

function timeBand(date?: string) {
  const parsed = date ? new Date(date) : undefined;
  if (!parsed || Number.isNaN(parsed.getTime())) return undefined;
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      hourCycle: "h23",
      timeZone: "America/New_York",
    }).format(parsed),
  );
  return hour < 6
    ? "00–06"
    : hour < 12
      ? "06–12"
      : hour < 18
        ? "12–18"
        : "18–24";
}

export function summarize311(
  incidents: Incident[],
  radius: number,
  now = new Date(),
): Neighborhood311Summary {
  const relevant = incidents.map((incident) => ({
    ...incident,
    category: group311Category(incident.type, incident.descriptor),
  }));
  const recent = relevant.filter((incident) => {
    const date = incident.date ? new Date(incident.date) : undefined;
    return Boolean(date && date >= daysAgo(30, now));
  });
  const last30Days = [...new Set(recent.map((incident) => incident.category))]
    .map((category) => ({
      category,
      count: recent.filter((incident) => incident.category === category).length,
    }))
    .sort((a, b) => b.count - a.count);
  const noise = relevant.filter((incident) => incident.category === "Noise");
  const noiseByTime = ["00–06", "06–12", "12–18", "18–24"].map((band) => ({
    band,
    count: noise.filter((incident) => timeBand(incident.date) === band).length,
  }));
  const totalNoise = noiseByTime.reduce((sum, item) => sum + item.count, 0);
  const peak = [...noiseByTime].sort((a, b) => b.count - a.count)[0];
  return {
    radius,
    last30Days,
    monthly: monthlySeries(
      relevant.map((incident) => incident.date),
      12,
      now,
    ),
    noiseByTime,
    noiseInsight:
      peak && totalNoise >= 5 && peak.count / totalNoise >= 0.4
        ? `${Math.round((peak.count / totalNoise) * 100)}% of reported noise incidents fall between ${peak.band}.`
        : undefined,
  };
}

async function queryRadius(address: AddressResult, radius: number) {
  const where = `created_date >= '${daysAgo(365).toISOString()}' AND within_circle(location, ${address.latitude}, ${address.longitude}, ${radius})`;
  const rows = await querySocrata(DATASETS.threeOneOne.id, {
    $select: "created_date,complaint_type,descriptor",
    $where: where,
    $limit: "50000",
  });
  return rows.map((row) => ({
    date: value(row, "created_date"),
    type: value(row, "complaint_type") ?? "",
    descriptor: value(row, "descriptor") ?? "",
  }));
}

export async function getNeighborhood311(address: AddressResult, radius = 250) {
  if (!Number.isFinite(address.latitude) || !Number.isFinite(address.longitude))
    return EMPTY(radius);
  const [selected, broad] = await Promise.all([
    queryRadius(address, radius),
    queryRadius(address, 500),
  ]);
  const summary = summarize311(selected, radius);
  const broadNoise = broad.filter(
    (incident) =>
      group311Category(incident.type, incident.descriptor) === "Noise",
  ).length;
  const selectedNoise = selected.filter(
    (incident) =>
      group311Category(incident.type, incident.descriptor) === "Noise",
  ).length;
  return {
    ...summary,
    referenceNoiseMonthly: Math.max(0, broadNoise - selectedNoise) / 3 / 12,
  };
}
