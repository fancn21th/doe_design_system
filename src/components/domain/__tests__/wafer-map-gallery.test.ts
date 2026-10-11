import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { LayersIcon } from "lucide-react"
import { describe, expect, it, vi } from "vitest"

import {
  DEFAULT_FINAL_BIN_PALETTE,
  createWaferCanvasLayout,
  finalBinColor,
  parameterColor,
} from "@/components/domain/wafer-map-model"
import { waferMapW01Fixture } from "@/components/domain/wafer-map.fixtures"
import { waferMapGalleryScenarios } from "@/components/domain/wafer-map.scenarios"
import { WaferMapCard, InspectionStatistics, DefectRecordDetails, selectedDieRows, defectClassesForLayer } from "@/components/domain/wafer-map"
import {
  reportWaferMapInputSchema,
  waferMapGalleryInputSchema,
  waferMapMapStateSchema,
} from "@/schemas/domain-component-inputs"
import { ReportViewNavigation } from "@/components/domain/report-view-navigation"
import { reportWaferMapScenarios } from "@/components/domain/report-wafer-map.scenarios"
import {
  emitDefectFilterChange,
  resolveVisibleMapView,
} from "@/components/domain/report-wafer-map"

describe("wafer map gallery contract", () => {
  it("validates the three V1 render modes with 25 independent wafers", () => {
    for (const scenario of [
      waferMapGalleryScenarios.finalBinOverview,
      waferMapGalleryScenarios.parameterOverview,
      waferMapGalleryScenarios.defectOverview,
    ]) {
      const input = waferMapGalleryInputSchema.parse(scenario.input)
      expect(input.wafers).toHaveLength(25)
      expect(input.wafers.every((wafer) => wafer.geometry.dies.length === 4099)).toBe(true)
    }
  })

  it("keeps the 4,099 legal dies inside one shallow circular canvas boundary", () => {
    const layout = createWaferCanvasLayout(waferMapW01Fixture, 220, 10)
    expect(layout.dieById).toHaveLength(4099)
    expect(layout.radius).toBe(100)
  })

  it("uses stable discrete Final Bin colors and a bounded parameter gradient", () => {
    expect(finalBinColor("1")).toBe(DEFAULT_FINAL_BIN_PALETTE["1"])
    expect(finalBinColor("PASS")).toBe(DEFAULT_FINAL_BIN_PALETTE.PASS)
    expect(parameterColor(-1, 0, 1)).toBe(parameterColor(0, 0, 1))
    expect(parameterColor(2, 0, 1)).toBe(parameterColor(1, 0, 1))
  })

  it("carries mode-specific inspection statistics for the expanded view", () => {
    const finalBin = waferMapGalleryInputSchema.parse(waferMapGalleryScenarios.finalBinOverview.input)
    const parameter = waferMapGalleryInputSchema.parse(waferMapGalleryScenarios.parameterOverview.input)
    const defect = waferMapGalleryInputSchema.parse(waferMapGalleryScenarios.defectOverview.input)

    if (finalBin.kind !== "cp-final-bin" || parameter.kind !== "cp-parameter" || defect.kind !== "defect") {
      throw new Error("Unexpected wafer map scenario kind")
    }

    expect(finalBin.wafers[0].inspection?.rows.reduce((sum, row) => sum + row.count, 0)).toBe(4099)
    expect(parameter.wafers[0].inspection?.sampleCount).toBe(4091)
    expect(parameter.wafers[0].inspection?.mean).toBeGreaterThan(0)
    expect(defect.wafers[0].inspection?.byLayer.map((item) => item.layerId)).toEqual(["M1", "M2"])
  })

  it("shows supplied numeric Bin identity separately from its display classification", () => {
    const input = waferMapGalleryInputSchema.parse(waferMapGalleryScenarios.finalBinOverview.input)
    if (input.kind !== "cp-final-bin") throw new Error("Expected Final Bin input")
    const wafer = input.wafers[0]!
    const die = wafer.dies[0]!
    die.finalBin = "PASS"
    die.binCode = "0"
    die.binDescription = "Source pass class"
    expect(selectedDieRows(input, wafer, die.id).items).toEqual([
      { label: "Final Bin", value: "Bin 0" },
      { label: "Bin Des", value: "Source pass class" },
    ])
  })

  it("renders one-sided SPEC and CPK without inventing an upper bound or clamping negatives", () => {
    const input = waferMapGalleryInputSchema.parse(waferMapGalleryScenarios.oneSidedParameter.input)
    if (input.kind !== "cp-parameter") throw new Error("Expected parameter input")
    const wafer = input.wafers[0]!
    const html = renderToStaticMarkup(React.createElement(InspectionStatistics, { input, wafer }))
    expect(html).toContain("SPEC LSL V")
    expect(html).toContain("81.2")
    expect(html).toContain("SPEC USL V")
    expect(html).toContain("0.52")
    expect(html).not.toContain("105.6")
    expect(wafer.inspection?.usl).toBeNull()
    wafer.inspection!.cpk = -0.123
    expect(renderToStaticMarkup(React.createElement(InspectionStatistics, { input, wafer }))).toContain("-0.12")
  })

  it("formats supplied variation percentages, preserving null and negative values", () => {
    const input = waferMapGalleryInputSchema.parse(waferMapGalleryScenarios.parameterVariationUnavailable.input)
    if (input.kind !== "cp-parameter") throw new Error("Expected parameter input")
    const wafer = input.wafers[0]!
    const unavailable = renderToStaticMarkup(React.createElement(InspectionStatistics, { input, wafer }))
    expect(unavailable).toContain("Uniformity (RsU)")
    expect(unavailable).toContain("Hi/Lo Var.")
    expect(unavailable).not.toContain("0.00%")
    wafer.inspection!.uniformityPercent = -2.125
    wafer.inspection!.hiLoVariationPercent = -4.25
    expect(waferMapGalleryInputSchema.safeParse(input).success).toBe(true)
    const negative = renderToStaticMarkup(React.createElement(InspectionStatistics, { input, wafer }))
    expect(negative).toContain("-2.13%")
    expect(negative).toContain("-4.25%")
  })

  it("keeps parameter-valid samples separate from same-test CP totals and supplied rates", () => {
    const input = waferMapGalleryInputSchema.parse(waferMapGalleryScenarios.parameterOverview.input)
    if (input.kind !== "cp-parameter") throw new Error("Expected parameter input")
    const wafer = input.wafers[0]!
    expect(wafer.inspection?.sampleCount).toBe(4091)
    expect(wafer.cpSummary?.testedDieCount).toBe(4099)
    const html = renderToStaticMarkup(React.createElement(InspectionStatistics, { input, wafer }))
    expect(html).toContain("参数有效样本数：4,091")
    expect(html).toContain("CP Tested Die Count")
    expect(html).toContain("4,099")
    expect(html).toContain("CP Pass Rate")
    expect(html).toContain(`${wafer.cpSummary!.passRatePercent!.toFixed(2)}%`)
    expect(html).toContain(`${wafer.cpSummary!.failRatePercent!.toFixed(2)}%`)
  })

  it("does not replace absent same-test CP facts with valid samples or legacy slice summary", () => {
    const input = waferMapGalleryInputSchema.parse(waferMapGalleryScenarios.parameterCpSummaryUnavailable.input)
    if (input.kind !== "cp-parameter") throw new Error("Expected parameter input")
    const wafer = input.wafers[0]!
    const html = renderToStaticMarkup(React.createElement(InspectionStatistics, { input, wafer }))
    expect(html).toContain("Map 与参数统计的测试身份不一致。")
    expect(html).not.toContain(wafer.summary!.pass.toLocaleString())
    expect(html).not.toContain("0.00%")
    wafer.cpSummary!.unavailableReason = "CP_COORDINATE_SOURCE_MISMATCH"
    expect(renderToStaticMarkup(React.createElement(InspectionStatistics, { input, wafer }))).toContain("CP Map 与参数 Map 的坐标来源不一致。")
    delete wafer.cpSummary
    expect(renderToStaticMarkup(React.createElement(InspectionStatistics, { input, wafer }))).toContain("CP 测试统计未提供。")
    wafer.cpSummary = { status: "AVAILABLE", testedDieCount: 0, passDieCount: 0, failDieCount: 0, passRatePercent: null, failRatePercent: null }
    const emptyHtml = renderToStaticMarkup(React.createElement(InspectionStatistics, { input, wafer }))
    expect(emptyHtml).not.toContain("0.00%")
  })

  it("presents delivered CP facts independently when parameter statistics are absent", () => {
    const input = waferMapGalleryInputSchema.parse(waferMapGalleryScenarios.parameterOverview.input)
    if (input.kind !== "cp-parameter") throw new Error("Expected parameter input")
    const wafer = input.wafers[0]!
    delete wafer.inspection
    const html = renderToStaticMarkup(React.createElement(InspectionStatistics, { input, wafer }))
    expect(html).toContain("CP Tested Die Count")
    expect(html).toContain("4,099")
    expect(html).toContain("统计明细不可用")
  })

  it("preserves multiple aggregate records and unresolved category identity without fake records", () => {
    const input = waferMapGalleryInputSchema.parse(waferMapGalleryScenarios.defectAggregates.input)
    if (input.kind !== "defect") throw new Error("Expected defect input")
    const wafer = input.wafers[0]!
    expect(wafer.dies[0].defects.map((record) => record.id)).toEqual(["0", "DEMO-RECORD-2", "DEMO-RECORD-3"])
    expect(selectedDieRows(input, wafer, "-19:5").items).toContainEqual({ label: "Defect Record", value: "3" })
    expect(defectClassesForLayer(wafer.dies[0], "EOL").map((item) => item.typeId)).toEqual(["class:206", "class:212"])
    const html = renderToStaticMarkup(React.createElement(InspectionStatistics, { input, wafer }))
    expect(html).toContain("网格外记录：1")
    expect(html).toContain("25.00%")
    expect(html).toContain("75.00%")
    expect(html).not.toContain("Particle")
    wafer.dies[0].classBreakdownStatus = "UNAVAILABLE"
    expect(selectedDieRows(input, wafer, "-19:5").items).toContainEqual({ label: "Defect Type", value: "分类明细未提供" })
  })

  it("renders delivered record identity, signed coordinates, nullable dimensions and zero image count", () => {
    const input = waferMapGalleryInputSchema.parse(waferMapGalleryScenarios.defectAggregates.input)
    if (input.kind !== "defect") throw new Error("Expected defect input")
    const record = input.wafers[0].dies[0].defects[0]
    const html = renderToStaticMarkup(React.createElement(DefectRecordDetails, { record }))
    expect(html).toContain("缺陷记录 0 明细")
    expect(html).toContain("206（名称未解析）")
    expect(html).toContain("1.25")
    expect(html).toContain("-12.5")
    expect(html).toContain("SIZE_Y")
    expect(html).toContain("图片数量")
    expect(html).not.toContain("<img")
    expect(html).not.toContain("http")
  })

  it("keeps independent CP defect summary Layer scope and unavailable Map separate from zero", () => {
    const input = waferMapGalleryInputSchema.parse(waferMapGalleryScenarios.cpDefectSummary.input)
    if (input.kind !== "cp-final-bin") throw new Error("Expected CP input")
    const available = renderToStaticMarkup(React.createElement(WaferMapCard, { input, wafer: input.wafers[0] }))
    expect(available).toContain("Defect Die · Layer EOL")
    expect(available).toContain("142")
    const missing = renderToStaticMarkup(React.createElement(WaferMapCard, { input, wafer: input.wafers[1] }))
    expect(missing).toContain("该 Layer 无 Map 数据")
    expect(missing).toContain("—")
    expect(input.wafers[1].defectSummary?.defectDieCount).toBeNull()
    input.wafers[1].defectSummary!.unavailableReason = "LAYER_NO_RECORD"
    const translated = renderToStaticMarkup(React.createElement(WaferMapCard, { input, wafer: input.wafers[1] }))
    expect(translated).toContain("当前 Layer 无检测记录。")
    expect(translated).not.toContain("LAYER_NO_RECORD")
    input.wafers[1].defectSummary!.unavailableReason = "当前检测尚未完成。"
    expect(renderToStaticMarkup(React.createElement(WaferMapCard, { input, wafer: input.wafers[1] }))).toContain("当前检测尚未完成。")
  })

  it("passes disabled Overlay to the foundation Tabs trigger", () => {
    const tree = ReportViewNavigation({ ariaLabel: "Wafer Map 视图", options: [{ value: "overlay", label: "Overlay", icon: LayersIcon, disabled: true }] })
    const trigger = findElement(tree, (element) => element.props.value === "overlay")
    expect(trigger?.props.disabled).toBe(true)
  })

  it("accepts drawable maps without inspection statistics instead of deriving them", () => {
    const parameter = waferMapGalleryInputSchema.parse(waferMapGalleryScenarios.inspectionUnavailable.input)
    if (parameter.kind !== "cp-parameter") throw new Error("Expected parameter map input")

    expect(parameter.wafers[0].dies).toHaveLength(4099)
    expect(parameter.wafers[0].summary).toEqual({ pass: 4075, fail: 24 })
    expect(parameter.wafers[0].inspection).toBeUndefined()
    expect(parameter.wafers[0].inspectionUnavailableReason).toBe("BFF 尚未提供单片 Parameter 统计。")
    expect(parameter.wafers[0].dies[0]).not.toHaveProperty("finalBin")
    expect(parameter.wafers[0].dies[0]).not.toHaveProperty("pass")
  })

  it("accepts drawable Parameter maps without a wafer summary", () => {
    const parameter = waferMapGalleryInputSchema.parse(waferMapGalleryScenarios.summaryUnavailable.input)
    if (parameter.kind !== "cp-parameter") throw new Error("Expected parameter map input")

    expect(parameter.wafers[0].dies).toHaveLength(4099)
    expect(parameter.wafers[0].summary).toBeNull()
    expect(parameter.wafers[0].summaryUnavailableReason).toBe("选中 Parameter slice 未提供 yield summary。")
  })

  it("makes Final Bin, Parameter, and Defect inspection independently optional", () => {
    for (const source of [
      waferMapGalleryScenarios.finalBinOverview.input,
      waferMapGalleryScenarios.parameterOverview.input,
      waferMapGalleryScenarios.defectOverview.input,
    ]) {
      // Optionality is a per-wafer contract; 25-wafer coverage is checked above.
      const input = structuredClone({ ...source, wafers: source.wafers.slice(0, 1), mapStates: source.mapStates?.slice(0, 1) })
      for (const wafer of input.wafers) delete wafer.inspection
      expect(waferMapGalleryInputSchema.safeParse(input).success).toBe(true)
    }
  })

  it("makes Final Bin, Parameter, and Defect summaries independently optional", () => {
    for (const source of [
      waferMapGalleryScenarios.finalBinOverview.input,
      waferMapGalleryScenarios.parameterOverview.input,
      waferMapGalleryScenarios.defectOverview.input,
    ]) {
      // Optionality is a per-wafer contract; 25-wafer coverage is checked above.
      const input = structuredClone({ ...source, wafers: source.wafers.slice(0, 1), mapStates: source.mapStates?.slice(0, 1) })
      for (const wafer of input.wafers) delete wafer.summary
      expect(waferMapGalleryInputSchema.safeParse(input).success).toBe(true)
    }
  })

  it("keeps selected-layer coverage separate from drawable maps without fabricating geometry", () => {
    const input = waferMapGalleryInputSchema.parse(waferMapGalleryScenarios.defectLayerCoverage.input)
    if (input.kind !== "defect") throw new Error("Expected defect map input")

    expect(input.mapStates).toHaveLength(25)
    expect(input.wafers).toHaveLength(2)
    expect(input.mapStates?.filter((state) => state.availability === "empty")).toHaveLength(23)
    expect(new Set(input.mapStates?.map((state) => state.mapId))).toHaveLength(25)
  })

  it("requires unique map identity and an authoritative reason for blocked coverage", () => {
    const duplicate = structuredClone(waferMapGalleryScenarios.finalBinOverview.input)
    duplicate.wafers[1]!.mapId = duplicate.wafers[0]!.mapId
    expect(waferMapGalleryInputSchema.safeParse(duplicate).success).toBe(false)
    expect(waferMapMapStateSchema.safeParse({
      mapId: "defect:EOL:W01",
      waferId: "W01",
      availability: "unavailable",
    }).success).toBe(false)
  })

  it("keeps Overlay visible as an injected unavailable state, never a map payload", () => {
    const input = reportWaferMapInputSchema.parse(reportWaferMapScenarios.controlledPartial.input)
    expect(input.overlayState).toEqual({
      status: "unavailable",
      reason: "CP 与 Defect 坐标尚未对齐，不能可靠叠图。",
    })
    expect(input.mapViews).toHaveLength(1)
  })

  it("never resolves a CP map while Overlay is the selected primary view", () => {
    const finalBinView = waferMapGalleryInputSchema.parse(waferMapGalleryScenarios.finalBinOverview.input)
    expect(resolveVisibleMapView({
      primaryView: "overlay",
      cpView: "final-bin",
      finalBinView,
    })).toBeUndefined()
  })

  it("emits only the changed Defect filter callback", () => {
    const onLayerChange = vi.fn()
    const onTypeChange = vi.fn()
    const callbacks = { onLayerChange, onTypeChange }

    emitDefectFilterChange(
      { layerId: "EOL", typeIds: ["particle"] },
      { layerId: "EOL", typeIds: ["scratch"] },
      callbacks,
    )
    expect(onLayerChange).not.toHaveBeenCalled()
    expect(onTypeChange).toHaveBeenCalledTimes(1)

    emitDefectFilterChange(
      { layerId: "EOL", typeIds: ["scratch"] },
      { layerId: "M1", typeIds: ["scratch"] },
      callbacks,
    )
    expect(onLayerChange).toHaveBeenCalledTimes(1)
    expect(onTypeChange).toHaveBeenCalledTimes(1)
  })

  it("opens a map by mapId when its map identity differs from waferId", () => {
    const input = waferMapGalleryInputSchema.parse(waferMapGalleryScenarios.finalBinOverview.input)
    if (input.kind !== "cp-final-bin") throw new Error("Expected Final Bin map input")
    const wafer = input.wafers[0]!
    const onExpand = vi.fn()
    const tree = WaferMapCard({ input, wafer, onExpand })
    const expandButton = findElement(tree, (element) => element.props["aria-label"] === `全屏查看 ${wafer.waferId}`)

    expect(wafer.mapId).not.toBe(wafer.waferId)
    expect(expandButton).toBeDefined()
    expandButton?.props.onClick?.()
    expect(onExpand).toHaveBeenCalledWith(wafer.mapId)
  })
})

type TestElement = React.ReactElement<{
  children?: React.ReactNode
  "aria-label"?: string
  onClick?: () => void
  value?: string
  disabled?: boolean
}>

function findElement(
  value: React.ReactNode,
  matches: (element: TestElement) => boolean,
): TestElement | undefined {
  if (!React.isValidElement(value)) return undefined
  const element = value as TestElement
  if (matches(element)) return element
  return React.Children.toArray(element.props.children)
    .map((child) => findElement(child, matches))
    .find((element) => element !== undefined)
}
