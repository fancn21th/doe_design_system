import { measurementEmptyFixture } from "@/components/domain/measurement.fixtures"
import { reportCpDataFixture } from "@/components/domain/report.fixtures"
import type { ReportCpDataInput } from "@/schemas/domain-component-inputs"

type ReportCpDataScenario = { name: string; input: ReportCpDataInput }

export const reportCpDataScenarios = {
  normal: { name: "normal", input: reportCpDataFixture },
  empty: { name: "empty", input: { parameterOptions: [], measurement: measurementEmptyFixture } },
} satisfies Record<string, ReportCpDataScenario>
