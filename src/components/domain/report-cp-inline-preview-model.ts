// Component Lab consumer only: selects already supplied fixture rows and evidence.
import { reportCpInlineCandidateRows, reportCpInlineDenseRows, reportCpInlineFilteredRows, reportCpInlineInsufficientRows } from "@/components/domain/report-cp-inline-candidates.fixtures"
import { reportCpInlineFitFixture } from "@/components/domain/report-cp-inline-fit.fixtures"
import { reportCpInlineBoundaryFits } from "@/components/domain/report-cp-inline-fit.scenarios"
import type { ReportCpInlineCandidate, ReportCpInlineCandidateFilter, ReportCpInlineCandidatesInput, ReportCpInlineFitInput } from "@/schemas/domain-component-inputs"

export function candidatePreviewPage(base: ReportCpInlineCandidatesInput, filters: ReportCpInlineCandidateFilter, page: number, dense = false): ReportCpInlineCandidatesInput {
  const viewRows = filters.view === "filtered" ? reportCpInlineFilteredRows : filters.view === "insufficient" ? reportCpInlineInsufficientRows : dense ? reportCpInlineDenseRows : reportCpInlineCandidateRows
  const rows = viewRows.filter((candidate) =>
    (filters.step == null || candidate.stepLabel === filters.step) &&
    (filters.cpParameter == null || candidate.cpParameter === filters.cpParameter) &&
    (filters.inlineParameter == null || candidate.inlineParameter === filters.inlineParameter) &&
    (filters.pairedN == null || candidate.pairedCount === filters.pairedN) &&
    (filters.reason == null || (candidate.filterReason ?? "LOW") === filters.reason)
  )
  const currentPage = Math.min(page, Math.max(1, Math.ceil(rows.length / base.pageSize)))
  return { ...base, filters, page: currentPage, total: rows.length, items: rows.slice((currentPage - 1) * base.pageSize, currentPage * base.pageSize), pairedNOptions: [...new Set(viewRows.map((candidate) => candidate.pairedCount))].sort((a, b) => a - b), reasonOptions: [...new Set(viewRows.map((candidate) => candidate.filterReason ?? "LOW"))], provenance: filters.view !== "recommended" || dense ? { classification: "mock", source: "Component Lab boundary/pagination fixtures" } : base.provenance }
}

export function candidatePreviewFit(candidate: ReportCpInlineCandidate): ReportCpInlineFitInput | null {
  const boundary = reportCpInlineBoundaryFits[candidate.experimentGroupId]
  if (boundary) return boundary
  if (candidate.experimentGroupId === reportCpInlineFitFixture.experimentGroupId && candidate.cpParameter === reportCpInlineFitFixture.cpParameter && candidate.inlineParameter === reportCpInlineFitFixture.inlineParameter) return reportCpInlineFitFixture
  if (candidate.experimentGroupId.startsWith("scenario||group-")) return {
    ...reportCpInlineFitFixture, experimentGroupId: candidate.experimentGroupId, stepLabel: candidate.stepLabel, factorLabel: candidate.factorLabel,
    provenance: { classification: "mock", source: "Pagination-only duplicate group; reused wafer evidence is demonstration data" },
  }
  return null
}
