import { describe, expect, it } from "vitest";
import { isOpenViolation, summarizeViolations } from "./hpd-violations";

describe("HPD violation aggregation", () => {
  it("counts only open violations by severity and date window", () => {
    const now = new Date("2026-08-13T00:00:00Z");
    const summary = summarizeViolations(
      [
        {
          id: "1",
          class: "C",
          description: "x",
          status: "OPEN",
          date: "2026-07-01",
          isOpen: true,
        },
        {
          id: "2",
          class: "B",
          description: "x",
          status: "CLOSE",
          date: "2025-01-01",
          isOpen: false,
        },
        {
          id: "3",
          class: "A",
          description: "x",
          status: "OPEN",
          date: "2022-01-01",
          isOpen: true,
        },
      ],
      now,
    );
    expect(summary).toMatchObject({
      total: 3,
      open: 2,
      classA: 1,
      classB: 0,
      classC: 1,
      last12Months: 1,
      last36Months: 2,
    });
  });
  it("recognizes resolved status wording", () => {
    expect(isOpenViolation("VIOLATION DISMISSED")).toBe(false);
    expect(isOpenViolation("OPEN")).toBe(true);
  });
});
