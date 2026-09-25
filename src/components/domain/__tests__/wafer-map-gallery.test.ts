import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import {
  DEFAULT_FINAL_BIN_PALETTE,
  createWaferCanvasLayout,
  finalBinColor,
  parameterColor,
} from "@/components/domain/wafer-map-model"
import { waferMapW01Fixture } from "@/components/domain/wafer-map.fixtures"
import { waferMapGalleryScenarios } from "@/components/domain/wafer-map.scenarios"
import { WaferMapCard } from "@/components/domain/wafer-map"
import {
  reportWaferMapInputSchema,
  waferMapGalleryInputSchema,
  waferMapMapStateSchema,
} from "@/schemas/domain-component-inputs"
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
    expect(parameter.wafers[0].inspection?.rows.reduce((sum, row) => sum + row.count, 0)).toBe(4099)
    expect(defect.wafers[0].inspection?.byLayer.map((item) => item.layerId)).toEqual(["M1", "M2"])
  })

  it("accepts drawable maps without inspection statistics instead of deriving them", () => {
    const parameter = waferMapGalleryInputSchema.parse(waferMapGalleryScenarios.inspectionUnavailable.input)
    if (parameter.kind !== "cp-parameter") throw new Error("Expected parameter map input")

    expect(parameter.wafers[0].dies).toHaveLength(4099)
    expect(parameter.wafers[0].summary).toEqual({ pass: 4075, fail: 24 })
    expect(parameter.wafers[0].inspection).toBeUndefined()
    expect(parameter.wafers[0].inspectionUnavailableReason).toBe("BFF 尚未提供 CP × Defect 分类统计。")
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
      const input = structuredClone(source)
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
      const input = structuredClone(source)
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
