import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { ReportCpData } from "@/components/domain/report-cp-data"
import { ReportWaferMap } from "@/components/domain/report-wafer-map"
import { ReportParameterMedian } from "@/components/domain/report-parameter-median"
import { groupMatrixRows } from "@/components/domain/report-yield-analysis"
import { WaferMapCard } from "@/components/domain/wafer-map"
import { waferMapGalleryScenarios } from "@/components/domain/wafer-map.scenarios"
import { reportParameterMedianScenarios } from "@/components/domain/report-parameter-median.scenarios"
import { reportYieldAnalysisComparisonFixture } from "@/components/domain/report.fixtures"

describe("POC display fact boundaries", () => {
  it("sorts only inside comparison groups and keeps every member and baseline identity", () => {
    const rows = reportYieldAnalysisComparisonFixture.matrixRows ?? []
    const original = structuredClone(rows)
    const sorted = groupMatrixRows(rows, true)
    const unsorted = groupMatrixRows(rows, false)
    expect(rows).toEqual(original)
    expect(sorted.map((group) => group.groupId)).toEqual(unsorted.map((group) => group.groupId))
    for (let index = 0; index < sorted.length; index++) {
      expect(sorted[index].rows.map((row) => row.memberId).sort()).toEqual(unsorted[index].rows.map((row) => row.memberId).sort())
      const values = sorted[index].rows.filter((row) => row.yield !== null).map((row) => row.yield!)
      expect(values).toEqual([...values].sort((a, b) => a - b))
    }
  })

  it("does not render a fixture plot when controlled CP selection is cleared", () => {
    const html = renderToStaticMarkup(<ReportCpData input={{ selectedParameterId: "BVDSS", parameterOptions: [{ label: "BVDSS", value: "BVDSS" }] }} selection={{ parameterCode: null }} />)
    expect(html).toContain("请选择 CP Parameter")
    expect(html).toContain("combobox")
    expect(html).not.toContain("<canvas")
  })

  it("lets an unselected Parameter Map win over a cached map or loading state", () => {
    const html = renderToStaticMarkup(<ReportWaferMap input={{ mapViews: [], parameterOptions: [{ label: "BVDSS", value: "BVDSS" }], viewStates: [{ view: "cp-parameter", status: "loading" }] }} selection={{ primaryView: "cp", cpView: "parameter", parameterCode: null }} />)
    expect(html).toContain("请选择 CP Parameter")
    expect(html).not.toContain("正在读取")
  })

  it("displays supplied formal capability separately from the Mock OOS fields", () => {
    const html = renderToStaticMarkup(<ReportParameterMedian input={reportParameterMedianScenarios.sourceCapability.input} />)
    expect(html).toContain("SOURCE CPK")
    expect(html).toContain("ZERO_SIGMA")
    expect(html).toContain("Mock LSL")
    expect(html).toContain("1.42")
  })

  it("does not label defect population as CP Pass / Fail", () => {
    const input = waferMapGalleryScenarios.defectOverview.input
    const html = renderToStaticMarkup(<WaferMapCard input={input} wafer={input.wafers[0]} onExpand={() => {}} />)
    expect(html).toContain("无缺陷 Die")
    expect(html).toContain("有缺陷 Die")
    expect(html).not.toContain(">Pass<")
    expect(html).not.toContain(">Fail<")
  })
})
