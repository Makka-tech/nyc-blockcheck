import { describe, expect, it } from "vitest";
import { parseAddressParams, parseComparison } from "./address";

describe("address parsing", () => {
  it("requires a label and finite coordinates", () => {
    expect(
      parseAddressParams({
        label: "10 Test St",
        latitude: "40.7",
        longitude: "-73.9",
      }),
    ).toMatchObject({ label: "10 Test St" });
    expect(
      parseAddressParams({ label: "bad", latitude: "x", longitude: "-73.9" }),
    ).toBeNull();
  });
  it("drops malformed comparison entries", () => {
    expect(
      parseComparison(
        JSON.stringify([
          { label: "valid", latitude: 40.7, longitude: -73.9 },
          { label: "bad" },
        ]),
      ),
    ).toHaveLength(1);
  });
});
