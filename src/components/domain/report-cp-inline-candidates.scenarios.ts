import {
  reportCpInlineCandidatesFixture, reportCpInlineCandidatesEmptyFixture,
  reportCpInlineFilteredRows, reportCpInlineInsufficientRows, reportCpInlineDenseRows,
} from "@/components/domain/report-cp-inline-candidates.fixtures"
import type { ReportCpInlineCandidatesInput } from "@/schemas/domain-component-inputs"

const mockProvenance = { classification: "mock" as const, source: "Candidate boundary and pagination scenarios" }
export const reportCpInlineCandidatesScenarios = {
  normal: { name: "normal", input: reportCpInlineCandidatesFixture },
  filtered: { name: "filtered", input: { ...reportCpInlineCandidatesFixture, filters: { ...reportCpInlineCandidatesFixture.filters, view: "filtered" }, items: reportCpInlineFilteredRows, total: reportCpInlineFilteredRows.length, pairedNOptions: [4], provenance: mockProvenance } },
  insufficient: { name: "insufficient-sample", input: { ...reportCpInlineCandidatesFixture, filters: { ...reportCpInlineCandidatesFixture.filters, view: "insufficient" }, items: reportCpInlineInsufficientRows, total: reportCpInlineInsufficientRows.length, pairedNOptions: [0, 1, 2], reasonOptions: ["INSUFFICIENT_SAMPLE"], provenance: mockProvenance } },
  dense: { name: "dense", input: { ...reportCpInlineCandidatesFixture, items: reportCpInlineDenseRows.slice(0, 10), stepOptions: ["DEMO-S01", "DEMO-S02"], cpParameterOptions: ["kelvinS"], inlineParameterOptions: [reportCpInlineDenseRows[0].inlineParameter], total: reportCpInlineDenseRows.length, provenance: mockProvenance } },
  loading: { name: "loading", input: { ...reportCpInlineCandidatesFixture, status: "loading", items: [] } },
  error: { name: "error", input: { ...reportCpInlineCandidatesFixture, status: "error", items: [], errorMessage: "候选数据暂时不可用。" } },
  empty: { name: "empty", input: reportCpInlineCandidatesEmptyFixture },
} satisfies Record<string, { name: string; input: ReportCpInlineCandidatesInput }>
