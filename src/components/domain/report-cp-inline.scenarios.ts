import { reportCpInlineFixture } from "@/components/domain/report.fixtures"
import type { ReportCpInlineInput } from "@/schemas/domain-component-inputs"

type ReportCpInlineScenario = { name: string; input: ReportCpInlineInput }

export const reportCpInlineScenarios = {
  normal: { name: "normal", input: reportCpInlineFixture },
  empty: { name: "empty", input: { rows: [] } },
} satisfies Record<string, ReportCpInlineScenario>
