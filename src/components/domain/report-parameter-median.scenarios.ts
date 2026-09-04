import { reportParameterMedianFixture } from "@/components/domain/report.fixtures"
import type { ReportParameterMedianInput } from "@/schemas/domain-component-inputs"

type ReportParameterMedianScenario = {
  name: string
  input: ReportParameterMedianInput
}

export const reportParameterMedianScenarios = {
  normal: { name: "normal", input: reportParameterMedianFixture },
  empty: { name: "empty", input: { rows: [] } },
} satisfies Record<string, ReportParameterMedianScenario>
