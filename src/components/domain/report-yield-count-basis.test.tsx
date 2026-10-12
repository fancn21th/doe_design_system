import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { ReportYieldAnalysis } from "@/components/domain/report-yield-analysis"
import { reportYieldAnalysisComparisonFixture } from "@/components/domain/report.fixtures"

describe("Yield Matrix GOOD / Tested display", () => {
  function render(goodDies: number | null | undefined) {
    const row = { ...reportYieldAnalysisComparisonFixture.matrixRows![0], goodDies, passDies: 19, testedDies: 20 }
    return renderToStaticMarkup(<ReportYieldAnalysis input={{ matrixRows: [row], matrixColumns: [], stageOptions: [row.stage], selectedDetailMode: "wafer-cp-matrix" }} />)
  }

  it("shows independent GOOD when it differs from SBIN PASS", () => {
    const html = render(17)
    expect(html).toContain("Good / Tested Dies")
    expect(html).toContain(">17 / 20</td>")
    expect(html).not.toContain(">19 / 20</td>")
  })

  it("keeps missing GOOD missing and preserves real zero", () => {
    for (const missing of [null, undefined]) {
      const html = render(missing)
      expect(html).toContain(">— / 20</td>")
      expect(html).not.toContain(">19 / 20</td>")
    }
    expect(render(0)).toContain(">0 / 20</td>")
  })
})
