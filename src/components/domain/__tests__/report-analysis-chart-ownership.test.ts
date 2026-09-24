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

  it("uses stable matrix identities independently of repeated physical wafer ids", () => {
    const rows = reportYieldAnalysisScenarios.normal.input.matrixRows ?? []
    const duplicateWafer = rows[0]
    const repeatedRows = [
      duplicateWafer,
      { ...duplicateWafer, rowId: `${duplicateWafer.rowId}-repeat` },
    ]

    expect(new Set(repeatedRows.map((row) => row.rowId))).toHaveLength(2)
    expect(new Set(repeatedRows.map((row) => row.waferId))).toHaveLength(1)
  })

  it("renders the accepted comparison fixture cardinalities", () => {
    expect(reportYieldAnalysisScenarios.normal.input.wafers).toHaveLength(25)
    expect(reportYieldAnalysisScenarios.normal.input.matrixRows).toHaveLength(35)
    expect(reportYieldAnalysisScenarios.normal.input.conditionYieldRows).toHaveLength(34)
  })
})
