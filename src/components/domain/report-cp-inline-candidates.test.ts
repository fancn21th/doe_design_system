import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { ReportCpInlineCandidates } from "@/components/domain/report-cp-inline-candidates"
import { reportCpInlineCandidatesFixture } from "@/components/domain/report-cp-inline-candidates.fixtures"
import { reportCpInlineCandidatesScenarios } from "@/components/domain/report-cp-inline-candidates.scenarios"
import { reportCpInlineCandidatesInputSchema, type ReportCpInlineCandidatesInput } from "@/schemas/domain-component-inputs"

function render(input: ReportCpInlineCandidatesInput) {
  return renderToStaticMarkup(createElement(ReportCpInlineCandidates, { input }))
}

describe("ReportCpInlineCandidates contract", () => {
  it("keeps every scenario schema-valid", () => {
    for (const scenario of Object.values(reportCpInlineCandidatesScenarios)) {
      expect(() => reportCpInlineCandidatesInputSchema.parse(scenario.input)).not.toThrow()
    }
  })

  it("renders the supplied upstream order without recomputing score or rank", () => {
    const items = reportCpInlineCandidatesFixture.items.slice(0, 3).reverse()
    const html = render({ ...reportCpInlineCandidatesFixture, items })
    expect(items.map((item) => item.cpParameter)).toEqual(["VGSTX2", "VGSTX3", "kelvinS"])
    const table = html.slice(html.indexOf("<tbody"))
    expect(table.indexOf("VGSTX2")).toBeLessThan(table.indexOf("VGSTX3"))
    expect(table.indexOf("VGSTX3")).toBeLessThan(table.indexOf("kelvinS"))
    expect(html).toContain(items[0].score!.toFixed(1))
    expect(html).not.toContain("View fit")
  })

  it("preserves missing metrics and missing units without displaying zero", () => {
    const item = { ...reportCpInlineCandidatesFixture.items[0], score: null, spearman: null, cpUnit: null }
    const html = render({ ...reportCpInlineCandidatesFixture, items: [item] })
    expect(html).toContain("unit —")
    expect(html).not.toContain("0.00")
    expect(html).not.toContain("0.0</span>")
  })

  it("shows supplied filter evidence without translating it into new algorithm reasons", () => {
    const item = { ...reportCpInlineCandidatesFixture.items[0], level: "LOW" as const, filterReason: null, calculationEvidence: "Saved upstream evidence" }
    const html = render({ ...reportCpInlineCandidatesFixture, filters: { ...reportCpInlineCandidatesFixture.filters, view: "filtered" }, items: [item] })
    expect(html).toContain("Primary Filter Reason")
    expect(html).toContain("Calculation Evidence")
    expect(html).toContain("Saved upstream evidence")
    expect(html).toContain("未达到现有推荐等级")
    expect(html).not.toContain("LOW_FIT")
  })

  it("keeps experiment identity visible when a candidate has no detail", () => {
    const item = { ...reportCpInlineCandidatesFixture.items[0], detailAvailable: false }
    const html = render({ ...reportCpInlineCandidatesFixture, items: [item] })
    expect(html).toContain(item.experimentGroupId)
    expect(html).toContain(item.factorLabel)
    expect(html).toContain("详情不可用")
    expect(html).toMatch(/<button[^>]*disabled[^>]*title=/)
  })

  it("replaces stale rows with loading and error states", () => {
    expect(render({ ...reportCpInlineCandidatesFixture, status: "loading" })).toContain("正在加载报告数据")
    const html = render({ ...reportCpInlineCandidatesFixture, status: "error", errorMessage: "Candidate request failed" })
    expect(html).toContain('role="alert"')
    expect(html).toContain("Candidate request failed")
    expect(html).not.toContain("<tbody")
  })
})
