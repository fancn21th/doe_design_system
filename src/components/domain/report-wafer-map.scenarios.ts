import { reportWaferMapFixture } from "@/components/domain/report.fixtures"
import type { ReportWaferMapInput } from "@/schemas/domain-component-inputs"

type ReportWaferMapScenario = { name: string; input: ReportWaferMapInput }

export const reportWaferMapScenarios = {
  normal: { name: "normal", input: reportWaferMapFixture },
  empty: { name: "empty", input: { wafers: [] } },
} satisfies Record<string, ReportWaferMapScenario>
