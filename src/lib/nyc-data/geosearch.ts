import { z } from "zod";
import type { AddressResult } from "@/lib/types";
import { ExternalDataError } from "./socrata";

const geoSearchResponse = z.object({
  features: z.array(
    z.object({
      geometry: z.object({ coordinates: z.tuple([z.number(), z.number()]) }),
      properties: z
        .object({
          label: z.string().optional(),
          housenumber: z.string().optional(),
          street: z.string().optional(),
          borough: z.string().optional(),
          postalcode: z.string().optional(),
          addendum: z
            .object({
              pad: z
                .object({
                  bbl: z.string().optional(),
                  bin: z.string().optional(),
                })
                .optional(),
            })
            .optional(),
        })
        .passthrough(),
    }),
  ),
});

export const GEOSEARCH_URL = "https://geosearch.planninglabs.nyc/v2/search";

export async function searchAddresses(text: string): Promise<AddressResult[]> {
  const url = new URL(GEOSEARCH_URL);
  url.searchParams.set("text", text);
  url.searchParams.set("size", "8");
  const response = await fetch(url, { next: { revalidate: 60 * 60 } });
  if (!response.ok)
    throw new ExternalDataError(
      `NYC Planning GeoSearch returned ${response.status}.`,
      response.status,
    );
  const parsed = geoSearchResponse.safeParse(await response.json());
  if (!parsed.success)
    throw new ExternalDataError(
      "NYC Planning GeoSearch returned an unexpected response.",
    );
  return parsed.data.features.map((feature) => ({
    label:
      feature.properties.label ??
      [
        feature.properties.housenumber,
        feature.properties.street,
        feature.properties.borough,
      ]
        .filter(Boolean)
        .join(" "),
    houseNumber: feature.properties.housenumber,
    street: feature.properties.street,
    borough: feature.properties.borough,
    postcode: feature.properties.postalcode,
    longitude: feature.geometry.coordinates[0],
    latitude: feature.geometry.coordinates[1],
    bbl: feature.properties.addendum?.pad?.bbl,
    bin: feature.properties.addendum?.pad?.bin,
  }));
}
