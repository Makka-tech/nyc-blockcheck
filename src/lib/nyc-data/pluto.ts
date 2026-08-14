import type { AddressResult, BuildingInfo } from "@/lib/types";
import {
  DATASETS,
  bblWhere,
  numberValue,
  querySocrata,
  value,
} from "./socrata";

export async function getPluto(
  address: AddressResult,
): Promise<BuildingInfo | null> {
  const where =
    bblWhere(
      address.bbl,
      address.houseNumber,
      address.street,
      "address",
      "address",
    ) ?? (address.bbl ? undefined : undefined);
  const fallback =
    address.houseNumber && address.street
      ? `upper(address) like '${address.houseNumber.replace(/'/g, "''").toUpperCase()} ${address.street.replace(/'/g, "''").toUpperCase()}%'`
      : undefined;
  const records = await querySocrata(DATASETS.pluto.id, {
    $select:
      "yearbuilt,unitsres,numbldgs,numfloors,landuse,bldgclass,lotarea,bldgarea,zonedist1,bbl",
    $where: address.bbl
      ? `bbl='${address.bbl.replace(/'/g, "''")}'`
      : (fallback ?? where ?? "1=0"),
    $limit: "1",
  });
  const row = records[0];
  if (!row) return null;
  return {
    yearBuilt: numberValue(row, "yearbuilt"),
    residentialUnits: numberValue(row, "unitsres"),
    buildingsOnLot: numberValue(row, "numbldgs"),
    floors: numberValue(row, "numfloors"),
    landUse: value(row, "landuse"),
    buildingClass: value(row, "bldgclass"),
    lotArea: numberValue(row, "lotarea"),
    buildingArea: numberValue(row, "bldgarea"),
    zoning: value(row, "zonedist1"),
  };
}
