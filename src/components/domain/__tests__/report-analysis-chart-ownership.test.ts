import { describe, expect, it } from "vitest"

import { reportSplitTableScenarios } from "@/components/domain/report-split-table.scenarios"
import { reportYieldAnalysisScenarios } from "@/components/domain/report-yield-analysis.scenarios"

describe("report analysis chart ownership", () => {
  it("places Wafer Yield & CP Fail Analysis in Yield Analysis", () => {
    expect(
      reportYieldAnalysisScenarios.normal.input.yieldCpFailAnalysis?.title
    ).toBe("Wafer Yield & CP Fail Analysis")
  })

  it("keeps Split Table focused on filters and grouped rows", () => {
    expect(
      "yieldCpFailAnalysis" in reportSplitTableScenarios.normal.input
    ).toBe(false)
  })
})
