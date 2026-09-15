"use client"

import { Measurement } from "@/components/domain/measurement"
import { reportBoxCpkScenarios } from "@/components/domain/report-box-cpk.scenarios"
import { EmptyState, ReportBadge, ReportCard } from "@/components/domain/report-parts"
import { reportBoxCpkInputSchema, type ReportBoxCpkInput } from "@/schemas/domain-component-inputs"

type Props = { input?: ReportBoxCpkInput; className?: string }

export function ReportBoxCpk({ input = reportBoxCpkScenarios.normal.input, className }: Props) {
  const value = reportBoxCpkInputSchema.parse(input)
  return <ReportCard title={value.title ?? "Box & Cpk"} subtitle={value.subtitle} sourceLabel={value.sourceLabel} className={className}>
    {value.status === "pending" ? <EmptyState>正在读取 Box & Cpk 分析</EmptyState> : value.status === "unavailable" ? <EmptyState>Box & Cpk 分析不可用</EmptyState> : <div className="grid gap-4 p-4">
      <div className="flex flex-wrap gap-2"><ReportBadge tone="neutral">CP Parameter: {value.selectedParameterId}</ReportBadge><ReportBadge tone="neutral">{value.baseline.coverageLabel ?? "Baseline coverage unavailable"}</ReportBadge></div>
      <div className="grid gap-2 sm:grid-cols-3"><Metric label="Mean" value={value.baseline.mean} /><Metric label="sample σ" value={value.baseline.sampleSigma} /><Metric label="Cpk" value={value.baseline.cpk} /></div>
      {value.baseline.mockSpecLabel ? <ReportBadge tone="neutral">{value.baseline.mockSpecLabel}</ReportBadge> : null}
      {value.measurement ? <Measurement input={value.measurement} /> : null}
      <Evidence title="Abnormal wafers" rows={value.abnormalities.map((row) => `${row.waferId} · ${row.status}${row.reasons.length ? ` · ${row.reasons.join(", ")}` : ""}`)} />
      <Evidence title="Yield impact" rows={value.yieldImpacts.map((row) => `${row.waferId} · ${row.impactType}${row.limitation ? ` · ${row.limitation}` : ""}`)} />
      {value.narrative?.text ? <div className="rounded-lg border p-3 text-sm"><b>Evidence narrative</b><p className="mt-1">{value.narrative.text}</p>{value.narrative.limitation ? <p className="mt-1 text-muted-foreground">{value.narrative.limitation}</p> : null}</div> : null}
    </div>}
  </ReportCard>
}
function Metric({ label, value }: { label: string; value: number | null }) { return <div className="rounded-lg border p-3"><span className="text-xs text-muted-foreground">{label}</span><b className="block font-mono">{value ?? "—"}</b></div> }
function Evidence({ title, rows }: { title: string; rows: string[] }) { return <section className="rounded-lg border p-3"><b className="text-sm">{title}</b>{rows.length ? <ul className="mt-2 grid gap-1 text-sm">{rows.map((row) => <li key={row}>{row}</li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">No backend evidence.</p>}</section> }
