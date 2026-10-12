import { reportCpInlineFitFixture, reportCpInlinePrototypeFitFixture, reportCpInlineSmallAvailableFitFixture } from "@/components/domain/report-cp-inline-fit.fixtures"
import { reportCpInlineFilteredRows, reportCpInlineInsufficientRows } from "@/components/domain/report-cp-inline-candidates.fixtures"
import type { ReportCpInlineCandidate, ReportCpInlineFitInput, ReportCpInlineWaferPair } from "@/schemas/domain-component-inputs"

function unavailableFit(candidate: ReportCpInlineCandidate, waferPairs: ReportCpInlineWaferPair[], reason: string): ReportCpInlineFitInput {
  return {
    experimentGroupId: candidate.experimentGroupId,
    cpParameter: candidate.cpParameter, inlineParameter: candidate.inlineParameter,
    stepLabel: candidate.stepLabel, factorLabel: candidate.factorLabel, cpUnit: candidate.cpUnit,
    waferPairs,
    fitPanels: reportCpInlineFitFixture.fitPanels.map((panel) => ({
      ...panel,
      points: waferPairs.flatMap((pair) => {
        const y = panel.id === "median" ? pair.cpMedian : panel.id === "min" ? pair.cpMin : pair.cpMax
        return pair.coverageStatus === "PAIRED" && pair.inlineMedian != null && y != null ? [{ id: `${panel.id}-${pair.waferId}`, label: pair.waferId, waferId: pair.waferId, role: pair.role, grain: "WAFER" as const, x: pair.inlineMedian, y, inlineWafers: [pair.waferId], cpWafers: [pair.waferId] }] : []
      }),
      models: panel.models.map((model) => ({ ...model, status: "unavailable", equation: null, series: [], r2: null, rmse: null, residualN: null, residualDf: null, diagnostic: reason, unavailableReason: reason })),
      roots: [], pearson: null, spearman: null, unavailableReason: reason,
      provenance: "Mock upstream availability scenario",
    })),
    provenance: { classification: "mock", source: "Explicit upstream availability scenario" },
  }
}

export const reportCpInlineBoundaryFits = Object.fromEntries(
  [...reportCpInlineFilteredRows, ...reportCpInlineInsufficientRows].map((candidate) => {
    let wafers = reportCpInlineFitFixture.waferPairs.slice(0, candidate.pairedCount)
    if (candidate.filterReason === "INLINE_CONSTANT") wafers = wafers.map((pair) => ({ ...pair, inlineMedian: 2 }))
    if (candidate.filterReason === "CP_CONSTANT") wafers = wafers.map((pair) => ({ ...pair, cpMedian: 0.03168, cpMin: 0.02838, cpMax: 0.03502001 }))
    return [candidate.experimentGroupId, unavailableFit(candidate, wafers, "此场景的上游未提供可用拟合；组件保留明细和散点。")]
  })
)

const coverageMismatch: ReportCpInlineFitInput = {
  ...reportCpInlineFitFixture,
  waferPairs: [...reportCpInlineFitFixture.waferPairs,
    { waferId: "DEMO_INLINE_ONLY", role: "SPLIT", condition: "Demo", inlineMedian: 6, cpMedian: null, cpMin: null, cpMax: null, coverageStatus: "INLINE_ONLY" },
    { waferId: "DEMO_CP_ONLY", role: "SPLIT", condition: "Demo", inlineMedian: null, cpMedian: 0.0317, cpMin: null, cpMax: null, coverageStatus: "CP_ONLY" },
    { waferId: "DEMO_NO_DATA", role: "SPLIT", condition: "Demo", inlineMedian: null, cpMedian: null, cpMin: null, cpMax: null, coverageStatus: "NO_DATA" },
  ],
  provenance: { classification: "mock", source: "Coverage boundary; extra rows are not fit points" },
}
const partial: ReportCpInlineFitInput = {
  ...reportCpInlineFitFixture,
  waferPairs: reportCpInlineFitFixture.waferPairs.map((pair) => ({ ...pair, cpMin: null })),
  fitPanels: reportCpInlineFitFixture.fitPanels.map((panel) => panel.id !== "min" ? panel : unavailableFit(reportCpInlineFilteredRows[0], [], "未提供 CP Min 证据。").fitPanels[1]),
  provenance: { classification: "mock", source: "Partial CP Min evidence scenario" },
}

