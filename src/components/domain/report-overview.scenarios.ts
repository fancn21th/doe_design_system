import { reportOverviewFixture } from "@/components/domain/report.fixtures"
import type { ReportOverviewInput } from "@/schemas/domain-component-inputs"

type ReportOverviewScenario = { name: string; input: ReportOverviewInput }

export const reportOverviewScenarios = {
  normal: { name: "normal", input: reportOverviewFixture },
  empty: { name: "empty", input: { metrics: [] } },
} satisfies Record<string, ReportOverviewScenario>
