import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { WaferYieldCpFailAnalysis } from "@/components/domain/report-wafer-yield-cp-fail-analysis"
import type { ReportWaferYieldCpFail } from "@/schemas/domain-component-inputs"

const input: ReportWaferYieldCpFail = {
  title: "Yield plot boundary regression",
  failThresholdPercent: 2,
  series: [{ parameter: "FAIL" }],
  wafers: [0, 100, 99.63].map((value, index) => ({
    waferId: `W${index + 1}`,
    step: "BSL",
    condition: "BSL",
    yield: value,
    cpFails: [{ parameter: "FAIL", failedDies: 100, percent: 100 }],
  })),
}

function attribute(tag: string, name: string) {
  const match = tag.match(new RegExp(` ${name}="([^"]+)"`))
  if (!match) throw new Error(`Missing ${name} on ${tag}`)
  return Number(match[1])
}

function renderedPlot() {
  const html = renderToStaticMarkup(React.createElement(WaferYieldCpFailAnalysis, { input }))
  const svg = html.match(/<svg\b[\s\S]*?<\/svg>/)![0]
  return { html, svg, height: attribute(svg, "height") }
}

describe("Yield rendered SVG boundaries", () => {
  it("keeps full 0%, 100% and near-100% markers including their stroke inside the SVG", () => {
    const { svg, height } = renderedPlot()
    const circles = [...svg.matchAll(/<circle\b[^>]*>/g)].map(([tag]) => tag)
    expect(circles).toHaveLength(3)
    for (const circle of circles) {
      const y = attribute(circle, "cy")
      const extent = attribute(circle, "r") + attribute(circle, "stroke-width") / 2
      expect(y - extent).toBeGreaterThanOrEqual(0)
      expect(y + extent).toBeLessThanOrEqual(height)
    }
  })

  it("aligns endpoint markers and 100% bars with the grid and leaves room at both edges", () => {
    const { svg, height } = renderedPlot()
    const grid = [...svg.matchAll(/<line\b[^>]*stroke="var\(--border\)"[^>]*>/g)].map(([tag]) => attribute(tag, "y1"))
    const top = Math.min(...grid)
    const bottom = Math.max(...grid)
    expect(top).toBeGreaterThan(0)
    expect(bottom).toBeLessThan(height)
    const circles = [...svg.matchAll(/<circle\b[^>]*>/g)].map(([tag]) => attribute(tag, "cy"))
    expect(circles[0]).toBe(bottom)
    expect(circles[1]).toBe(top)
    for (const [rect] of svg.matchAll(/<rect\b[^>]*>/g)) {
      expect(attribute(rect, "y")).toBe(top)
      expect(attribute(rect, "y") + attribute(rect, "height")).toBe(bottom)
    }
  })
})
