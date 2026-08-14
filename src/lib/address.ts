import type { AddressResult } from "@/lib/types";

const keys = [
  "label",
  "houseNumber",
  "street",
  "borough",
  "postcode",
  "latitude",
  "longitude",
  "bbl",
  "bin",
] as const;

export function addressUrl(address: AddressResult) {
  const params = new URLSearchParams();
  for (const key of keys) {
    const value = address[key];
    if (value !== undefined) params.set(key, String(value));
  }
  return `/address/${encodeURIComponent(
    address.label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
  )}?${params.toString()}`;
}

export function parseAddressParams(
  params: Record<string, string | string[] | undefined>,
): AddressResult | null {
  const label = single(params.label);
  const latitude = Number(single(params.latitude));
  const longitude = Number(single(params.longitude));
  if (!label || !Number.isFinite(latitude) || !Number.isFinite(longitude))
    return null;
  return {
    label,
    latitude,
    longitude,
    houseNumber: single(params.houseNumber),
    street: single(params.street),
    borough: single(params.borough),
    postcode: single(params.postcode),
    bbl: single(params.bbl),
    bin: single(params.bin),
  };
}

export function comparisonUrl(addresses: AddressResult[]) {
  return `/compare?${new URLSearchParams({ addresses: JSON.stringify(addresses.slice(0, 3)) }).toString()}`;
}

export function parseComparison(
  value: string | string[] | undefined,
): AddressResult[] {
  const raw = single(value);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) =>
        parseAddressParams(
          item as Record<string, string | string[] | undefined>,
        ),
      )
      .filter((item): item is AddressResult => Boolean(item))
      .slice(0, 3);
  } catch {
    return [];
  }
}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
