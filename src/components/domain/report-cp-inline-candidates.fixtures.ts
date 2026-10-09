import type { ReportCpInlineCandidate, ReportCpInlineCandidatesInput } from "@/schemas/domain-component-inputs"

// Persisted candidate fields transcribed from the reviewed Generation 13 notebook.
export const reportCpInlineCandidateRows: ReportCpInlineCandidate[] = [
  {
    "experimentGroupId": "CPX-S03||Pre clean",
    "stepLabel": "CPX-S03",
    "factorLabel": "Pre clean",
    "cpParameter": "kelvinS",
    "cpUnit": null,
    "inlineParameter": "AMY-SN080T24-TR-ETCH-DEF-02",
    "pairedCount": 4,
    "assignedWaferCount": 4,
    "pairedCoverage": 1,
    "direction": "POSITIVE",
    "spearman": 1,
    "rSquared": 0.994768,
    "cpResponse": 6e-05,
    "cpSpread": 0.00012,
    "score": 99.8169,
    "level": "HIGH_TREND",
    "sampleBand": "SMALL_SAMPLE",
    "filterReason": null,
    "detailAvailable": true,
    "algorithmVersion": "inline-cp/2.1.0"
  },
  {
    "experimentGroupId": "CPX-S04||Screen OX",
    "stepLabel": "CPX-S04",
    "factorLabel": "Screen OX",
    "cpParameter": "VGSTX3",
    "cpUnit": null,
    "inlineParameter": "AME-SN080T24-CT-ET2-AEI-69",
    "pairedCount": 4,
    "assignedWaferCount": 4,
    "pairedCoverage": 1,
    "direction": "POSITIVE",
    "spearman": 1,
    "rSquared": 0.986402,
    "cpResponse": null,
    "cpSpread": null,
    "score": 99.5241,
    "level": "HIGH_TREND",
    "sampleBand": "SMALL_SAMPLE",
    "filterReason": null,
    "detailAvailable": false,
    "algorithmVersion": "inline-cp/2.1.0"
  },
  {
    "experimentGroupId": "CPX-S04||Screen OX",
    "stepLabel": "CPX-S04",
    "factorLabel": "Screen OX",
    "cpParameter": "VGSTX2",
    "cpUnit": null,
    "inlineParameter": "AME-SN080T24-CT-ET2-AEI-69",
    "pairedCount": 4,
    "assignedWaferCount": 4,
    "pairedCoverage": 1,
    "direction": "POSITIVE",
    "spearman": 1,
    "rSquared": 0.98438,
    "cpResponse": null,
    "cpSpread": null,
    "score": 99.4533,
    "level": "HIGH_TREND",
    "sampleBand": "SMALL_SAMPLE",
    "filterReason": null,
    "detailAvailable": false,
    "algorithmVersion": "inline-cp/2.1.0"
  }
]

// Boundary and pagination data are explicitly mock, never production facts.
const baseCandidate = reportCpInlineCandidateRows[0]
export const reportCpInlineFilteredRows: ReportCpInlineCandidate[] = ["INLINE_CONSTANT", "CP_CONSTANT", null].map((reason) => ({
  ...baseCandidate,
  experimentGroupId: `scenario||${reason}`,
  factorLabel: "Boundary scenario", level: "LOW", filterReason: reason,
  score: reason == null ? 28 : null, spearman: reason == null ? 0.2 : null, rSquared: reason == null ? 0.04 : null,
  calculationEvidence: reason == null ? "未达到当前算法的推荐等级；保留已保存的 Score。" : reason === "INLINE_CONSTANT" ? "所有有效 Inline Median 相同。" : "所有有效 CP Median 相同。",
}))
export const reportCpInlineInsufficientRows: ReportCpInlineCandidate[] = [1, 2, 0].map((n) => ({
  ...baseCandidate, experimentGroupId: `scenario||N${n}`, factorLabel: "Small sample scenario",
  pairedCount: n, pairedCoverage: n / 4, score: null, spearman: null, rSquared: null,
  level: "LOW", sampleBand: "N_LT_3", filterReason: "INSUFFICIENT_SAMPLE", detailAvailable: n > 0,
  calculationEvidence: `有效同片配对 Wafer N=${n}；拟合可用性以提供的证据为准。`,
}))
export const reportCpInlineDenseRows: ReportCpInlineCandidate[] = Array.from({ length: 25 }, (_, index) => ({
  ...baseCandidate, experimentGroupId: `scenario||group-${String(index + 1).padStart(2, "0")}`,
  stepLabel: index % 2 === 0 ? "DEMO-S01" : "DEMO-S02", factorLabel: `Demo Factor ${String(index + 1).padStart(2, "0")}`,
  score: 99 - index * 0.7,
}))

export const reportCpInlineCandidatesFixture: ReportCpInlineCandidatesInput = {
  "title": "Wafer-level Candidate Analysis",
  "stepOptions": [
    "CPX-S03",
    "CPX-S04"
  ],
  "cpParameterOptions": [
    "kelvinS",
    "VGSTX3",
    "VGSTX2"
  ],
  "inlineParameterOptions": [
    "AMY-SN080T24-TR-ETCH-DEF-02",
    "AME-SN080T24-CT-ET2-AEI-69"
  ],
  "pairedNOptions": [
    4
  ],
  "reasonOptions": [
    "INLINE_CONSTANT",
    "CP_CONSTANT",
    "LOW"
  ],
  "filters": {
    "step": null,
    "cpParameter": null,
    "inlineParameter": null,
    "view": "recommended",
    "pairedN": null,
    "reason": null
  },
  items: reportCpInlineCandidateRows,
  "page": 1,
  "pageSize": 10,
  "total": 3,
  "status": "ready",
  "calculationVersion": "inline-cp/2.1.0",
  "scoreDescription": "已保存的 inline-cp/2.1.0 评分。N=3..5：100 × (0.45 × |Spearman| + 0.35 × R² + 0.20 × 配对覆盖率)；其他样本段以对应算法版本为准。",
  "provenance": {
    "classification": "redacted-real",
    "source": "cp_x_inline.ipynb · Generation 13 · frozen wafer summaries",
    "limitation": "仅转录选定组合及前三个已保存候选；不代表快照全量。"
  }
}

export const reportCpInlineCandidatesEmptyFixture: ReportCpInlineCandidatesInput = { ...reportCpInlineCandidatesFixture, items: [], total: 0, provenance: { classification: "mock", source: "Empty candidate scenario" } }
