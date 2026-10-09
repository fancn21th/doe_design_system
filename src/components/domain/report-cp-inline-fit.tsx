"use client"

import { ChevronDown } from "lucide-react"
import { useState, type ReactNode } from "react"

import { ReportState } from "@/components/domain/report-state"
import { ReportCpInlineFitChart, REPORT_CP_INLINE_MODEL_COLORS } from "@/components/domain/report-cp-inline-fit-chart"
import {
  formatReportCpInlineValue,
  formatReportCpInlineMeasurementValue,
  reportCpInlineSpecEntries,
  type ReportCpInlineModelVisibility,
} from "@/components/domain/report-cp-inline-model"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import {
  reportCpInlineFitInputSchema,
  type ReportCpInlineFitInput,
  type ReportCpInlineFitModel,
  type ReportCpInlineFitPanel,
} from "@/schemas/domain-component-inputs"

const COVERAGE_LABELS = {
  PAIRED: "同片配对",
  INLINE_ONLY: "仅 Inline 数据",
  CP_ONLY: "仅 CP 数据",
  NO_DATA: "无量测数据",
}

export function ReportCpInlineFit({ input, className, showHeader = true }: {
  input: ReportCpInlineFitInput
  className?: string
  showHeader?: boolean
}) {
  const parsed = reportCpInlineFitInputSchema.parse(input)
  return (
    <div className={cn("not-prose domain-ui-typography domain-ui-cp-inline grid min-w-0 gap-(--doe-section-gap)", className)}>
      {showHeader && <header className="space-y-1"><h3 className="text-(length:--doe-font-module-title) font-semibold break-words">{parsed.cpParameter} × {parsed.inlineParameter}</h3><p className="text-xs text-muted-foreground">{parsed.stepLabel} · {parsed.factorLabel}</p></header>}
      {!showHeader && <p className="text-xs text-muted-foreground">{parsed.stepLabel} · {parsed.factorLabel}</p>}
      <FitSection title="Wafer Pair明细">
        <Table className="domain-ui-cp-inline-table">
          <TableHeader className="bg-muted/50"><TableRow><TableHead>Wafer ID</TableHead><TableHead>Condition</TableHead><TableHead>Inline Median X</TableHead><TableHead>CP Median Y</TableHead><TableHead>CP Min</TableHead><TableHead>CP Max</TableHead></TableRow></TableHeader>
          <TableBody>
            {parsed.waferPairs.map((pair) => <TableRow key={pair.waferId}><TableCell><span className="mr-2 text-primary">{pair.waferId}</span><Badge variant="outline">{pair.role}</Badge>{pair.coverageStatus !== "PAIRED" && <span className="mt-1 block text-xs text-muted-foreground">{COVERAGE_LABELS[pair.coverageStatus]}</span>}</TableCell><TableCell>{pair.condition}</TableCell><TableCell className="font-mono">{formatReportCpInlineValue(pair.inlineMedian, pair.inlineMedian != null && Math.abs(pair.inlineMedian) < 10 ? 6 : 1)}</TableCell><TableCell className="font-mono">{formatReportCpInlineMeasurementValue(pair.cpMedian)}</TableCell><TableCell className="font-mono">{formatReportCpInlineMeasurementValue(pair.cpMin)}</TableCell><TableCell className="font-mono">{formatReportCpInlineMeasurementValue(pair.cpMax)}</TableCell></TableRow>)}
            {parsed.waferPairs.length === 0 && <TableRow><TableCell colSpan={6} className="p-0"><ReportState title="暂无 Wafer 明细。" className="min-h-40" /></TableCell></TableRow>}
          </TableBody>
        </Table>
      </FitSection>
      <FitSection title="Wafer Scatter & Fits">
        <div className="grid min-w-0 gap-(--doe-section-gap) p-(--doe-module-padding)">
          {parsed.fitPanels.map((panel) => <FitResultPanel key={`${parsed.experimentGroupId}:${parsed.cpParameter}:${parsed.inlineParameter}:${panel.id}`} panel={panel} input={parsed} />)}
          {parsed.fitPanels.length === 0 && <ReportState title="暂无散点与拟合证据。" />}
        </div>
      </FitSection>
      {parsed.provenance?.limitation && <p className="text-xs text-muted-foreground">{parsed.provenance.limitation}</p>}
    </div>
  )
}

function FitSection({ title, children }: { title: string; children: ReactNode }) {
  return <Collapsible defaultOpen className="min-w-0"><Card className="min-w-0 gap-0 py-0"><CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 border-b p-(--doe-module-padding) text-left text-(length:--doe-font-module-title) font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"><span>{title}</span><ChevronDown className="size-4 transition-transform group-data-panel-open:rotate-180" /></CollapsibleTrigger><CollapsibleContent>{children}</CollapsibleContent></Card></Collapsible>
}

