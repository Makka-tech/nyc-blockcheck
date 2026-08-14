import type {
  BedbugSummary,
  ComplaintSummary,
  HealthIndicator,
  RodentSummary,
  ScoreFactor,
  ViolationSummary,
} from "@/lib/types";

export const HEALTH_SCORING = {
  classC: { pointsEach: 6, maximum: 30 },
  classB: { pointsEach: 2, maximum: 20 },
  unresolved: { perViolations: 10, pointsEach: 1, maximum: 10 },
  heatHotWater: { perComplaints: 3, pointsEach: 1, maximum: 12 },
  bedbug: { pointsEach: 2, maximum: 8 },
  activeRatSigns: 2,
} as const;

function deduction(
  label: string,
  points: number,
  detail: string,
): ScoreFactor | undefined {
  return points > 0 ? { label, points: -points, detail } : undefined;
}

export function calculateBuildingHealth(
  violations: ViolationSummary,
  complaints: ComplaintSummary,
  bedbugs: BedbugSummary,
  rodents: RodentSummary,
): HealthIndicator {
  const factors = [
    deduction(
      "Open Class C violations",
      Math.min(
        violations.classC * HEALTH_SCORING.classC.pointsEach,
        HEALTH_SCORING.classC.maximum,
      ),
      `${violations.classC} open Class C violation${violations.classC === 1 ? "" : "s"}`,
    ),
    deduction(
      "Open Class B violations",
      Math.min(
        violations.classB * HEALTH_SCORING.classB.pointsEach,
        HEALTH_SCORING.classB.maximum,
      ),
      `${violations.classB} open Class B violation${violations.classB === 1 ? "" : "s"}`,
    ),
    deduction(
      "Persistent unresolved violations",
      Math.min(
        Math.floor(violations.open / HEALTH_SCORING.unresolved.perViolations) *
          HEALTH_SCORING.unresolved.pointsEach,
        HEALTH_SCORING.unresolved.maximum,
      ),
      `${violations.open} open violation${violations.open === 1 ? "" : "s"}`,
    ),
    deduction(
      "Recent heat / hot-water complaints",
      Math.min(
        Math.floor(
          complaints.heatHotWater12Months /
            HEALTH_SCORING.heatHotWater.perComplaints,
        ) * HEALTH_SCORING.heatHotWater.pointsEach,
        HEALTH_SCORING.heatHotWater.maximum,
      ),
      `${complaints.heatHotWater12Months} report${complaints.heatHotWater12Months === 1 ? "" : "s"} in the last 12 months`,
    ),
    deduction(
      "Recent bedbug filings",
      Math.min(
        (bedbugs.latest?.infested ?? 0) * HEALTH_SCORING.bedbug.pointsEach,
        HEALTH_SCORING.bedbug.maximum,
      ),
      `${bedbugs.latest?.infested ?? 0} self-reported infested unit${bedbugs.latest?.infested === 1 ? "" : "s"} in the latest filing`,
    ),
    rodents.activeRatSignsRecent === true
      ? {
          label: "Recent rodent inspection",
          points: -HEALTH_SCORING.activeRatSigns,
          detail: "A recent record reported active rat signs",
        }
      : undefined,
  ].filter((factor): factor is ScoreFactor => Boolean(factor));
  const score = Math.max(
    0,
    100 + factors.reduce((sum, factor) => sum + factor.points, 0),
  );
  return {
    score,
    factors: factors.length
      ? factors
      : [
          {
            label: "No deductions from available inputs",
            points: 0,
            detail:
              "This experimental indicator only reflects the records available to it.",
          },
        ],
  };
}
