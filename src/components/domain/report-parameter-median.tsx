"use client"

import * as React from "react"

import { reportParameterMedianScenarios } from "@/components/domain/report-parameter-median.scenarios"
import {
  EmptyState,
  ReportBadge,
  ReportCard,
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
  type ReportTone,
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

function getCpkTone(cell: ReportParameterMedianCell): ReportTone {
  if (cell.oos) return "bad"
  if (cell.cpk === null || cell.cpk === undefined) return "neutral"
  if (cell.cpk < 1.33) return "bad"
  if (cell.cpk < 1.67) return "watch"
  return "good"
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

function formatCpk(cpk: number | null | undefined) {
  if (cpk === null || cpk === undefined || !Number.isFinite(cpk)) return "-"
  return cpk.toFixed(2)
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
    <FieldGroup className="gap-3 rounded-lg border bg-muted/20 p-3">
      <div className="grid gap-3 md:grid-cols-[minmax(16rem,24rem)_auto_1fr] md:items-end">
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

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <ReportBadge tone="bad">CPK &lt; 1.33</ReportBadge>
          <ReportBadge tone="watch">1.33 &lt;= CPK &lt; 1.67</ReportBadge>
          <ReportBadge tone="good">CPK &gt;= 1.67</ReportBadge>
        </div>
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

  const content = (
    <div className="flex min-h-10 flex-col justify-center gap-1">
      <span className="font-mono text-xs font-semibold text-sky-700">
        {formatParameterValue(cell.value)}
      </span>
      <span className="flex items-center gap-1.5 text-[10px] leading-none text-muted-foreground">
        {cell.oos && (
          <span className="rounded bg-amber-600 px-1 py-0.5 text-[9px] font-bold text-white">
            OOS
          </span>
        )}
        <span>CPK={formatCpk(cell.cpk)}</span>
      </span>
    </div>
  )

  if (!onWaferCellSelect) return content

  return (
    <button
      type="button"
      className="w-full text-left"
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
      className="max-h-[34rem] overflow-auto rounded-lg border"
      role="region"
      aria-label="Parameter Median matrix"
      tabIndex={0}
    >
      <Table className="min-w-[240rem] border-separate border-spacing-0 text-xs">
        <TableHeader>
          <TableRow>
            <TableHead className={cn("w-44 min-w-44", cornerClass)}>
              CP Parameter
            </TableHead>
            <TableHead className={cn("w-20 min-w-20", headerClass)}>
              Unit
            </TableHead>
            <TableHead className={cn("w-28 min-w-28", headerClass)}>
              Mock LSL
            </TableHead>
            <TableHead className={cn("w-28 min-w-28", headerClass)}>
              Mock USL
            </TableHead>
            {waferIds.map((waferId) => (
              <TableHead
                key={waferId}
                className={cn("w-32 min-w-32", headerClass)}
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
            const oosCount = getOosCount(row)

            return (
              <TableRow key={row.parameter}>
                <TableCell className={cn("w-44 min-w-44", firstColumnClass)}>
                  {onParameterSelect ? (
                    <button
                      type="button"
                      className="font-mono text-xs font-semibold text-sky-700 underline-offset-2 hover:underline"
                      onClick={() => onParameterSelect(row.parameter)}
                    >
                      {row.parameter}
                    </button>
                  ) : (
                    <span className="font-mono text-xs font-semibold text-sky-700">
                      {row.parameter}
                    </span>
                  )}
                  {oosCount > 0 && (
                    <span className="ml-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                      OOS · {oosCount}
                    </span>
                  )}
                </TableCell>
                <TableCell className="w-20 min-w-20">{row.unit}</TableCell>
                <TableCell className="w-28 min-w-28 font-mono text-xs">
                  {formatParameterValue(row.lsl)}
                </TableCell>
                <TableCell className="w-28 min-w-28 font-mono text-xs">
                  {formatParameterValue(row.usl)}
                </TableCell>
                {waferIds.map((waferId) => {
                  const cell = cellsByWafer.get(waferId)
                  const tone = cell ? getCpkTone(cell) : "neutral"

                  return (
                    <TableCell
                      key={waferId}
                      className={cn(
                        "w-32 min-w-32",
                        tone === "bad" && "bg-red-50",
                        tone === "watch" && "bg-amber-50"
                      )}
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
    <ReportCard
      title={parsedInput.title ?? scenarioInput.title ?? "Parameter Median"}
      subtitle={parsedInput.subtitle ?? scenarioInput.subtitle}
      sourceLabel={parsedInput.sourceLabel ?? scenarioInput.sourceLabel}
      className={className}
    >
      {rows.length === 0 ? (
        <EmptyState>暂无 Parameter Median 数据</EmptyState>
      ) : (
        <div className="grid gap-3 p-4">
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
              Rendering {rows.length} injected parameters across {waferIds.length} wafers
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
        </div>
      )}
    </ReportCard>
  )
}
