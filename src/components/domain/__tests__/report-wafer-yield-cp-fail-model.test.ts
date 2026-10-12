import { describe, expect, it } from "vitest"

import {
  groupConsecutiveWaferSteps,
  visibleCpFailParameters,
  visibleCpFails,
  waferYieldPlotGeometry,
} from "@/components/domain/report-wafer-yield-cp-fail-model"
import type { ReportWaferYieldCpFail } from "@/schemas/domain-component-inputs"

const input: ReportWaferYieldCpFail = {
  title: "Wafer Yield & CP Fail Analysis",
  failThresholdPercent: 2,
  series: [
    { parameter: "VGSTX1" },
    { parameter: "IGSSP1" },
    { parameter: "IGSSPSC" },
  ],
  wafers: [
    {
      waferId: "W01",
      step: "BSL",
      condition: "BSL",
      yield: 99.63,
      cpFails: [
        { parameter: "VGSTX1", failedDies: 82, percent: 2 },
      ],
    },
    {
      waferId: "W10",
      step: "LOX",
      condition: "4200A",
      yield: 62.43,
      cpFails: [
        { parameter: "VGSTX1", failedDies: 1005, percent: 24.52 },
      ],
    },
    {
      waferId: "W12",
      step: "LOX",
      condition: "1.08um",
      yield: 23.69,
      cpFails: [
        { parameter: "IGSSP1", failedDies: 2996, percent: 73.09 },
        { parameter: "IGSSPSC", failedDies: 97, percent: 2.37 },
      ],
    },
  ],
}

describe("report wafer yield and CP fail model", () => {
  it("uses a strict greater-than threshold", () => {
    expect(visibleCpFails(input.wafers[0], 2)).toEqual([])
    expect(visibleCpFails(input.wafers[1], 2)).toHaveLength(1)
  })

  it("keeps visible parameter legend order from the input series", () => {
    expect(visibleCpFailParameters(input)).toEqual([
      "VGSTX1",
      "IGSSP1",
      "IGSSPSC",
    ])
  })

  it("groups only consecutive wafers with the same step", () => {
    expect(groupConsecutiveWaferSteps(input.wafers)).toEqual([
      { step: "BSL", startIndex: 0, count: 1 },
      { step: "LOX", startIndex: 1, count: 2 },
    ])
  })

  it("preserves unavailable CP fail rates instead of treating them as zero", () => {
    const wafer = {
      ...input.wafers[0],
      cpFails: [
        { parameter: "VGSTX1", failedDies: null, percent: null },
      ],
    }

    expect(visibleCpFails(wafer, 2)).toEqual([])
  })
})


describe("Yield responsive plot geometry", () => {
  it("fills both smaller and larger desktop containers for 25 wafers", () => {
    for (const width of [570, 866, 1300]) {
      const plot = waferYieldPlotGeometry(width, 25, false)
      expect(plot.width).toBe(width)
      expect(plot.columnWidth * 25).toBeCloseTo(width)
      expect(plot.barWidth).toBeLessThan(plot.columnWidth)
    }
  })
  it("keeps 44px columns only when the narrow viewport needs scrolling", () => {
    expect(waferYieldPlotGeometry(286, 25, true).width).toBe(1100)
    expect(waferYieldPlotGeometry(500, 3, true).width).toBe(500)
  })
  it("does not leave columns wider than the plot after a resize", () => {
    const before = waferYieldPlotGeometry(1300, 25, false)
    const after = waferYieldPlotGeometry(570, 25, false)
    expect(after.columnWidth).toBeLessThan(before.columnWidth)
    expect(after.columnWidth * 24.5 + after.barWidth / 2).toBeLessThan(after.width)
  })
  it("has a finite pre-measurement and empty-population layout", () => {
    for (const width of [0, Number.NaN]) {
      const plot = waferYieldPlotGeometry(width, 0, false)
      expect(Number.isFinite(plot.columnWidth)).toBe(true)
      expect(plot.width).toBeGreaterThan(0)
    }
  })
})
