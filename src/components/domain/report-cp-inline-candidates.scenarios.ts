import {
  reportCpInlineCandidatesEmptyFixture,
  reportCpInlineCandidatesFixture,
} from "@/components/domain/report-cp-inline-candidates.fixtures"
import type { ReportCpInlineCandidatesInput } from "@/schemas/domain-component-inputs"

type Scenario = { name: string; input: ReportCpInlineCandidatesInput }

export const reportCpInlineCandidatesScenarios = {
  normal: { name: "normal", input: reportCpInlineCandidatesFixture },
  empty: { name: "empty", input: reportCpInlineCandidatesEmptyFixture },
} satisfies Record<string, Scenario>
