"use client"

import { Measurement } from "@/components/domain/measurement"
import { reportInlineDataScenarios } from "@/components/domain/report-inline-data.scenarios"
import {
  EmptyState,
  ReportBadge,
  ReportCard,
} from "@/components/domain/report-parts"
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

  return (
    <ReportCard
      title={parsedInput.title ?? scenarioInput.title ?? "Inline Data"}
      subtitle={parsedInput.subtitle ?? scenarioInput.subtitle}
      sourceLabel={parsedInput.sourceLabel ?? scenarioInput.sourceLabel}
      className={className}
    >
      {parameters.length === 0 || !measurement ? (
        <EmptyState>暂无 Inline Data 数据</EmptyState>
      ) : (
        <div className="grid gap-4 p-4 xl:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="rounded-lg border p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <b className="text-sm">SPC_inline parameter</b>
              <ReportBadge tone="neutral">{parameters.length}</ReportBadge>
            </div>
            <div className="grid gap-2">
              {parameters.map((parameter) => (
                <button
                  type="button"
                  key={parameter}
                  onClick={() => onParameterSelect?.(parameter)}
                  className="rounded-md border bg-background p-2 font-mono text-[11px]"
                  data-selected={parameter === parsedInput.selectedParameterId}
                >
                  {parameter}
                </button>
              ))}
            </div>
          </aside>
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap gap-2">
              <ReportBadge tone="neutral">
                Inline Parameter: {parsedInput.selectedParameterId ?? parameters[0]}
              </ReportBadge>
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
            <Measurement input={measurement} />
            {parsedInput.coverage.length ? <section className="mt-4 rounded-lg border p-3"><b className="text-sm">Wafer coverage</b><div className="mt-2 flex flex-wrap gap-2">{parsedInput.coverage.map((item) => <button type="button" key={item.waferId} disabled={!item.measured} onClick={() => onWaferSelect?.(item.waferId)} className="rounded border px-2 py-1 text-xs disabled:opacity-40">{item.waferId}{item.measured ? " · current sample" : " · missing"}</button>)}</div></section> : null}
            {parsedInput.matrix.length ? <section className="mt-4 overflow-x-auto rounded-lg border p-3"><b className="text-sm">Wafer × Inline Parameter</b><table className="mt-2 w-full text-xs"><thead><tr><th className="text-left">Parameter</th>{parsedInput.coverage.map((item) => <th className="px-2 text-left" key={item.waferId}>{item.waferId}</th>)}</tr></thead><tbody>{parsedInput.matrix.map((row) => <tr key={row.parameterId}><th className="py-2 text-left font-mono">{row.parameterId}</th>{parsedInput.coverage.map((wafer) => { const cell = row.cells.find((item) => item.waferId === wafer.waferId); return <td className="px-2" key={wafer.waferId}>{cell?.median == null ? "—" : `${cell.median} · N=${cell.sampleSize ?? "—"} · Cpk ${cell.cpk ?? "—"}`}</td> })}</tr>)}</tbody></table></section> : null}
            {parsedInput.rawDetail ? <p className="mt-3 text-xs text-muted-foreground">{parsedInput.rawDetail.parameterId}: {parsedInput.rawDetail.rawPointCount} RAW_VALUE · {parsedInput.rawDetail.status.toUpperCase()}{parsedInput.rawDetail.reason ? ` · ${parsedInput.rawDetail.reason}` : ""}</p> : null}
            {parsedInput.summary?.limitation ? <p className="mt-2 text-xs text-muted-foreground">{parsedInput.summary.limitation}</p> : null}
          </div>
        </div>
      )}
    </ReportCard>
  )
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
