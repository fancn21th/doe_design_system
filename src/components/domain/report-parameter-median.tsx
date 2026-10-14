"use client"

import { ReportBlock } from "@/components/domain/report-block"

import * as React from "react"

import { reportParameterMedianScenarios } from "@/components/domain/report-parameter-median.scenarios"
import {
  EmptyState,
  ReportBadge,
} from "@/components/domain/report-parts"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import {
  reportParameterMedianInputSchema,
  type ReportParameterMedianCell,
  type ReportParameterMedianInput,
  type ReportParameterMedianRow,
} from "@/schemas/domain-component-inputs"

type ReportParameterMedianProps = {
  input?: ReportParameterMedianInput
  className?: string
  onParameterQueryChange?: (query: string) => void
  onOosOnlyChange?: (showOosOnly: boolean) => void
  onParameterSelect?: (parameter: string) => void
  onWaferCellSelect?: (payload: {
    parameter: string
    waferId: string
    cell: ReportParameterMedianCell
  }) => void
}

const EMPTY_ROWS: ReportParameterMedianRow[] = []

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

// Presentation thresholds approved for this matrix; OOS remains an independent upstream fact.
const CPK_BANDS = {
  bad: { label: "CPK < 1.33", background: "#fdecee", color: "#d70015", border: "#d70015" },
  watch: { label: "1.33 ≤ CPK < 1.67", background: "#fff4e5", color: "#b25000", border: "#b25000" },
  neutral: { label: "CPK ≥ 1.67", background: undefined, color: "#6e6e73", border: "#c7c7cc" },
}

function getCpk(cell: ReportParameterMedianCell) {
  // An explicit unavailable capability must never fall back to a legacy CPK.
  return cell.capability ? cell.capability.cpk : cell.cpk
}

function getCellTone(cell: ReportParameterMedianCell) {
  const cpk = getCpk(cell)
  if (cpk == null || !Number.isFinite(cpk)) return "neutral"
  if (cpk < 1.33) return "bad"
  if (cpk < 1.67) return "watch"
  return "neutral"
}

function CpkLegend() {
  return (
    <div aria-label="CPK 图例" className="flex min-w-0 flex-wrap items-center min-h-[42px] gap-x-3 gap-y-2 text-xs md:justify-end" style={{ color: "#6e6e73" }}>
      {Object.entries(CPK_BANDS).map(([key, band]) => (
        <span key={key} className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: 3, border: `2px solid ${band.border}`, background: "transparent", flexShrink: 0 }} />
          {band.label}
        </span>
      ))}
    </div>
  )
}

function getOosCount(row: ReportParameterMedianRow) {
  return row.oosCount ?? row.wafers.filter((cell) => cell.oos).length
}

function formatParameterValue(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "-"
  }

  const absValue = Math.abs(value)
  if ((absValue > 0 && absValue < 0.0001) || absValue >= 10000) {
    return value.toExponential(5).replace("+", "")
  }

  if (absValue >= 10) {
    return value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "")
  }

  return value.toPrecision(6).replace(/0+$/, "").replace(/\.$/, "")
}

function useDisplayValue<T>(
  value: T,
  onChange: ((nextValue: T) => void) | undefined
) {
  const [localValue, setLocalValue] = React.useState(value)
  const displayValue = onChange ? value : localValue

  const setDisplayValue = React.useCallback(
    (nextValue: T) => {
      if (!onChange) setLocalValue(nextValue)
      onChange?.(nextValue)
    },
    [onChange]
  )

  return [displayValue, setDisplayValue] as const
}

