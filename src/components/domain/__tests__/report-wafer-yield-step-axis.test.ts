import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { WaferYieldCpFailAnalysis } from "@/components/domain/report-wafer-yield-cp-fail-analysis"
import { groupConsecutiveWaferSteps } from "@/components/domain/report-wafer-yield-cp-fail-model"
import { reportWaferYieldCpFailSchema, type ReportWaferYieldCpFail } from "@/schemas/domain-component-inputs"

type Wafer = ReportWaferYieldCpFail["wafers"][number]
function membership(stepKey: string, step: string, baseline = false) {
  return { stepKey, step, stageId: "stage", stepId: stepKey, stepSequence: 1,
    stage: "Stage", seq: "1", variantRowId: `${stepKey}-variant`, variantSequence: 1,
    roleLabel: baseline ? "BSL" : "split-1", isBaselineVariant: baseline }
}
function wafer(waferId: string, memberships: ReturnType<typeof membership>[], condition = "0.75um"): Wafer {
  return { waferId, step: "legacy first step", condition, yield: 99.63, cpFails: [], memberships }
}
const wafers = [
  wafer("W01", [membership("a", "TR CD", true), membership("b", "TR Depth", true)], "BASELINE"),
  wafer("W02", [membership("a", "TR CD")]),
  wafer("W04", [membership("b", "TR Depth")], "4.5um"),
]

describe("Yield chart dynamic Step axis regression", () => {
  it("renders Condition, wafer and Step rows while retaining one point per physical wafer", () => {
    const html = renderToStaticMarkup(React.createElement(WaferYieldCpFailAnalysis, {
      input: { title: "Yield", failThresholdPercent: 2, series: [], wafers },
    }))
    expect(html).toMatch(/title="0.75um"[^>]*>0.75um<\/span>/)
    expect(html).toMatch(/title="TR CD"[^>]*>TR CD<\/span>/)
    expect(html).toMatch(/title="TR Depth"[^>]*>TR Depth<\/span>/)
    expect(html).toMatch(/title="BSL"[^>]*>BSL<\/span>/)
    expect(html.match(/<circle\b/g)).toHaveLength(3)
  })
  it("places a shared baseline in BSL rather than its first membership's Step", () => {
    expect(groupConsecutiveWaferSteps(wafers)).toEqual([
      { step: "BSL", startIndex: 0, count: 1 },
      { step: "TR CD", startIndex: 1, count: 1 },
      { step: "TR Depth", startIndex: 2, count: 1 },
    ])
  })
  it("does not merge different identities with equal Step labels", () => {
    const groups = groupConsecutiveWaferSteps([
      wafer("W02", [membership("a", "TR CD")]),
      wafer("W03", [membership("b", "TR CD")]),
      wafer("W04", [membership("b", "TR CD")]),
    ])
    expect(groups.map(({ count }) => count)).toEqual([1, 2])
  })
  it("does not silently assign a multi-Step nonbaseline wafer to its first Step", () => {
    expect(groupConsecutiveWaferSteps([wafer("W02", [membership("a", "TR CD"), membership("b", "TR Depth")])]))
      .toEqual([{ step: "多 Step", startIndex: 0, count: 1 }])
  })
  it("preserves memberships when the input passes through the public schema", () => {
    const parsed = reportWaferYieldCpFailSchema.parse({ title: "Yield", series: [], wafers })
    expect(parsed.wafers[0].memberships).toEqual(wafers[0].memberships)
  })
})
