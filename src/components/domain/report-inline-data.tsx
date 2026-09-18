"use client"

import { useState } from "react"
import { ChartNoAxesColumnIncreasingIcon, Table2Icon } from "lucide-react"

import { Measurement } from "@/components/domain/measurement"
import { reportInlineDataScenarios } from "@/components/domain/report-inline-data.scenarios"
import {
  EmptyState,
  ReportBadge,
} from "@/components/domain/report-parts"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
  reportInlineDataInputSchema,
  type ReportInlineDataInput,
} from "@/schemas/domain-component-inputs"

export type ReportInlineDataSelection = {
  parameterId: string | null
  waferId: string | null
}

export type ReportInlineDataProps = {
  input?: ReportInlineDataInput
  className?: string
  /**
   * Selected parameter/raw detail is App workflow state. The component keeps
   * only its presentation-only distribution/matrix mode locally.
   */
  selection?: ReportInlineDataSelection
  onParameterSelect?: (parameterId: string) => void
  onWaferSelect?: (waferId: string) => void
}

type InlineViewMode = "distribution" | "matrix"

export function ReportInlineData({
  input = reportInlineDataScenarios.normal.input,
  className,
  selection,
  onParameterSelect,
  onWaferSelect,
}: ReportInlineDataProps) {
  const scenarioInput = reportInlineDataScenarios.normal.input
  const parsedInput = reportInlineDataInputSchema.parse(input)
  const parameters = parsedInput.parameterOptions ?? scenarioInput.parameterOptions ?? []
  const measurement = parsedInput.measurement ?? scenarioInput.measurement
  const [viewMode, setViewMode] = useState<InlineViewMode>(
    parsedInput.defaultViewMode ?? "distribution"
  )
  const [uncontrolledParameterId, setUncontrolledParameterId] = useState(
    parsedInput.selectedParameterId ?? parameters[0] ?? ""
  )
  const [uncontrolledWaferId, setUncontrolledWaferId] = useState(
    parsedInput.selectedWaferId ?? ""
  )
  const selectedParameterId = selection?.parameterId ?? uncontrolledParameterId
  const selectedWaferId = selection?.waferId ?? uncontrolledWaferId

  function selectParameter(parameterId: string) {
    if (!selection) setUncontrolledParameterId(parameterId)
    onParameterSelect?.(parameterId)
  }

  function selectWafer(waferId: string) {
    if (!selection) setUncontrolledWaferId(waferId)
    onWaferSelect?.(waferId)
  }

  function selectMatrixCell(parameterId: string, waferId: string) {
    selectParameter(parameterId)
    selectWafer(waferId)
  }

  return (
    <div className={cn("domain-ui-typography grid gap-4 p-4", className)}>
      <div className="flex justify-end">
        <div
          className="flex items-center rounded-lg border bg-muted/50 p-0.5"
          role="group"
          aria-label="视图切换"
        >
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn(
              "rounded-md",
              viewMode === "distribution" && "bg-background text-foreground ring-1 ring-border"
            )}
            onClick={() => setViewMode("distribution")}
            aria-label="箱型图视图"
            aria-pressed={viewMode === "distribution"}
            title="箱型图视图"
          >
            <ChartNoAxesColumnIncreasingIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn(
              "rounded-md",
              viewMode === "matrix" && "bg-background text-foreground ring-1 ring-border"
            )}
            onClick={() => setViewMode("matrix")}
            aria-label="参数与 wafer 矩阵视图"
            aria-pressed={viewMode === "matrix"}
            title="参数与 wafer 矩阵视图"
          >
            <Table2Icon />
          </Button>
        </div>
      </div>
      {parameters.length === 0 || !measurement ? (
        <EmptyState>暂无 Inline Data 数据</EmptyState>
      ) : viewMode === "matrix" ? (
        <InlineMatrix
          coverage={parsedInput.coverage}
          matrix={parsedInput.matrix}
          stickyHeader={parsedInput.stickyMatrixHeader ?? true}
          stickyFirstColumn={parsedInput.stickyMatrixFirstColumn ?? true}
          onSelect={selectMatrixCell}
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-[18rem_minmax(0,1fr)]">
            <Card size="sm" className="border ring-0 shadow-none">
              <CardHeader className="flex items-center justify-between gap-2">
                <CardTitle>SPC inline parameter</CardTitle>
                <CardAction><ReportBadge tone="neutral">{parameters.length}</ReportBadge></CardAction>
              </CardHeader>
              <CardContent className="grid gap-2 pb-(--card-spacing)">
                {parameters.map((parameter) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    key={parameter}
                    onClick={() => selectParameter(parameter)}
                    className={cn(
                      "h-auto w-full justify-start border bg-background p-2 font-mono text-[11px]",
                      parameter === selectedParameterId && "bg-muted text-foreground"
                    )}
                  >
                    {parameter}
                  </Button>
                ))}
              </CardContent>
            </Card>
          <div className="min-w-0 xl:col-span-1">
            <div className="mb-3 flex flex-wrap gap-2">
              <ReportBadge tone="neutral">
                Inline Parameter: {selectedParameterId}
              </ReportBadge>
              {selectedWaferId && (
                <ReportBadge tone="neutral">Wafer: {selectedWaferId}</ReportBadge>
              )}
              <ReportBadge tone="neutral">uses shared Measurement</ReportBadge>
              <ReportBadge tone={parsedInput.status === "unavailable" ? "bad" : parsedInput.status === "partial" ? "watch" : "neutral"}>
                {parsedInput.status.toUpperCase()}
              </ReportBadge>
            </div>
            {parsedInput.summary ? (
              <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SnapshotMetric label="Inline parameters" value={parsedInput.summary.parameterCount} detail="snapshot parameter catalog" />
                <SnapshotMetric label="Current raw measurements" value={parsedInput.summary.rawRowCount} detail="latest valid SAMPLE_ID only" />
                <SnapshotMetric label="Latest valid samples" value={parsedInput.summary.sampleRowCount} detail="history samples excluded" />
                <SnapshotMetric label="Cpk evaluable" value={parsedInput.summary.cpkEvaluableCount} detail="of current samples" />
              </div>
            ) : null}
            <Measurement input={measurement} onGroupSelect={selectWafer} />
            {parsedInput.coverage.length ? <Card size="sm" className="mt-4 border ring-0 shadow-none"><CardHeader><CardTitle>Wafer coverage</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2 pb-(--card-spacing)">{parsedInput.coverage.map((item) => <Button type="button" key={item.waferId} variant="outline" size="xs" disabled={!item.measured} onClick={() => selectWafer(item.waferId)} className={cn(item.waferId === selectedWaferId && "bg-muted text-foreground")}>{item.waferId}{item.measured ? " · current sample" : " · missing"}</Button>)}</CardContent></Card> : null}
            {parsedInput.rawDetail ? <p className="mt-3 text-xs text-muted-foreground">{parsedInput.rawDetail.parameterId}: {parsedInput.rawDetail.rawPointCount} RAW_VALUE · {parsedInput.rawDetail.status.toUpperCase()}{parsedInput.rawDetail.reason ? ` · ${parsedInput.rawDetail.reason}` : ""}</p> : null}
            {parsedInput.summary?.limitation ? <p className="mt-2 text-xs text-muted-foreground">{parsedInput.summary.limitation}</p> : null}
          </div>
        </div>
      )}
    </div>
  )
}

