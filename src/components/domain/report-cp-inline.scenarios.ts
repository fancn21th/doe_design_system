import { reportCpInlineCandidatesScenarios } from "@/components/domain/report-cp-inline-candidates.scenarios"
import type { ReportCpInlineInput } from "@/schemas/domain-component-inputs"

export const reportCpInlineScenarios = {
  normal: { name: "normal", input: { candidates: reportCpInlineCandidatesScenarios.normal.input, fit: null, fitStatus: "ready" } },
  dense: { name: "dense", input: { candidates: reportCpInlineCandidatesScenarios.dense.input, fit: null, fitStatus: "ready" } },
  detailLoading: { name: "detail-loading", input: { candidates: reportCpInlineCandidatesScenarios.normal.input, fit: null, fitStatus: "loading" } },
  detailError: { name: "detail-error", input: { candidates: reportCpInlineCandidatesScenarios.normal.input, fit: null, fitStatus: "error", fitError: "所选组合的 Fit 证据暂时不可用。" } },
} satisfies Record<string, { name: string; input: ReportCpInlineInput }>
