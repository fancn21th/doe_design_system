import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { LayersIcon } from "lucide-react"
import { describe, expect, it, vi } from "vitest"

import {
  DEFAULT_FINAL_BIN_PALETTE,
  createWaferCanvasLayout,
  finalBinColor,
  parameterColor,
  boundedWaferZoom,
  canvasPointFromClient,
  dieColorSegments,
  waferTooltipPosition,
} from "@/components/domain/wafer-map-model"
import { waferMapW01Fixture } from "@/components/domain/wafer-map.fixtures"
import { waferMapGalleryScenarios } from "@/components/domain/wafer-map.scenarios"
import { WaferMapCard, InspectionStatistics, DefectRecordDetails, selectedDieRows, defectClassesForLayer, diePopoverData, DefectFilterComboboxes, matchingDefectClasses, createWaferZoomViewportRef } from "@/components/domain/wafer-map"
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

    const binHtml = renderToStaticMarkup(React.createElement(InspectionStatistics, { input: finalBin, wafer: finalBin.wafers[0]! }))
    expect(binHtml).toContain("关于 Total Fail Bin Rate")
    expect(binHtml).toContain("关于 各 Bin Rate")
    expect(finalBin.wafers[0].inspection?.rows.reduce((sum, row) => sum + row.count, 0)).toBe(4099)
    expect(parameter.wafers[0].inspection?.sampleCount).toBe(4091)
    expect(parameter.wafers[0].inspection?.mean).toBeGreaterThan(0)
    expect(defect.wafers[0].inspection?.byLayer.map((item) => item.layerId)).toEqual(["M1", "M2"])
  })

  it("uses only aligned wafer SPEC for Die detail and hover, retaining one-sided bounds and raw Bin 0", () => {
    const source = waferMapGalleryScenarios.oneSidedParameter.input
    const input = waferMapGalleryInputSchema.parse({ ...source, wafers: source.wafers.slice(0, 1) })
    if (input.kind !== "cp-parameter") throw new Error("Expected parameter")
    const wafer = input.wafers[0]!
    const die = wafer.dies[0]!
    die.binCode = "0"; die.binDescription = "Source PASS"; die.finalBin = "PASS"; die.pass = true
    const rows = selectedDieRows(input, wafer, die.id).items
    expect(rows).toContainEqual({ label: "SPEC LSL V", value: "81.2" })
    expect(rows).toContainEqual({ label: "SPEC USL V", value: "—" })
    expect(rows).toContainEqual({ label: "Final Bin", value: "Bin 0" })
    expect(rows).toContainEqual({ label: "Bin Des", value: "Source PASS" })
    expect(diePopoverData(input, wafer, die.id)).toContainEqual({ label: "CP 状态", value: "CP Pass" })
    input.parameter.lsl = 999; input.parameter.usl = 1000
    delete wafer.inspection; delete die.pass; delete die.binCode
    die.cpUnavailableReason = "CP_MAP_IDENTITY_UNAVAILABLE"
    const absent = diePopoverData(input, wafer, die.id)
    expect(absent).toContainEqual({ label: "SPEC LSL", value: "—" })
    expect(absent).toContainEqual({ label: "Final Bin", value: "—" })
    expect(absent.some((row) => row.value.includes("999") || row.value === "Bin PASS")).toBe(false)
    expect(absent.find((row) => row.label === "CP 状态")?.value).not.toContain("CP_MAP_IDENTITY_UNAVAILABLE")
    die.cpUnavailableReason = "CP_DIE_COORDINATE_MISSING"
    expect(diePopoverData(input, wafer, die.id)).toContainEqual({ label: "CP 状态", value: "当前 Die 的 CP 坐标未提供。" })
    die.cpUnavailableReason = "NEW_UNAVAILABLE_CODE"
    expect(diePopoverData(input, wafer, die.id)).toContainEqual({ label: "CP 状态", value: "CP 状态暂不可用" })
  })

  it("retains every matching class in equal-width drawing segments and hover counts", () => {
    const input = waferMapGalleryInputSchema.parse(waferMapGalleryScenarios.defectAggregates.input)
    if (input.kind !== "defect") throw new Error("Expected defect")
    const wafer = input.wafers[0]!
    const classes = matchingDefectClasses(wafer.dies[0], "EOL", [])
    expect(matchingDefectClasses(wafer.dies[0], "EOL", ["class:212"]).map((item) => item.typeId)).toEqual(["class:212"])
    expect(matchingDefectClasses(wafer.dies[0], "EOL", ["class:missing"])).toEqual([])
    const geometry = { id: wafer.dies[0].id, x: 10, y: 20, width: 9, height: 4 }
    const segments = dieColorSegments(geometry, classes.map((item) => item.typeId))
    expect(segments.map((item) => [item.x, item.width, item.fill])).toEqual([[10, 4.5, "class:206"], [14.5, 4.5, "class:212"]])
    expect(dieColorSegments(geometry, ["class:212"])).toEqual([{ ...geometry, fill: "class:212" }])
    expect(dieColorSegments(geometry, [])).toEqual([])
    const hover = diePopoverData(input, wafer, wafer.dies[0].id)
    expect(hover).toContainEqual({ label: "Layer", value: "EOL" })
    expect(hover).toContainEqual({ label: "206（名称未解析）", value: "1" })
    expect(hover).toContainEqual({ label: "212（名称未解析）", value: "2" })
  })

  it("binds zoom/resize on delayed portal node mount and cleans up before remount", () => {
    const observers: Array<{ resize: (entries: Array<{ contentRect: { width: number; height: number } }>) => void; observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }> = []
    class TestResizeObserver {
      observe = vi.fn()
      disconnect = vi.fn()
      constructor(public resize: (entries: Array<{ contentRect: { width: number; height: number } }>) => void) { observers.push(this) }
    }
    vi.stubGlobal("ResizeObserver", TestResizeObserver)
    try {
      const onSize = vi.fn()
      const onZoom = vi.fn()
      const ref = createWaferZoomViewportRef(onSize, onZoom)
      expect(ref(null)).toBeUndefined() // Open render precedes portal DOM.
      expect(observers).toHaveLength(0)
      const viewport = new EventTarget() as HTMLDivElement
      const cleanup = ref(viewport)!
      expect(observers[0].observe).toHaveBeenCalledWith(viewport)
      observers[0].resize([{ contentRect: { width: 884, height: 540 } }])
      expect(onSize).toHaveBeenCalledWith(516)
      const wheel = new Event("wheel", { cancelable: true })
      Object.defineProperty(wheel, "deltaY", { value: -20 })
      viewport.dispatchEvent(wheel)
      expect(wheel.defaultPrevented).toBe(true)
      expect(onZoom).toHaveBeenLastCalledWith(10)
      cleanup()
      expect(observers[0].disconnect).toHaveBeenCalledOnce()
      viewport.dispatchEvent(wheel)
      expect(onZoom).toHaveBeenCalledOnce()
      const nextViewport = new EventTarget() as HTMLDivElement
      const nextCleanup = ref(nextViewport)!
      nextViewport.dispatchEvent(wheel)
      expect(onZoom).toHaveBeenCalledTimes(2)
      expect(observers[1].observe).toHaveBeenCalledWith(nextViewport)
      nextCleanup()
    } finally { vi.unstubAllGlobals() }
  })

  it("keeps pointer coordinates accurate at 60%, 100% and 300%, and clamps tooltip corners", () => {
    const geometry = createWaferCanvasLayout(waferMapW01Fixture, 400, 10).dieById.values().next().value!
    for (const zoom of [60, 100, 300]) {
      const size = 400 * zoom / 100
      const rect = { left: -50, top: -70, width: size, height: size }
      const point = canvasPointFromClient({ x: rect.left + (geometry.x + geometry.width / 2) / 400 * size, y: rect.top + (geometry.y + geometry.height / 2) / 400 * size }, rect, 400)
      expect(point.x).toBeCloseTo(geometry.x + geometry.width / 2)
      expect(point.y).toBeCloseTo(geometry.y + geometry.height / 2)
    }
    expect(boundedWaferZoom(40)).toBe(60)
    expect(boundedWaferZoom(320)).toBe(300)
    for (const pointer of [{ x: 0, y: 0 }, { x: 990, y: 790 }]) {
      const position = waferTooltipPosition(pointer, { width: 256, height: 180 }, { width: 1000, height: 800 })
      expect(position.left).toBeGreaterThanOrEqual(16)
      expect(position.left + 256).toBeLessThanOrEqual(984)
      expect(position.top).toBeGreaterThanOrEqual(16)
      expect(position.top + 180).toBeLessThanOrEqual(784)
    }
  })

  it("displays invalid controlled class intent without pretending All or emitting a reset", () => {
    const input = waferMapGalleryInputSchema.parse(waferMapGalleryScenarios.defectAggregates.input)
    if (input.kind !== "defect") throw new Error("Expected defect")
    input.selectedDefectTypeIds = ["class:missing"]
    const onChange = vi.fn()
    const html = renderToStaticMarkup(React.createElement(DefectFilterComboboxes, { input, onChange }))
    expect(html).toContain("当前 Layer 不可用 · class:missing")
    expect(onChange).not.toHaveBeenCalled()
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
    expect(unavailable).toContain("均值为零，无法计算")
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
    expect(html).toContain("当前 Layer 全部类型汇总")
    expect(html).toContain("网格外记录：1")
    expect(html).toContain("100.00%")
    expect(html).toContain("300.00%")
    expect(html).toContain("Tested Dies")
    expect(html).not.toContain("类型占比分母为完整缺陷记录")
    expect(html).not.toContain("Particle")
    wafer.dies[0].classBreakdownStatus = "UNAVAILABLE"
    expect(selectedDieRows(input, wafer, "-19:5").items).toContainEqual({ label: "Defect Type", value: "分类明细未提供" })
  })

  it.each([null, 0])("keeps Defect counts but hides Rate when Tested Dies is %s", (testedDieCount) => {
    const input = waferMapGalleryInputSchema.parse(waferMapGalleryScenarios.defectAggregates.input)
    if (input.kind !== "defect") throw new Error("Expected defect input")
    const wafer = input.wafers[0]
    wafer.inspection!.byLayer[0].testedDieCount = testedDieCount
    wafer.inspection!.byLayer[0].rows[0].ratePercent = null
    const html = renderToStaticMarkup(React.createElement(InspectionStatistics, { input, wafer }))
    expect(html).toContain("Rate 不可用")
    expect(html).toContain("Defect Record")
    expect(html).not.toContain("300.00%")
    expect(html).not.toContain("0.00%")
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

  it("keeps Parameter Map defect summary Layer scope and unavailable Map separate from zero", () => {
    const source = waferMapGalleryScenarios.parameterOverview.input
    const input = waferMapGalleryInputSchema.parse({ ...source, mapStates: source.mapStates.slice(0, 3),
      wafers: source.wafers.slice(0, 3).map((wafer, index) => ({ ...wafer,
        defectSummary: waferMapGalleryScenarios.cpDefectSummary.input.wafers[index].defectSummary,
      })),
    })
    if (input.kind !== "cp-parameter") throw new Error("Expected parameter input")
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
