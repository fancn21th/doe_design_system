import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { ReportOverview } from "./report-overview"
import { reportOverviewFixture } from "./report.fixtures"

const render = (input?: React.ComponentProps<typeof ReportOverview>["input"]) => renderToStaticMarkup(<ReportOverview input={input} />)

describe("Overview presentation", () => {
  it.each([undefined, {}, { metrics: [] }])("never substitutes demo data for missing fields", (input) => {
    const html = render(input)
    expect(html).not.toMatch(/AF01112|S0269A|99.63|91.36|TR CD/)
    expect(html).toContain("暂无实验基础信息")
    expect(html).toContain("暂无指标数据")
    expect(html).not.toContain("Δ vs BSL")
    expect(html).toContain("暂无记录")
  })
  it("keeps partial identities empty without dropping supplied metrics", () => {
    const html = render({ metrics: [{ label: "Wafer Count", value: "0", tone: "neutral" }] })
    expect(html).toContain("Wafer Count")
    expect(html).not.toContain("AF01112")
  })
  it("renders the approved reading order, wafer disclosure and semantic modules", () => {
    const html = render(reportOverviewFixture)
    const labels = ["Round Weighted Yield", "Median Wafer Yield", "Average Wafer Yield", "Wafer Count"]
    const positions = labels.map((label) => html.indexOf(`>${label}<`))
    expect(positions.every((position) => position >= 0)).toBe(true)
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
    expect(html).not.toContain("Abnormal Wafer Count")
    expect(html).toContain("AF01112.25")
    expect(html).toContain("<summary")
    expect(html).toContain('aria-expanded="true"')
    expect(html).toContain("Round Weighted Yield 统计口径")
    expect(html).not.toContain("Top Fail Groups")
    expect(html).not.toContain("Baseline 中位良率 99.51%")
  })
  it("omits removed insight cards and anomaly table even when data is supplied", () => {
    const html = render({
      ...reportOverviewFixture, assessmentNote: "部分可评估：2 片尚不能确定是否异常",
      anomalyRows: [{ splitGroup: "etch", waferId: "NO_YIELD", yield: null, cpSummary: "Source median OOS: BVDSS", tone: "bad" }],
    })
    expect(html).not.toContain("NO_YIELD")
    expect(html).not.toContain("Source median OOS: BVDSS")
    for (const title of ["Top Yield Loss", "Top CP OOS Parameters", "Top Fail Groups", "Split Table × 异常 Yield / Source OOS"]) expect(html).not.toContain(title)
    expect(html).toContain("部分可评估")
    expect(html).not.toContain("NaN")
  })
  it("uses explicit badge facts rather than making zero or unknown critical", () => {
    const html = render({ metrics: [{ label: "Abnormal Wafer Count", value: "0", badge: "待评估", tone: "neutral" }] })
    expect(html).toContain("待评估")
    expect(html).not.toContain("重点关注")
  })
})
