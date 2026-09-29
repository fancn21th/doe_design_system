import { reportSplitTableFixture } from "@/components/domain/report.fixtures"
import type { ReportSplitTableInput } from "@/schemas/domain-component-inputs"

type ReportSplitTableScenario = { name: string; input: ReportSplitTableInput }

const rows = reportSplitTableFixture.rows ?? []
const stepOptions = reportSplitTableFixture.stepOptions ?? []

export const reportSplitTableScenarios = {
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
