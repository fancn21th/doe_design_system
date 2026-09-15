import { measurementEmptyFixture } from "@/components/domain/measurement.fixtures"
import { reportInlineDataFixture } from "@/components/domain/report.fixtures"
import type { ReportInlineDataInput } from "@/schemas/domain-component-inputs"

type ReportInlineDataScenario = { name: string; input: ReportInlineDataInput }

export const reportInlineDataScenarios = {
  normal: { name: "normal", input: reportInlineDataFixture },
  empty: { name: "empty", input: { status: "no-data", parameterOptions: [], coverage: [], matrix: [], measurement: measurementEmptyFixture } },
} satisfies Record<string, ReportInlineDataScenario>