function InlineMatrix({
  coverage,
  matrix,
  stickyHeader,
  stickyFirstColumn,
  onSelect,
}: {
  coverage: ReportInlineDataInput["coverage"]
  matrix: ReportInlineDataInput["matrix"]
  stickyHeader: boolean
  stickyFirstColumn: boolean
  onSelect: (parameterId: string, waferId: string) => void
}) {
  const firstColumnClass = stickyFirstColumn
    ? "sticky left-0 z-20 border-r bg-background"
    : ""
  const headerClass = stickyHeader ? "sticky top-0 z-10 bg-muted/80" : "bg-muted/30"
  const cornerClass = stickyHeader && stickyFirstColumn
    ? "sticky left-0 top-0 z-30 border-r bg-muted"
    : cn(headerClass, firstColumnClass)

  return (
    <section className="domain-ui-inline-matrix-shell" aria-label="SPC inline parameter 与 Wafer 二维测量数据" tabIndex={0}>
      <Table className="domain-ui-inline-matrix text-xs">
        <TableHeader>
          <TableRow>
            <TableHead className={cn("domain-ui-inline-matrix-parameter", cornerClass)}>SPC_inline parameter</TableHead>
            {coverage.map((item) => <TableHead key={item.waferId} className={cn("domain-ui-inline-matrix-wafer text-center font-mono", headerClass)}>{item.waferId}</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {matrix.map((row) => {
            const cellsByWafer = new Map(row.cells.map((cell) => [cell.waferId, cell]))
            return <TableRow key={row.parameterId}>
              <TableCell className={cn("domain-ui-inline-matrix-parameter font-mono font-medium", firstColumnClass)} title={row.parameterId}>{row.parameterId}</TableCell>
              {coverage.map((wafer) => {
                const cell = cellsByWafer.get(wafer.waferId)
                return <TableCell key={wafer.waferId} className="domain-ui-inline-matrix-wafer text-center">
                  {cell?.median == null ? <span className="domain-ui-inline-matrix-empty">—</span> : <Button variant="outline" size="sm" className="domain-ui-inline-matrix-cell" onClick={() => onSelect(row.parameterId, wafer.waferId)} aria-label={`查看${row.parameterId}下${wafer.waferId}的箱型图，Median ${formatInlineValue(cell.median)}，Cpk ${formatInlineValue(cell.cpk)}`}><strong className="font-mono">{formatInlineValue(cell.median)}</strong><span>Cpk {formatInlineValue(cell.cpk)}</span></Button>}
                </TableCell>
              })}
            </TableRow>
          })}
        </TableBody>
      </Table>
    </section>
  )
}

function formatInlineValue(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—"
  return Math.abs(value) >= 10 ? value.toFixed(1) : value.toFixed(3)
}

function SnapshotMetric({ label, value, detail }: { label: string; value?: number; detail: string }) {
  return (
    <Card size="sm" className="border ring-0 shadow-none">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-xl font-semibold tabular-nums">{value ?? "—"}</CardTitle>
      </CardHeader>
      <CardContent className="pb-(--card-spacing) text-[11px] text-muted-foreground">{detail}</CardContent>
    </Card>
  )
}
