import { reportSplitTableFixture } from "@/components/domain/report.fixtures"
import type { ReportSplitTableInput } from "@/schemas/domain-component-inputs"

type ReportSplitTableScenario = { name: string; input: ReportSplitTableInput }

export const reportSplitTableScenarios = {
  normal: { name: "normal", input: reportSplitTableFixture },
  empty: { name: "empty", input: { rows: [] } },
} satisfies Record<string, ReportSplitTableScenario>
