import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { ReportCpInlineFit } from "@/components/domain/report-cp-inline-fit"
import { reportCpInlinePrototypeFitFixture } from "@/components/domain/report-cp-inline-fit.fixtures"
import { reportCpInlineFitScenarios } from "@/components/domain/report-cp-inline-fit.scenarios"
import {
  formatReportCpInlineValue,
  formatReportCpInlineMeasurementValue,
  reportCpInlineSpecEntries,
  reportCpInlineYDomain,
  visibleReportCpInlineModels,
} from "@/components/domain/report-cp-inline-model"
import { reportCpInlineFitInputSchema, type ReportCpInlineFitInput } from "@/schemas/domain-component-inputs"

function render(input: ReportCpInlineFitInput) {
  return renderToStaticMarkup(createElement(ReportCpInlineFit, { input }))
}

describe("CP × Inline Fit evidence", () => {
  it("keeps Fit scenarios schema-valid", () => {
    for (const scenario of Object.values(reportCpInlineFitScenarios)) {
      expect(() => reportCpInlineFitInputSchema.parse(scenario.input)).not.toThrow()
    }
  })

  it("preserves the scientific exponent and never replaces missing data with zero", () => {
    expect(formatReportCpInlineValue(1.9859e-10)).toBe("1.9859e-10")
    expect(formatReportCpInlineValue(9.5992e-8)).toBe("9.5992e-8")
    expect(formatReportCpInlineValue(-1.9425e-12)).toBe("-1.9425e-12")
    expect(formatReportCpInlineValue(0.745308, 6)).toBe("0.745308")
    expect(formatReportCpInlineValue(0.0008, 1)).not.toBe("0.0")
    expect(formatReportCpInlineValue(null)).toBe("—")
    expect(formatReportCpInlineValue(undefined)).toBe("—")
    expect(formatReportCpInlineValue(0)).toBe("0.0000")
    expect(formatReportCpInlineMeasurementValue(0.03168)).toBe("0.031680")
    expect(formatReportCpInlineMeasurementValue(0.03174)).toBe("0.031740")
  })

  it("renders the two requested sections and all three wafer metrics", () => {
    const markup = render(reportCpInlinePrototypeFitFixture)
    expect(markup).toContain("Wafer Pair明细")
    expect(markup).toContain("Wafer Scatter &amp; Fits")
    expect(markup).toContain("Inline Median × CP Median")
    expect(markup).toContain("Inline Median × CP Min")
    expect(markup).toContain("Inline Median × CP Max")
    expect(markup).toContain("9.5992e-8")
    expect(markup).toContain("Residual N 6")
    expect(markup).toContain("Pearson r")
    expect(markup).toContain("Spearman ρ")
    expect(markup).toContain("Fit × Spec 交点坐标")
    expect(markup).not.toContain("Leave-One-Out")
    expect(markup).not.toContain("Control Window")
  })

  it("keeps linear and quadratic curve visibility independent", () => {
    const models = reportCpInlinePrototypeFitFixture.fitPanels[0].models
    expect(visibleReportCpInlineModels(models, { linear: false, quadratic: true }).map((model) => model.kind)).toEqual(["quadratic"])
    expect(visibleReportCpInlineModels(models, { linear: true, quadratic: false }).map((model) => model.kind)).toEqual(["linear"])
    expect(visibleReportCpInlineModels(models, { linear: false, quadratic: false })).toEqual([])
  })

  it("uses upstream availability even with fewer than three paired wafers", () => {
    const input = reportCpInlineFitScenarios.upstreamAvailableSmallSample.input
    expect(input.waferPairs).toHaveLength(2)
    const markup = render(input)
    expect(markup).toContain("Residual N 2")
    expect(markup).toContain("隐藏 Linear Fit 曲线")
    expect(markup).toContain(input.fitPanels[0].models[0].equation)
    expect(visibleReportCpInlineModels(input.fitPanels[0].models, { linear: true, quadratic: true }).map((model) => model.kind)).toEqual(["linear"])
  })

  it("displays supplied roots with domain labels and all configured specifications", () => {
    const input = reportCpInlineFitScenarios.configuredSpec.input
    expect(reportCpInlineSpecEntries(input.spec)).toEqual([
      { kind: "target", value: 0.03174 },
      { kind: "lsl", value: 0.001 },
      { kind: "usl", value: 0.08000001 },
    ])
    const markup = render(input)
    expect(markup).toContain("Linear × TARGET")
    expect(markup).toContain("观测域内")
    expect(markup).toContain("观测域外")
    expect(markup).toContain("X 5.6410")
    expect(markup).toContain("source-provisional")
  })

  it("preserves missing-side coverage and upstream unavailable evidence", () => {
    const markup = render(reportCpInlineFitScenarios.coverageMismatch.input)
    expect(markup).toContain("仅 Inline 数据")
    expect(markup).toContain("仅 CP 数据")
    expect(markup).toContain("无量测数据")
    expect(markup).toContain("—")
    const unavailable = render(reportCpInlineFitScenarios.insufficient.input)
    expect(unavailable).toContain("上游未提供可用拟合")
    expect(unavailable).toContain("Wafer Pair明细")
    expect(unavailable).toContain("不可用")
    expect(reportCpInlineSpecEntries(undefined)).toEqual([])
  })
})


describe("CP small-scale measurement regression", () => {
  it("retains distinct CP Max values instead of rounding all to 0.000300", () => {
    const values = [0.0003000092, 0.0003000067, 0.000300029]
    expect(new Set(values.map(formatReportCpInlineMeasurementValue)).size).toBe(3)
    for (const value of values) expect(Number(formatReportCpInlineMeasurementValue(value))).toBe(value)
  })
})


describe("CP measured-scale chart range", () => {
  it("includes observations and supplied visible curves with a small margin", () => {
    const [low, high] = reportCpInlineYDomain([{ y: 2.76e-8 }, { y: 3.26e-8 }], [{ series: [{ x: 18, y: 2.75e-8 }, { x: 203, y: 3.3e-8 }] }])
    expect(low).toBeLessThan(2.75e-8)
    expect(high).toBeGreaterThan(3.3e-8)
    expect(high - low).toBeLessThan(1e-8)
    const max = reportCpInlineYDomain([{ y: 0.0003000092 }, { y: 0.000300029 }], [])
    expect(max[1] - max[0]).toBeLessThan(3e-8)
  })
  it("handles empty, zero, constant, negative and nonfinite display values", () => {
    expect(reportCpInlineYDomain([], [])).toEqual([0, 1])
    expect(reportCpInlineYDomain([{ y: NaN }], [])).toEqual([0, 1])
    for (const value of [0, -3e-8, 3e-8]) {
      const [low, high] = reportCpInlineYDomain([{ y: value }], [])
      expect(low).toBeLessThan(value)
      expect(high).toBeGreaterThan(value)
    }
  })
})
