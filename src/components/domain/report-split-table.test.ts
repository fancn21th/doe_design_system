import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import {
  ReportSplitTable,
  ReportSplitTableWaferLink,
  formatSplitTableYield,
  getReportSplitTableStepOptions,
  getReportSplitTableTopFails,
  groupReportSplitTableRows,
} from "@/components/domain/report-split-table"
import {
  reportSplitTableRowSchema,
  type ReportSplitTableRow,
} from "@/schemas/domain-component-inputs"

function row(
  waferId: string,
  role: string,
  condition: string,
  overrides: Partial<ReportSplitTableRow> = {}
): ReportSplitTableRow {
  return {
    waferId,
    role,
    stage: "Etch",
    step: "TR Depth",
    seq: "seq-num-001",
    recipe: condition,
    condition,
    yield: 99.5,
    topFail: "Default",
    topFailCount: 1,
    tone: "good",
    ...overrides,
  }
}

describe("ReportSplitTable grouping", () => {
  it("renders a wafer action in the real table and invokes it with full assignment context", () => {
    const inputRow = row("W01", "BSL", "5um")
    const callback = vi.fn()
    const action = ReportSplitTableWaferLink({ row: inputRow, onWaferSelect: callback })
    expect(action.type).toBe("button")
    action.props.onClick()
    expect(callback).toHaveBeenCalledExactlyOnceWith(inputRow)
    const html = renderToStaticMarkup(React.createElement(ReportSplitTable, { input: { rows: [inputRow] }, onWaferSelect: callback }))
    expect(html).toContain('title="查看 W01 Yield Analysis"')
    expect(ReportSplitTableWaferLink({ row: inputRow }).type).toBe("b")
  })

  it("keeps unavailable Yield distinct from real zero", () => {
    const unavailable = reportSplitTableRowSchema.parse(row("W01", "BSL", "BSL", {
      yield: null,
      tone: "neutral",
    }))

    expect(unavailable.yield).toBeNull()
    expect(formatSplitTableYield(unavailable.yield)).toBe("Unavailable")
    expect(formatSplitTableYield(0)).toBe("0.00%")
  })

  it("groups by stage, step, and seq with baseline first and labels by condition", () => {
    const groups = groupReportSplitTableRows([
      row("W04", "candidate", "4.5um"),
      row("W05", "candidate", "5.5um"),
      row("W06", "candidate", "4.5um"),
      row("W01", "BSL", "5um"),
      row("W07", "candidate", "4.75um", { seq: "seq-num-002" }),
    ])

    expect(groups).toHaveLength(2)
    expect(groups[0].rows.map(({ row, roleLabel }) => [row.waferId, roleLabel]))
      .toEqual([
        ["W01", "BSL"],
        ["W04", "split-1"],
        ["W05", "split-2"],
        ["W06", "split-1"],
      ])
    expect(groups[1].rows[0].roleLabel).toBe("split-1")
  })

  it("uses multiple source-provided CP top fails before the legacy single value", () => {
    const input = row("W12", "split", "1.08um", {
      topFail: "IGSSP1",
      topFailCount: 2996,
      topFails: [
        { parameter: "IGSSP1", count: 2996 },
        { parameter: "IGSSPSC", count: 97 },
      ],
    })

    expect(getReportSplitTableTopFails(input)).toEqual(input.topFails)
  })

  it("preserves authoritative Step facets instead of deriving counts from rows", () => {
    expect(getReportSplitTableStepOptions(
      [{ step: "CPX-S01", stepSequence: 1, sourceCount: 25, displayCount: 5 }],
      ["fallback-step"]
    )).toEqual([{
      label: "CPX-S01",
      value: "CPX-S01",
      sourceCount: 25,
      displayCount: 5,
    }])
  })
})
