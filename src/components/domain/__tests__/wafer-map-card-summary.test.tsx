import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { WaferMapCard } from "../wafer-map"
import { waferMapGalleryScenarios } from "../wafer-map.scenarios"

// Final Bin cards show electrical test counts only, regardless of any
// independent default-Layer Defect summary supplied alongside CP data.
describe("wafer card summary by view", () => {
  it("renders only Pass and Fail for every Final Bin summary availability state", () => {
    const input = waferMapGalleryScenarios.cpDefectSummary.input
    for (const wafer of input.wafers) {
      const html = renderToStaticMarkup(<WaferMapCard input={input} wafer={wafer} />)
      expect(html.includes('>Pass</span>')).toBe(true)
      expect(html.includes('>Fail</span>')).toBe(true)
      expect(html.includes("Defect Die")).toBe(false)
      expect(html.includes("Layer EOL")).toBe(false)
      expect(html.includes("grid-cols-2")).toBe(true)
      expect(html.includes("grid-cols-3")).toBe(false)
    }
  })

  it("retains the independent Defect metric for Parameter Map", () => {
    const input = waferMapGalleryScenarios.parameterOverview.input
    const wafer = { ...input.wafers[0], defectSummary: { status: "AVAILABLE" as const, layerId: "EOL", defectDieCount: 142 } }
    const html = renderToStaticMarkup(<WaferMapCard input={input} wafer={wafer} />)
    expect(html).toContain("Defect Die · Layer EOL")
    expect(html).toContain("142")
    expect(html).toContain("grid-cols-3")
  })

  it("retains Defect Map's own summary labels", () => {
    const input = waferMapGalleryScenarios.defectAggregates.input
    const html = renderToStaticMarkup(<WaferMapCard input={input} wafer={input.wafers[0]} />)
    expect(html).toContain("无缺陷 Die")
    expect(html).toContain("有缺陷 Die")
    expect(html).toContain("当前 Layer 全部类型汇总")
  })
})