function ParameterMedianFilterBar({
  parameterQuery,
  parameterOptions,
  showOosOnly,
  oosResultCount,
  onParameterQueryChange,
  onOosOnlyChange,
}: {
  parameterQuery: string
  parameterOptions: string[]
  showOosOnly: boolean
  oosResultCount: number
  onParameterQueryChange?: (query: string) => void
  onOosOnlyChange?: (showOosOnly: boolean) => void
}) {
  const inputId = React.useId()
  const checkboxId = React.useId()
  const listId = React.useId()
  const [displayQuery, setDisplayQuery] = useDisplayValue(
    parameterQuery,
    onParameterQueryChange
  )
  const [displayOosOnly, setDisplayOosOnly] = useDisplayValue(
    showOosOnly,
    onOosOnlyChange
  )

  return (
    <FieldGroup className="gap-3">
      <div className="grid gap-3 md:grid-cols-[minmax(16rem,24rem)_auto_minmax(0,1fr)] md:items-end">
        <Field>
          <FieldLabel htmlFor={inputId}>CP Parameter</FieldLabel>
          <Input
            id={inputId}
            type="search"
            value={displayQuery}
            placeholder="All CP Parameters"
            list={listId}
            autoComplete="off"
            onChange={(event) => setDisplayQuery(event.target.value)}
          />
          <datalist id={listId}>
            {parameterOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </Field>

        <Field orientation="horizontal" className="h-8 items-center">
          <Checkbox
            id={checkboxId}
            checked={displayOosOnly}
            onCheckedChange={(checked) => setDisplayOosOnly(Boolean(checked))}
          />
          <FieldContent>
            <FieldLabel htmlFor={checkboxId} className="text-sm">
              仅显示 OOS
            </FieldLabel>
          </FieldContent>
          <ReportBadge tone={displayOosOnly ? "watch" : "neutral"}>
            {oosResultCount}
          </ReportBadge>
        </Field>
        <CpkLegend />

      </div>
    </FieldGroup>
  )
}

function ParameterCell({
  cell,
  parameter,
  onWaferCellSelect,
}: {
  cell: ReportParameterMedianCell | undefined
  parameter: string
  onWaferCellSelect?: ReportParameterMedianProps["onWaferCellSelect"]
}) {
  if (!cell) {
    return <span className="text-muted-foreground">-</span>
  }

  const cpk = getCpk(cell)
  const band = getCellTone(cell)
  const content = (
    <div className="flex min-h-[38px] min-w-0 flex-col items-start justify-center gap-0.5 px-1.5 py-[3px]">
      <span style={{ color: "#0071e3", textDecoration: "underline", textUnderlineOffset: 2, fontWeight: cell.oos ? 700 : 400 }}>
        {formatParameterValue(cell.value)}
      </span>
      <span className="inline-flex min-h-[14px] items-center gap-[5px] whitespace-nowrap" style={{ fontSize: 10, lineHeight: "14px" }}>
        {cell.oos && (
          <span style={{ background: "#b25000", color: "#fff", borderRadius: 4, padding: "1px 5px", fontSize: 10, fontWeight: 700, lineHeight: "14px" }}>OOS</span>
        )}
        <span
          style={{ color: CPK_BANDS[band].color, fontWeight: band === "neutral" ? 400 : 700 }}
          title={cell.capability ? `${cell.capability.specSource} CPK · ${cell.capability.status} · LSL ${formatParameterValue(cell.capability.lsl)} / USL ${formatParameterValue(cell.capability.usl)}` : "输入 CPK"}
        >
          CPK={cpk == null || !Number.isFinite(cpk) ? "—" : cpk.toFixed(2)}
        </span>
      </span>
    </div>
  )

  if (!onWaferCellSelect) return content

  return (
    <button
      type="button"
      className="w-full min-w-0 text-left"
      onClick={() =>
        onWaferCellSelect({ parameter, waferId: cell.waferId, cell })
      }
    >
      {content}
    </button>
  )
}

function ParameterMedianMatrix({
  rows,
  waferIds,
  stickyHeader,
  stickyFirstColumn,
  onParameterSelect,
  onWaferCellSelect,
}: {
  rows: ReportParameterMedianRow[]
  waferIds: string[]
  stickyHeader: boolean
  stickyFirstColumn: boolean
  onParameterSelect?: (parameter: string) => void
  onWaferCellSelect?: ReportParameterMedianProps["onWaferCellSelect"]
}) {
  if (rows.length === 0) {
    return <EmptyState>当前筛选无 CP parameter。</EmptyState>
  }

  const firstColumnClass = stickyFirstColumn
    ? "sticky left-0 z-20 border-r bg-background shadow-[1px_0_0_hsl(var(--border))]"
    : ""
  const headerClass = stickyHeader ? "sticky top-0 z-10 bg-muted/80" : "bg-muted/30"
  const cornerClass =
    stickyHeader && stickyFirstColumn
      ? "sticky left-0 top-0 z-30 border-r bg-muted"
      : cn(headerClass, firstColumnClass)

  return (
    <div
      className="min-w-0 max-w-full max-h-(--doe-parameter-median-matrix-height) overflow-auto rounded-(--doe-radius-control) border"
      role="region"
      aria-label="Parameter Median matrix"
      tabIndex={0}
    >
      <Table className="domain-ui-report-table min-w-(--doe-parameter-median-matrix-min-width) table-fixed border-separate border-spacing-0" style={{ width: 216 + waferIds.length * 144 }}>
        <colgroup>
          <col style={{ width: 160 }} /><col style={{ width: 56 }} />
          {waferIds.map((waferId) => <col key={waferId} style={{ width: 144 }} />)}
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead className={cn("whitespace-normal break-all", cornerClass)}>
              CP Parameter
            </TableHead>
            <TableHead className={cn("whitespace-normal", headerClass)}>
              Unit
            </TableHead>
            {waferIds.map((waferId) => (
              <TableHead
                key={waferId}
                className={cn("whitespace-normal", headerClass)}
              >
                {waferId}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const cellsByWafer = new Map(
              row.wafers.map((cell) => [cell.waferId, cell])
            )
            return (
              <TableRow key={row.parameter}>
                <TableCell className={cn("whitespace-normal break-all", firstColumnClass)}>
                  {onParameterSelect ? (
                    <button
                      type="button"
                      className="font-mono text-sm font-semibold text-sky-700 underline-offset-2 hover:underline"
                      onClick={() => onParameterSelect(row.parameter)}
                    >
                      {row.parameter}
                    </button>
                  ) : (
                    <span className="font-mono text-sm font-semibold text-sky-700">
                      {row.parameter}
                    </span>
                  )}
                </TableCell>
                <TableCell className="whitespace-normal">{row.unit}</TableCell>
                {waferIds.map((waferId) => {
                  const cell = cellsByWafer.get(waferId)
                  const tone = cell ? getCellTone(cell) : "neutral"

                  return (
                    <TableCell
                      key={waferId}
                      aria-label={cell?.oos ? `${row.parameter} · ${waferId} · OOS` : undefined}
                      title={cell ? `${row.parameter} · ${waferId} · Source LSL ${formatParameterValue(cell.lsl)} / USL ${formatParameterValue(cell.usl)}` : undefined}
                      className="whitespace-normal"
                      style={{ backgroundColor: CPK_BANDS[tone].background }}
                    >
                      <ParameterCell
                        cell={cell}
                        parameter={row.parameter}
                        onWaferCellSelect={onWaferCellSelect}
                      />
                    </TableCell>
                  )
                })}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export function ReportParameterMedian({
  input = reportParameterMedianScenarios.normal.input,
  className,
  onParameterQueryChange,
  onOosOnlyChange,
  onParameterSelect,
  onWaferCellSelect,
}: ReportParameterMedianProps) {
  const scenarioInput = reportParameterMedianScenarios.normal.input
  const parsedInput = reportParameterMedianInputSchema.parse(input)
  const rows = parsedInput.rows ?? scenarioInput.rows ?? EMPTY_ROWS
  const waferIds = unique(
    parsedInput.waferIds ??
      scenarioInput.waferIds ??
      rows.flatMap((row) => row.wafers.map((wafer) => wafer.waferId))
  )
  const parameterQuery =
    parsedInput.parameterQuery ?? parsedInput.selectedParameterId ?? ""
  const parameterOptions = unique(
    parsedInput.parameterOptions ??
      scenarioInput.parameterOptions ??
      rows.map((row) => row.parameter)
  )
  const showOosOnly = Boolean(
    parsedInput.showOosOnly ?? scenarioInput.showOosOnly
  )
  const oosResultCount =
    parsedInput.oosResultCount ??
    scenarioInput.oosResultCount ??
    rows.filter((row) => getOosCount(row) > 0).length
  const stickyHeader = parsedInput.stickyHeader ?? true
  const stickyFirstColumn = parsedInput.stickyFirstColumn ?? true

  return (
    <div className={className}>
      {rows.length === 0 ? (
        <EmptyState>暂无 Parameter Median 数据</EmptyState>
      ) : (
        <div className="domain-ui-typography domain-ui-report-pane grid min-w-0 gap-4 p-4">
          <ReportBlock input={{ id: "cp-parameter-analysis", title: "CP Parameter Analysis", helpText: "按 CP 参数对比各 Wafer 的中位数和规格状态，可搜索参数或仅显示 OOS；中位数超限按每片 Wafer 的 Source Spec 判断，背景颜色表示 Source CPK 等级；无规格时不可评估。" }}>
          <ParameterMedianFilterBar
            parameterQuery={parameterQuery}
            parameterOptions={parameterOptions}
            showOosOnly={showOosOnly}
            oosResultCount={oosResultCount}
            onParameterQueryChange={onParameterQueryChange}
            onOosOnlyChange={onOosOnlyChange}
          />
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <ReportBadge tone="neutral">
              Parameter: {parameterQuery || "All"}
            </ReportBadge>
            <ReportBadge tone={showOosOnly ? "watch" : "neutral"}>
              OOS only: {showOosOnly ? "On" : "Off"}
            </ReportBadge>
            <span>
              {rows.length} 个参数 · {waferIds.length} 片 Wafer
            </span>
          </div>
          <ParameterMedianMatrix
            rows={rows}
            waferIds={waferIds}
            stickyHeader={stickyHeader}
            stickyFirstColumn={stickyFirstColumn}
            onParameterSelect={onParameterSelect}
            onWaferCellSelect={onWaferCellSelect}
          />
          </ReportBlock>
        </div>
      )}
    </div>
  )
}
