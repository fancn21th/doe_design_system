"use client"

import { useState } from "react"

import { Measurement } from "@/components/domain/measurement"
import { reportInlineDataScenarios } from "@/components/domain/report-inline-data.scenarios"
import {
  EmptyState,
  ReportBadge,
} from "@/components/domain/report-parts"
import { Button } from "@/components/ui/button"
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

type ReportInlineDataProps = {
  input?: ReportInlineDataInput
  className?: string
  onParameterSelect?: (parameterId: string) => void
  onWaferSelect?: (waferId: string) => void
}

type InlineViewMode = "distribution" | "matrix"

export function ReportInlineData({
  input = reportInlineDataScenarios.normal.input,
  className,
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
  const [selectedParameterId, setSelectedParameterId] = useState(
    parsedInput.selectedParameterId ?? parameters[0] ?? ""
  )
  const [selectedWaferId, setSelectedWaferId] = useState(
    parsedInput.selectedWaferId ?? ""
  )

  function selectParameter(parameterId: string) {
    setSelectedParameterId(parameterId)
    onParameterSelect?.(parameterId)
  }

  function selectWafer(waferId: string) {
    setSelectedWaferId(waferId)
    onWaferSelect?.(waferId)
  }

  function selectMatrixCell(parameterId: string, waferId: string) {
    selectParameter(parameterId)
    selectWafer(waferId)
  }

  const moduleTitle = measurement?.title ?? "Wafer × Inline Parameter"

  return (
    <section className={cn("overflow-hidden rounded-xl border bg-card", className)}>
      <header className="flex min-h-20 items-center justify-between gap-4 border-b px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{moduleTitle}</h2>
          {parsedInput.sourceLabel ? <p className="mt-1 text-xs text-muted-foreground">{parsedInput.sourceLabel}</p> : null}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 border-sky-200 bg-sky-50 text-sky-600 hover:bg-sky-100 hover:text-sky-700"
          onClick={() => setViewMode((current) => current === "distribution" ? "matrix" : "distribution")}
          aria-label={viewMode === "distribution" ? "切换为矩阵视图" : "切换为箱型图视图"}
          title={viewMode === "distribution" ? "切换为矩阵视图" : "切换为箱型图视图"}
        >
          {viewMode === "distribution" ? <MatrixIcon /> : <ChartIcon />}
        </Button>
      </header>
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
        <div className="grid gap-4 p-4 xl:grid-cols-[18rem_minmax(0,1fr)]">
            <aside className="rounded-lg border p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <b className="text-sm">SPC_inline parameter</b>
              <ReportBadge tone="neutral">{parameters.length}</ReportBadge>
            </div>
            <div className="grid gap-2">
              {parameters.map((parameter) => (
                <Button
                  variant="ghost"
                  size="sm"
                  key={parameter}
                  onClick={() => selectParameter(parameter)}
                  className={cn(
                    "h-auto w-full justify-start border bg-background p-2 font-mono text-[11px]",
                    parameter === selectedParameterId && "border-sky-300 bg-sky-50 text-sky-900"
                  )}
                >
                  {parameter}
                </Button>
              ))}
            </div>
            </aside>
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
            {parsedInput.coverage.length ? <section className="mt-4 rounded-lg border p-3"><b className="text-sm">Wafer coverage</b><div className="mt-2 flex flex-wrap gap-2">{parsedInput.coverage.map((item) => <Button type="button" key={item.waferId} variant="outline" size="xs" disabled={!item.measured} onClick={() => selectWafer(item.waferId)} className={cn(item.waferId === selectedWaferId && "border-sky-300 bg-sky-50 text-sky-900")}>{item.waferId}{item.measured ? " · current sample" : " · missing"}</Button>)}</div></section> : null}
            {parsedInput.rawDetail ? <p className="mt-3 text-xs text-muted-foreground">{parsedInput.rawDetail.parameterId}: {parsedInput.rawDetail.rawPointCount} RAW_VALUE · {parsedInput.rawDetail.status.toUpperCase()}{parsedInput.rawDetail.reason ? ` · ${parsedInput.rawDetail.reason}` : ""}</p> : null}
            {parsedInput.summary?.limitation ? <p className="mt-2 text-xs text-muted-foreground">{parsedInput.summary.limitation}</p> : null}
          </div>
        </div>
      )}
    </section>
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

function MatrixIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4"><path d="M4 4v16h16" /><path d="M8 16v-4M12 16V8m4 8v-6" /></svg>
}

function ChartIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4"><path d="M4 4v16h16" /><path d="M8 14v2m4-8v8m4-11v11m4-6v6" /></svg>
}

function formatInlineValue(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—"
  return Math.abs(value) >= 10 ? value.toFixed(1) : value.toFixed(3)
}

function SnapshotMetric({ label, value, detail }: { label: string; value?: number; detail: string }) {
  return (
    <article className="rounded-lg border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value ?? "—"}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{detail}</p>
    </article>
  )
}
