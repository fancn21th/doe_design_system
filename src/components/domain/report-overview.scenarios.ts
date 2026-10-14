import { reportOverviewFixture } from "@/components/domain/report.fixtures"
import type { ReportOverviewInput } from "@/schemas/domain-component-inputs"

type ReportOverviewScenario = { name: string; input: ReportOverviewInput }

// Explicit demo/story inputs only. Production never falls back to these values.
export const reportOverviewScenarios = {
  normal: { name: "normal", input: reportOverviewFixture },
  partial: { name: "partial", input: { ...reportOverviewFixture, assessmentNote: "部分可评估：缺少源规格", sourceOosItems: [], parameterAlerts: [], sourceOosNote: "Source OOS 暂不可评估" } },
  empty: { name: "empty", input: { metrics: [] } },
} satisfies Record<string, ReportOverviewScenario>
