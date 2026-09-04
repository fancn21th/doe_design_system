import { reportYieldAnalysisFixture } from "@/components/domain/report.fixtures"
import type { ReportYieldAnalysisInput } from "@/schemas/domain-component-inputs"

type ReportYieldAnalysisScenario = { name: string; input: ReportYieldAnalysisInput }

export const reportYieldAnalysisScenarios = {
  normal: { name: "normal", input: reportYieldAnalysisFixture },
  empty: { name: "empty", input: { wafers: [] } },
} satisfies Record<string, ReportYieldAnalysisScenario>
