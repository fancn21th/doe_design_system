import { reportInlineDataFixture } from "@/components/domain/report.fixtures"
import type { ReportInlineDataInput } from "@/schemas/domain-component-inputs"

type ReportInlineDataScenario = { name: string; input: ReportInlineDataInput }

export const reportInlineDataScenarios = {
  normal: { name: "normal", input: reportInlineDataFixture },
  empty: { name: "empty", input: { parameterOptions: [], measurement: { groups: [] } } },
} satisfies Record<string, ReportInlineDataScenario>
