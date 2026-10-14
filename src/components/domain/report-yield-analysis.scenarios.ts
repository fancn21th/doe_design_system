import { reportWaferYieldDynamicFixture } from "@/components/domain/report-wafer-yield-cp-fail.fixtures"
import {
  reportWaferYieldCpFailFixture,
  reportYieldAnalysisComparisonFixture,
} from "@/components/domain/report.fixtures"
import type { ReportYieldAnalysisInput } from "@/schemas/domain-component-inputs"

type ReportYieldAnalysisScenario = { name: string; input: ReportYieldAnalysisInput }

export const reportYieldAnalysisScenarios = {
  normal: {
    name: "normal",
    input: {
      ...reportYieldAnalysisComparisonFixture,
      yieldCpFailAnalysis: reportWaferYieldCpFailFixture,
    },
  },
  dense: {
    name: "dense",
    input: {
      ...reportYieldAnalysisComparisonFixture,
      yieldCpFailAnalysis: reportWaferYieldCpFailFixture,
    },
  },
  dynamic: { name: "dynamic", input: { yieldCpFailAnalysis: reportWaferYieldDynamicFixture } },
  empty: { name: "empty", input: { wafers: [] } },
} satisfies Record<string, ReportYieldAnalysisScenario>
