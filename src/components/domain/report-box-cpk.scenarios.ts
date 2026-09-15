import { reportBoxCpkFixture } from "@/components/domain/report-box-cpk.fixtures"
import type { ReportBoxCpkInput } from "@/schemas/domain-component-inputs"

type Scenario = { name: string; input: ReportBoxCpkInput }
export const reportBoxCpkScenarios = {
  normal: { name: "normal", input: reportBoxCpkFixture },
  pending: { name: "pending", input: { ...reportBoxCpkFixture, status: "pending" } },
  unavailable: { name: "unavailable", input: { ...reportBoxCpkFixture, status: "unavailable" } },
} satisfies Record<string, Scenario>
