import { measurementEmptyFixture } from "@/components/domain/measurement.fixtures"
import { reportInlineDataFixture } from "@/components/domain/report.fixtures"
import type { ReportInlineDataInput } from "@/schemas/domain-component-inputs"

type ReportInlineDataScenario = { name: string; input: ReportInlineDataInput }

export const reportInlineDataScenarios = {
  normal: { name: "normal", input: reportInlineDataFixture },
  matrix: {
    name: "matrix",
    input: { ...reportInlineDataFixture, defaultViewMode: "matrix" },
  },
  empty: {
    name: "empty",
    input: {
      status: "no-data",
      defaultViewMode: "distribution",
      parameterOptions: [],
      coverage: [],
      matrix: [],
      measurement: measurementEmptyFixture,
    },
  },
} satisfies Record<string, ReportInlineDataScenario>