function FitResultPanel({ panel, input }: { panel: ReportCpInlineFitPanel; input: ReportCpInlineFitInput }) {
  const [visibility, setVisibility] = useState<ReportCpInlineModelVisibility>({ linear: true, quadratic: true })
  const specs = reportCpInlineSpecEntries(input.spec)
  return (
    <Card className="@container gap-0 py-0">
      <CardHeader className="border-b py-3"><CardTitle>{panel.title}</CardTitle></CardHeader>
      <CardContent className="grid min-w-0 gap-4 p-4 @min-[48rem]:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {panel.points.length > 0 ? <ReportCpInlineFitChart panel={panel} spec={input.spec} visibility={visibility} inlineParameter={input.inlineParameter} cpParameter={input.cpParameter} cpUnit={input.cpUnit} /> : <ReportState title="暂无可用 Wafer 散点" description={panel.unavailableReason} />}
        <div className="grid min-w-0 content-start gap-3">
          {panel.unavailableReason && panel.points.length > 0 && <p className="text-xs text-muted-foreground">{panel.unavailableReason}</p>}
          {panel.models.map((model) => <ModelEvidence key={model.kind} model={model} visible={visibility[model.kind]} onToggle={() => setVisibility((current) => ({ ...current, [model.kind]: !current[model.kind] }))} />)}
          {panel.models.length === 0 && <p className="text-xs text-muted-foreground">未提供拟合结果。</p>}
          <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 border-t pt-3 text-sm"><dt>Pearson r</dt><dd className="font-mono font-semibold">{formatReportCpInlineValue(panel.pearson, 2)}</dd><dt>Spearman ρ</dt><dd className="font-mono font-semibold">{formatReportCpInlineValue(panel.spearman, 2)}</dd></dl>
          <Collapsible className="border-t pt-2"><CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 py-2 text-left text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring">Fit × Spec 交点坐标<ChevronDown className="size-4 transition-transform group-data-panel-open:rotate-180" /></CollapsibleTrigger><CollapsibleContent keepMounted><div className="grid gap-2 pb-2 text-xs">{specs.length > 0 ? <p className="text-muted-foreground">{specs.map(({ kind, value }) => `${kind.toUpperCase()} ${formatReportCpInlineValue(value)}`).join(" · ")}{input.spec?.classification === "source-provisional" ? " · source-provisional" : ""}</p> : <p className="text-muted-foreground">未提供 CP 规格。</p>}{panel.roots.map((root) => <div key={root.id} className="rounded-(--doe-radius-cell) border p-2"><span className="font-semibold">{root.model === "linear" ? "Linear" : "Quadratic"} × {root.threshold.toUpperCase()}</span><span className="ml-2 text-muted-foreground">{root.domainStatus === "in-domain" ? "观测域内" : "观测域外"}</span><span className="mt-1 block font-mono">X {formatReportCpInlineValue(root.x)} · Y {formatReportCpInlineValue(root.y)}</span></div>)}{panel.roots.length === 0 && <p className="text-muted-foreground">未提供交点。</p>}</div></CollapsibleContent></Collapsible>
        </div>
      </CardContent>
    </Card>
  )
}

function ModelEvidence({ model, visible, onToggle }: { model: ReportCpInlineFitModel; visible: boolean; onToggle: () => void }) {
  const available = model.status === "available"
  return (
    <section className="grid min-w-0 gap-2 border-b border-dashed pb-3">
      <div className="flex items-center justify-between gap-2"><h4 className="flex items-center gap-2 text-sm font-semibold"><span className="h-0.5 w-4" style={{ backgroundColor: REPORT_CP_INLINE_MODEL_COLORS[model.kind] }} />{model.kind === "linear" ? "Linear Fit" : "Quadratic Fit"}</h4><Button variant="ghost" size="xs" aria-label={`${visible ? "隐藏" : "显示"} ${model.kind === "linear" ? "Linear" : "Quadratic"} Fit 曲线`} aria-pressed={available && visible} disabled={!available} onClick={onToggle}>{available ? visible ? "隐藏曲线" : "显示曲线" : "不可用"}</Button></div>
      {available ? <><p className="rounded-(--doe-radius-cell) bg-muted/50 p-2 font-mono text-xs font-semibold break-words">{model.equation ?? "未提供拟合方程。"}</p><div className="flex flex-wrap gap-1"><Badge variant="secondary">R² {formatReportCpInlineValue(model.r2)}</Badge><Badge variant="secondary">RMSE {formatReportCpInlineValue(model.rmse)}</Badge><Badge variant="secondary">Residual N {formatReportCpInlineValue(model.residualN, 0)}</Badge><Badge variant="secondary">df {formatReportCpInlineValue(model.residualDf, 0)}</Badge></div></> : <p className="text-xs text-muted-foreground">{model.unavailableReason ?? "上游未提供可用拟合。"}</p>}
      {model.diagnostic && <p className="text-xs text-muted-foreground">{model.diagnostic === "Backend 提供的拟合证据。" ? "当前数据的拟合结果。" : model.diagnostic}</p>}
    </section>
  )
}
