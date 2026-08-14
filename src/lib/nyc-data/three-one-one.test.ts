import { describe, expect, it } from "vitest";
import { group311Category, summarize311 } from "./three-one-one";

describe("311 grouping", () => {
  it("groups quality-of-life categories without interpreting them", () => {
    expect(group311Category("Noise - Residential", "Banging")).toBe("Noise");
    expect(group311Category("Rodent", "Rat sighting")).toBe("Rodents");
  });
  it("only emits a time insight for a supported distribution", () => {
    const records = Array.from({ length: 5 }, (_, index) => ({
      date: `2026-08-0${index + 1}T06:00:00Z`,
      type: "Noise - Residential",
      descriptor: "Loud music",
    }));
    expect(
      summarize311(records, 250, new Date("2026-08-13")).noiseInsight,
    ).toContain("00–06");
  });
});
