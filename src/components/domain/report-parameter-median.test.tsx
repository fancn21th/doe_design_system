import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { ReportParameterMedian } from "@/components/domain/report-parameter-median"
import { reportParameterMedianFixture } from "@/components/domain/report.fixtures"
import type { ReportParameterMedianCell } from "@/schemas/domain-component-inputs"

function renderCell(overrides: Partial<ReportParameterMedianCell>) {
  const row = reportParameterMedianFixture.rows![0]
  const html = renderToStaticMarkup(<ReportParameterMedian input={{
    ...reportParameterMedianFixture,
    rows: [{ ...row, wafers: [{ waferId: "W_TEST", value: 1, tone: "neutral", ...overrides }] }],
    waferIds: ["W_TEST"],
  }} />)
  const cell = html.match(/<td\b[^>]*>[\s\S]*?<\/td>/g)!.at(-1)!
  return { html, cell }
}

describe("Parameter Median CPK presentation", () => {
  it.each([
    [-0.2, "#fdecee", "#d70015"],
    [0, "#fdecee", "#d70015"],
    [1.3299999, "#fdecee", "#d70015"],
    [1.33, "#fff4e5", "#b25000"],
    [1.6699999, "#fff4e5", "#b25000"],
    [1.67, null, "#6e6e73"],
    [2, null, "#6e6e73"],
    [null, null, "#6e6e73"],
    [undefined, null, "#6e6e73"],
  ])("uses unrounded CPK %s for the band", (cpk, background, text) => {
    const { cell } = renderCell({ cpk })
    if (background) expect(cell).toContain(background)
    else expect(cell).not.toMatch(/#fdecee|#fff4e5/g)
    expect(cell).toContain(text)
    if (cpk == null) expect(cell).toContain("—")
  })

  it("preserves OOS independently of CPK color without yield context", () => {
    const { html, cell } = renderCell({ cpk: 2, oos: true, failLinked: true })
    expect(cell).toContain(">OOS</span>")
    expect(cell).not.toContain("YIELD context")
    expect(cell).not.toContain("中位数")
    expect(cell).not.toMatch(/#fdecee|#fff4e5/g)
    expect(html).toContain("仅显示 OOS")
    expect(html).not.toContain(">OOS</th>")
  })

  it("keeps unavailable CPK compact and removes all Mock columns", () => {
    const { html, cell } = renderCell({ value: null, oos: null, oosStatus: "NOT_EVALUABLE", oosReason: "NO_SOURCE_SPEC" })
    expect(cell).not.toContain("不可评估")
    expect(cell).toContain("CPK=—")
    expect(cell).not.toContain("中位数超限：不可评估")
    expect(cell).not.toContain(">OOS</span>")
    expect(html).not.toMatch(/Mock LSL|Mock USL|Mock Spec/)
  })

  it("shows each wafer's captured source bounds", () => {
    const { cell } = renderCell({ lsl: 85, usl: null, oos: false })
    expect(cell).toContain("Source LSL 85 / USL -")
    expect(cell).not.toContain("中位数未超限")
  })

  it("shows matching legend labels without a missing-value explanation", () => {
    const { html } = renderCell({ cpk: 1 })
    expect(html).not.toContain("无数据或不可计算")
    expect(html).toContain("border-radius:3px")
    expect(html).toContain("background:transparent")
    for (const label of ["CPK 图例", "CPK &lt; 1.33", "1.33 ≤ CPK &lt; 1.67", "CPK ≥ 1.67"]) {
      expect(html).toContain(label)
    }
  })

  it.each([null, 1.4])("prefers source capability %s over legacy CPK", (cpk) => {
    const { cell } = renderCell({ cpk: 0.5, capability: {
      cpk, status: cpk === null ? "ZERO_SIGMA" : "AVAILABLE", specSource: "SOURCE",
      lsl: null, usl: 3, mean: 1, sampleSigma: 0, n: 10,
    } })
    expect(cell).toContain("SOURCE CPK")
    expect(cell).not.toContain("#fdecee")
    if (cpk === null) {
      expect(cell).toContain("—")
      expect(cell).toContain("ZERO_SIGMA")
      expect(cell).not.toContain("#fff4e5")
    } else expect(cell).toContain("#fff4e5")
  })
})