const smallScaleFarSpec: ReportCpInlineFitInput = {
  ...reportCpInlineFitFixture,
  experimentGroupId: "MOCK_SMALL_SCALE", cpParameter: "SMALL_CP", inlineParameter: "INLINE_X",
  stepLabel: "Mock", factorLabel: "Measured-scale display",
  waferPairs: reportCpInlineFitFixture.waferPairs.map((pair, index) => ({ ...pair,
    waferId: `MOCK_${index + 1}`, inlineMedian: [18, 27, 53, 203][index],
    cpMedian: [2.76e-8, 2.80e-8, 2.89e-8, 3.26e-8][index],
    cpMin: [9.9e-9, 1.06e-8, 1.04e-8, 1.26e-8][index],
    cpMax: [0.0003000222, 0.0003000092, 0.0003000236, 0.000300029][index],
  })),
  fitPanels: reportCpInlineFitFixture.fitPanels.map((panel) => {
    const ys = panel.id === "median" ? [2.76e-8, 2.80e-8, 2.89e-8, 3.26e-8]
      : panel.id === "min" ? [9.9e-9, 1.06e-8, 1.04e-8, 1.26e-8]
      : [0.0003000222, 0.0003000092, 0.0003000236, 0.000300029]
    const points = panel.points.map((point, index) => ({ ...point, id: `${panel.id}-MOCK_${index + 1}`,
      waferId: `MOCK_${index + 1}`, label: `MOCK_${index + 1}`, x: [18, 27, 53, 203][index], y: ys[index],
      inlineWafers: [`MOCK_${index + 1}`], cpWafers: [`MOCK_${index + 1}`],
    }))
    return { ...panel, metricLabel: `CP ${panel.id === "median" ? "Median" : panel.id === "min" ? "Min" : "Max"}`, points, pearson: null, spearman: null, roots: [],
      models: panel.models.map((model) => ({ ...model, status: "unavailable", equation: null, series: [],
        r2: null, rmse: null, residualN: null, residualDf: null,
        diagnostic: "Mock 坐标轴/精度场景，不提供拟合证据。", unavailableReason: "未提供模型。" })),
      provenance: "Mock small-scale points and distant USL; no statistical claims",
    }
  }),
  spec: { target: null, lsl: null, usl: 0.0001, sourceLabel: "Mock distant USL", classification: "source-provisional" },
  provenance: { classification: "mock", source: "Display regression inspired by IGSSNSC; not a production dataset" },
}

export const reportCpInlineFitScenarios = {
  normal: { name: "normal", input: reportCpInlineFitFixture },
  upstreamAvailableSmallSample: { name: "upstream-available-small-sample", input: reportCpInlineSmallAvailableFitFixture },
  configuredSpec: { name: "configured-spec", input: { ...reportCpInlineFitFixture, spec: { target: 0.03174, lsl: 0.001, usl: 0.08000001, sourceLabel: "Mock review SPEC", classification: "source-provisional" }, fitPanels: reportCpInlineFitFixture.fitPanels.map((panel) => panel.id === "median" ? { ...panel, roots: [...panel.roots, { id: "review-linear-target", model: "linear", threshold: "target", x: 5.6410256410253705, y: 0.03174, domainStatus: "in-domain" }] } : panel), provenance: { classification: "mock", source: "Review SPEC fixture; target root derived offline, LSL/USL roots preserved" } } },
  prototype: { name: "prototype-backed", input: reportCpInlinePrototypeFitFixture },
  smallScaleFarSpec: { name: "small-scale-far-spec", input: smallScaleFarSpec },
  coverageMismatch: { name: "coverage-mismatch", input: coverageMismatch },
  partial: { name: "partial", input: partial },
  insufficient: { name: "upstream-unavailable", input: reportCpInlineBoundaryFits[reportCpInlineInsufficientRows[0].experimentGroupId] },
  empty: { name: "empty", input: unavailableFit(reportCpInlineFilteredRows[0], [], "当前组合没有可用证据。") },
} satisfies Record<string, { name: string; input: ReportCpInlineFitInput }>
