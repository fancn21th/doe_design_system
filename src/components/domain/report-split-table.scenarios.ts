import { reportSplitTableFixture } from "@/components/domain/report.fixtures"
import type { ReportSplitTableInput } from "@/schemas/domain-component-inputs"

type ReportSplitTableScenario = { name: string; input: ReportSplitTableInput }

const rows = reportSplitTableFixture.rows ?? []
const stepOptions = reportSplitTableFixture.stepOptions ?? []

export const reportSplitTableScenarios = {
  // Synthetic presentation scenario, not a production snapshot.
  namedSnapshot: {
    name: "named-snapshot",
    input: {
      rows: rows.slice(0, 3).map((row, index) => ({ ...row,
        waferId: `SYNTHETIC_${String(index + 1).padStart(2, "0")}`,
        displayWaferId: `W${String(index + 1).padStart(2, "0")}`,
        stageId: "SYNTHETIC_STAGE", stepId: "SYNTHETIC_STEP", stepSequence: 1,
        stepKey: "SYNTHETIC_STAGE|SYNTHETIC_STEP|1", stage: "Example Stage", step: "Example Step",
        roleLabel: index === 0 ? "BSL" : `split-${index}`, isBaseline: index === 0,
      })),
    },
  },
  normal: {
    name: "normal",
    input: reportSplitTableFixture,
  },
  baselineAfterSplits: {
    name: "baseline-after-splits",
    input: {
      ...reportSplitTableFixture,
      rows:
        rows.length >= 3
          ? [rows[1], rows[2], rows[0], ...rows.slice(3)]
          : rows,
    },
  },
  authoritativeStepFacets: {
    name: "authoritative-step-facets",
    input: {
      ...reportSplitTableFixture,
      stepFacets: stepOptions.map((step, index) => ({
        step,
        stepSequence: index + 1,
        sourceCount: 25,
        displayCount: rows.filter((row) => row.step === step).length,
      })),
    },
  },
  unavailableYield: {
    name: "unavailable-yield",
    input: {
      ...reportSplitTableFixture,
      rows: rows.map((row, index) => index === 0
        ? { ...row, yield: null, tone: "neutral" as const }
        : row),
    },
  },
  empty: { name: "empty", input: { rows: [] } },
} satisfies Record<string, ReportSplitTableScenario>
