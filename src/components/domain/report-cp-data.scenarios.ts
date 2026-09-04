import { reportCpDataFixture } from "@/components/domain/report.fixtures"
import type { ReportCpDataInput } from "@/schemas/domain-component-inputs"

type ReportCpDataScenario = { name: string; input: ReportCpDataInput }

export const reportCpDataScenarios = {
  normal: { name: "normal", input: reportCpDataFixture },
  empty: { name: "empty", input: { parameterOptions: [], measurement: { groups: [] } } },
} satisfies Record<string, ReportCpDataScenario>
