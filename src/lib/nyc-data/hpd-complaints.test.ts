import { describe, expect, it } from "vitest";
import { classifyComplaint, summarizeComplaints } from "./hpd-complaints";

describe("HPD complaint summaries", () => {
  it("groups categories and detects an increase deterministically", () => {
    const now = new Date("2026-08-13T00:00:00Z");
    const result = summarizeComplaints(
      [
        { date: "2026-07-01", text: "Heat hot water" },
        { date: "2026-06-01", text: "hot water" },
        { date: "2026-05-01", text: "HEAT" },
        { date: "2025-07-01", text: "heat" },
        { date: "2026-01-01", text: "mold" },
      ],
      now,
    );
    expect(result.heatHotWater12Months).toBe(3);
    expect(result.trend).toBe("increased");
    expect(result.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ category: "Heat / hot water", count: 4 }),
      ]),
    );
  });
  it("maps common text consistently", () => {
    expect(classifyComplaint("Broken electrical outlet")).toBe("Electricity");
    expect(classifyComplaint("insects and roaches")).toBe("Pests");
  });
});
