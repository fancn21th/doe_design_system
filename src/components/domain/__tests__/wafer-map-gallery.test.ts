import { describe, expect, it } from "vitest"

import {
  DEFAULT_FINAL_BIN_PALETTE,
  createWaferCanvasLayout,
  finalBinColor,
  parameterColor,
} from "@/components/domain/wafer-map-model"
import { waferMapW01Fixture } from "@/components/domain/wafer-map.fixtures"
import { waferMapGalleryScenarios } from "@/components/domain/wafer-map.scenarios"
import { waferMapGalleryInputSchema } from "@/schemas/domain-component-inputs"

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
})
