import { describe, expect, it } from "vitest";
import { calculateBuildingHealth } from "./building-health";

const complaints = {
  last12Months: 0,
  last24Months: 0,
  last5Years: 0,
  categories: [],
  monthly: [],
  heatHotWater12Months: 6,
  heatHotWaterPrevious12Months: 0,
  trend: "steady" as const,
};

describe("calculateBuildingHealth", () => {
  it("applies transparent capped deductions", () => {
    const result = calculateBuildingHealth(
      {
        total: 20,
        open: 20,
        classA: 0,
        classB: 12,
        classC: 6,
        last12Months: 0,
        last36Months: 0,
        monthly: [],
        latest: [],
      },
      complaints,
      {
        reports: 1,
        latest: {
          year: 2026,
          dwellingUnits: 10,
          infested: 9,
          eradicated: 0,
          reinfested: 0,
        },
        annual: [],
      },
      { records: [], activeRatSignsRecent: true },
    );
    expect(result.score).toBe(36);
    expect(result.factors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Open Class C violations",
          points: -30,
        }),
        expect.objectContaining({ label: "Recent bedbug filings", points: -8 }),
      ]),
    );
  });

  it("does not infer a deduction from absent records", () => {
    const result = calculateBuildingHealth(
      {
        total: 0,
        open: 0,
        classA: 0,
        classB: 0,
        classC: 0,
        last12Months: 0,
        last36Months: 0,
        monthly: [],
        latest: [],
      },
      { ...complaints, heatHotWater12Months: 0 },
      { reports: 0, annual: [] },
      { records: [], activeRatSignsRecent: null },
    );
    expect(result.score).toBe(100);
    expect(result.factors[0]?.points).toBe(0);
  });
});
