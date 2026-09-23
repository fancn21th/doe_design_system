"use client"

import { ChevronDownIcon, InfoIcon } from "lucide-react"
import * as React from "react"

import { ReportCpInlineFitChart } from "@/components/domain/report-cp-inline-fit-chart"
import {
  formatReportCpInlineValue,
  reportCpInlineThresholdLabel,
} from "@/components/domain/report-cp-inline-model"
import { reportCpInlineScenarios } from "@/components/domain/report-cp-inline.scenarios"
import { EmptyState, ReportBadge } from "@/components/domain/report-parts"
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/components/ui/combobox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
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
  reportCpInlineInputSchema,
  type ReportCpInlineCpAggregation,
  type ReportCpInlineExtremePolicy,
  type ReportCpInlineFitGrain,
  type ReportCpInlineFitPanel,
  type ReportCpInlineInput,
  type ReportCpInlineMetric,
  type ReportCpInlineOption,
  type ReportCpInlineWaferOption,
} from "@/schemas/domain-component-inputs"

type ReportCpInlineProps = {
  input?: ReportCpInlineInput
  className?: string
  onStepChange?: (value: string) => void
  onInlineParameterChange?: (value: string) => void
  onCpParameterChange?: (value: string) => void
  onBaselineWafersChange?: (values: string[]) => void
  onSplitWafersChange?: (values: string[]) => void
  onFitGrainChange?: (value: ReportCpInlineFitGrain) => void
  onInlineMetricChange?: (value: ReportCpInlineMetric) => void
  onCpAggregationChange?: (value: ReportCpInlineCpAggregation) => void
  onExtremePolicyChange?: (value: ReportCpInlineExtremePolicy) => void
  onQuadraticEnabledChange?: (enabled: boolean) => void
}

export function ReportCpInline({
  input = reportCpInlineScenarios.normal.input,
  className,
  onStepChange,
  onInlineParameterChange,
  onCpParameterChange,
  onBaselineWafersChange,
  onSplitWafersChange,
  onFitGrainChange,
  onInlineMetricChange,
  onCpAggregationChange,
  onExtremePolicyChange,
  onQuadraticEnabledChange,
}: ReportCpInlineProps) {
  const parsedInput = reportCpInlineInputSchema.parse(input)

  return (
    <div
      className={cn(
        "not-prose domain-ui-typography grid min-w-0 gap-(--doe-section-gap) p-4",
        className
      )}
    >
      <ReportSection
        title={parsedInput.title ?? "CP x Inline 拟合"}
        description={parsedInput.subtitle}
        sourceLabel={parsedInput.sourceLabel}
      >
        <div className="grid gap-3 md:grid-cols-3">
          <SingleSelectField label="Step" value={parsedInput.step} options={parsedInput.stepOptions} onValueChange={onStepChange} />
          <SingleSelectField label="Inline Parameter" value={parsedInput.inlineParameter} options={parsedInput.inlineParameterOptions} onValueChange={onInlineParameterChange} />
          <SingleSelectField label="CP Parameter" value={parsedInput.cpParameter} options={parsedInput.cpParameterOptions} onValueChange={onCpParameterChange} />
        </div>
      </ReportSection>

      <ReportSection title="Condition 聚合" description="Inline 与 CP 保留各自有效 Wafer population；缺失值不补零。">
        <div className="grid gap-3 md:grid-cols-2">
          <WaferMultiSelect label="Baseline" options={parsedInput.baselineWaferOptions} values={parsedInput.baselineWafers ?? []} onValuesChange={onBaselineWafersChange} />
          <WaferMultiSelect label="Split" options={parsedInput.splitWaferOptions} values={parsedInput.splitWafers ?? []} onValuesChange={onSplitWafersChange} />
        </div>
        {parsedInput.rows.length === 0 ? <EmptyState>当前选择暂无 Condition 聚合证据。</EmptyState> : <ConditionAggregationTable rows={parsedInput.rows} />}
      </ReportSection>

      <ReportSection title="拟合与定位" description="候选模型、阈值、根与窗口均由上游证据提供；组件不自动选择主模型。">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <SingleSelectField label="拟合方式" value={parsedInput.fitGrain} options={parsedInput.fitGrainOptions} onValueChange={(value) => onFitGrainChange?.(value as ReportCpInlineFitGrain)} />
          <SingleSelectField label="多Wafer_Inline 取值方式" value={parsedInput.inlineMetric} options={parsedInput.inlineMetricOptions} onValueChange={(value) => onInlineMetricChange?.(value as ReportCpInlineMetric)} />
          <SingleSelectField label="CP parameter 聚合方式" value={parsedInput.cpAggregation} options={parsedInput.cpAggregationOptions} onValueChange={(value) => onCpAggregationChange?.(value as ReportCpInlineCpAggregation)} />
          <SingleSelectField label="CP Parameter极值聚合方式" value={parsedInput.extremePolicy} options={parsedInput.extremePolicyOptions} onValueChange={(value) => onExtremePolicyChange?.(value as ReportCpInlineExtremePolicy)} />
          <div className="flex min-h-14 flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Quadratic candidate</span>
            <div className="flex h-8 items-center gap-2 rounded-lg border px-2.5">
              <Switch checked={parsedInput.quadraticEnabled} onCheckedChange={onQuadraticEnabledChange} aria-label="Quadratic candidate" />
              <span className="text-xs text-muted-foreground">{parsedInput.quadraticEnabled ? "显示" : "隐藏"}</span>
            </div>
          </div>
        </div>

        <FitGateSummary panels={parsedInput.fitPanels} />
        {parsedInput.fitPanels.length === 0 ? (
          <EmptyState>当前选择暂无拟合证据。</EmptyState>
        ) : (
          <div className="grid gap-4">
            {parsedInput.fitPanels.map((panel) => (
              <FitResultPanel
                key={panel.id}
                panel={panel}
                spec={parsedInput.spec}
                controlWindows={parsedInput.controlWindows}
                quadraticEnabled={parsedInput.quadraticEnabled}
                inlineParameter={parsedInput.inlineParameter ?? "Inline"}
              />
            ))}
          </div>
        )}
        <ControlWindowEvidence input={parsedInput} />
        {parsedInput.provenance && (
          <div className="flex flex-wrap items-start gap-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
            <ReportBadge tone="neutral">{parsedInput.provenance.classification.toUpperCase()}</ReportBadge>
            <span>{parsedInput.provenance.source}</span>
            {parsedInput.provenance.limitation && <span className="basis-full">{parsedInput.provenance.limitation}</span>}
          </div>
        )}
      </ReportSection>
    </div>
  )
}

function ReportSection({ title, description, sourceLabel, children }: { title: string; description?: string; sourceLabel?: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true)
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="gap-0 border py-0 ring-0 shadow-none">
        <CardHeader className="border-b py-3">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
          <CardAction className="flex items-center gap-2">
            {sourceLabel && <ReportBadge tone="neutral">{sourceLabel}</ReportBadge>}
            <CollapsibleTrigger render={<Button type="button" variant="ghost" size="icon-sm" aria-label={`${open ? "收起" : "展开"} ${title}`}><ChevronDownIcon className={cn("transition-transform", !open && "-rotate-90")} /></Button>} />
          </CardAction>
        </CardHeader>
        <CollapsibleContent><CardContent className="grid gap-4 p-4">{children}</CardContent></CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

function SingleSelectField({ label, value, options, onValueChange }: { label: string; value?: string; options: ReportCpInlineOption[]; onValueChange?: (value: string) => void }) {
  const selected = options.find((option) => option.value === value)
  return (
    <label className="grid min-w-0 gap-1 text-xs font-medium text-muted-foreground">
      <span>{label}</span>
      <Select value={value ?? ""} onValueChange={(nextValue) => { if (nextValue) onValueChange?.(nextValue) }}>
        <SelectTrigger className="w-full min-w-0"><SelectValue>{selected?.label ?? "请选择"}</SelectValue></SelectTrigger>
        <SelectContent align="start">
          {options.map((option) => <SelectItem key={option.value} value={option.value} disabled={option.disabled}>{option.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </label>
  )
}

function WaferMultiSelect({ label, options, values, onValuesChange }: { label: string; options: ReportCpInlineWaferOption[]; values: string[]; onValuesChange?: (values: string[]) => void }) {
  const inputId = React.useId()
  const selected = options.filter((option) => values.includes(option.value))
  return (
    <Combobox items={options} multiple value={selected} onValueChange={(nextValue) => onValuesChange?.(nextValue.map((option) => option.value))} itemToStringLabel={(item) => item.label} itemToStringValue={(item) => item.value} isItemEqualToValue={(item, selectedItem) => item.value === selectedItem.value}>
      <div className="grid min-w-0 gap-1">
        <label htmlFor={inputId} className="text-xs font-medium text-muted-foreground">{label}</label>
        <div className="relative">
          <ComboboxChips className="min-h-9 pr-8">
            <ComboboxValue>{(selectedValue: ReportCpInlineWaferOption[]) => <React.Fragment>{selectedValue.map((item) => <ComboboxChip key={item.value} aria-label={item.label}>{item.label}</ComboboxChip>)}<ComboboxChipsInput id={inputId} placeholder={selectedValue.length > 0 ? "" : "请选择 Wafer"} className="h-5 min-w-16 flex-1 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground" /></React.Fragment>}</ComboboxValue>
          </ComboboxChips>
          <ComboboxContent><ComboboxEmpty>无匹配 Wafer</ComboboxEmpty><ComboboxList>{(option: ReportCpInlineWaferOption) => <ComboboxItem key={option.value} value={option} disabled={option.disabled}><span className="flex min-w-0 flex-1 items-center justify-between gap-3"><span>{option.label}</span><CoverageBadge option={option} /></span></ComboboxItem>}</ComboboxList></ComboboxContent>
        </div>
      </div>
    </Combobox>
  )
}

function CoverageBadge({ option }: { option: ReportCpInlineWaferOption }) {
  const tone = option.coverageStatus === "PAIRED" ? "good" : option.coverageStatus === "NO_DATA" ? "bad" : option.coverageStatus === "INLINE_ONLY" ? "watch" : "neutral"
  return <ReportBadge tone={tone}>{option.coverageLabel}</ReportBadge>
}

function ConditionAggregationTable({ rows }: { rows: ReportCpInlineInput["rows"] }) {
  return (
    <div className="min-w-0 max-w-full overflow-hidden rounded-lg border">
      <Table className="domain-ui-cp-inline-table">
        <TableHeader><TableRow><TableHead>Stage</TableHead><TableHead>Condition</TableHead><TableHead>BSL/split</TableHead><TableHead>Inline-Metrology Wafers</TableHead><TableHead>CP-Tested Wafers</TableHead><TableHead>Mean(Inline)</TableHead><TableHead>Median(Inline)</TableHead><TableHead>Mean(CP)</TableHead><TableHead>Median(CP)</TableHead></TableRow></TableHeader>
        <TableBody>{rows.map((row) => <TableRow key={row.id}><TableCell>{row.stage}</TableCell><TableCell className="font-medium">{row.condition}</TableCell><TableCell><ReportBadge tone={row.role === "BSL" ? "good" : "neutral"}>{row.role}</ReportBadge></TableCell><TableCell><CoverageCell wafers={row.inlineWafers} requestedCount={row.requestedWafers.length} /></TableCell><TableCell><CoverageCell wafers={row.cpWafers} requestedCount={row.requestedWafers.length} /></TableCell><TableCell className="font-mono text-xs">{formatReportCpInlineValue(row.meanInline, 6)}</TableCell><TableCell className="font-mono text-xs">{formatReportCpInlineValue(row.medianInline, 6)}</TableCell><TableCell className="font-mono text-xs">{formatReportCpInlineValue(row.meanCp, 4)}</TableCell><TableCell className="font-mono text-xs">{formatReportCpInlineValue(row.medianCp, 4)}</TableCell></TableRow>)}</TableBody>
      </Table>
    </div>
  )
}

function CoverageCell({ wafers, requestedCount }: { wafers: string[]; requestedCount: number }) {
  return <span className="block min-w-28"><span>{wafers.join(", ") || "—"}</span><small className="block text-muted-foreground">{wafers.length}/{requestedCount} wafer</small></span>
}

function FitGateSummary({ panels }: { panels: ReportCpInlineFitPanel[] }) {
  const gate = panels[0]?.gate
  if (!gate) return null
  const tone = gate.mode === "FACTOR_REVIEW" ? "good" : gate.mode === "REPEATABILITY" ? "watch" : "bad"
  return <div className="flex items-start gap-2 rounded-lg border bg-muted/20 p-3 text-xs"><InfoIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><div className="grid gap-1"><span className="flex flex-wrap items-center gap-2"><ReportBadge tone={tone}>{gate.mode}</ReportBadge><b>{gate.conditionLevelCount} Condition level</b><span className="text-muted-foreground">Linear {gate.linearAllowed ? "可用" : "不可用"} · Quadratic {gate.quadraticAllowed ? "可用" : "不可用"}</span></span><span className="text-muted-foreground">{gate.reason}</span></div></div>
}

function FitResultPanel({ panel, spec, controlWindows, quadraticEnabled, inlineParameter }: { panel: ReportCpInlineFitPanel; spec: ReportCpInlineInput["spec"]; controlWindows: ReportCpInlineInput["controlWindows"]; quadraticEnabled: boolean; inlineParameter: string }) {
  const [detailsOpen, setDetailsOpen] = React.useState(false)
  const thresholdLabel = reportCpInlineThresholdLabel(panel, spec)
  return (
    <Card className="gap-0 border py-0 ring-0 shadow-none">
      <CardHeader className="border-b py-3"><CardTitle className="text-center">{panel.title} · {thresholdLabel} · N={panel.points.length}</CardTitle><CardAction><Button type="button" variant="link" size="sm" onClick={() => setDetailsOpen((open) => !open)} aria-expanded={detailsOpen}>{detailsOpen ? "隐藏拟合结果" : "拟合结果"}</Button></CardAction></CardHeader>
      <CardContent className="grid gap-3 p-3"><SpecSummary spec={spec} />{panel.points.length === 0 ? <EmptyState>{panel.unavailableReason ?? "该结果面板暂无可用证据。"}</EmptyState> : <div className={cn("grid min-w-0 gap-3", detailsOpen && "xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]")}><ReportCpInlineFitChart panel={panel} spec={spec} controlWindows={controlWindows} quadraticEnabled={quadraticEnabled} inlineParameter={inlineParameter} />{detailsOpen && <FitEvidenceDetails panel={panel} quadraticEnabled={quadraticEnabled} />}</div>}</CardContent>
    </Card>
  )
}

function SpecSummary({ spec }: { spec: ReportCpInlineInput["spec"] }) {
  return <div className="flex flex-wrap justify-end gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="参数阈值"><span>Target <b className="font-mono text-foreground">{formatReportCpInlineValue(spec?.target, 4)}</b></span><span>LSL <b className="font-mono text-foreground">{formatReportCpInlineValue(spec?.lsl, 4)}</b></span><span>USL <b className="font-mono text-foreground">{formatReportCpInlineValue(spec?.usl, 4)}</b></span>{spec && <ReportBadge tone={spec.classification === "confirmed" ? "good" : spec.classification === "source-provisional" ? "watch" : "neutral"}>{spec.sourceLabel}</ReportBadge>}</div>
}

function FitEvidenceDetails({ panel, quadraticEnabled }: { panel: ReportCpInlineFitPanel; quadraticEnabled: boolean }) {
  const models = panel.models.filter((model) => model.kind === "linear" || quadraticEnabled)
  return <aside className="grid content-start gap-3 rounded-lg border p-3"><div><b className="text-sm">拟合结果</b><p className="mt-1 text-xs text-muted-foreground">{panel.gate.reason}</p></div>{models.map((model) => <div key={model.kind} className="rounded-lg border p-3"><div className="flex items-center justify-between gap-2"><b>{model.label}</b><ReportBadge tone={model.status === "available" ? "good" : "watch"}>{model.status.toUpperCase()}</ReportBadge></div><p className="mt-2 break-words font-mono text-xs">{model.equation ?? "—"}</p><p className="mt-1 text-xs text-muted-foreground">{model.diagnostic}</p></div>)}{panel.roots.length > 0 && <div className="rounded-lg border p-3 text-xs"><b>Threshold roots</b><ul className="mt-2 grid gap-1 text-muted-foreground">{panel.roots.map((root) => <li key={root.id}>{root.model} · {root.threshold.toUpperCase()} · Inline {formatReportCpInlineValue(root.x, 6)} · {root.domainStatus}</li>)}</ul></div>}<p className="text-xs text-muted-foreground">{panel.provenance}</p></aside>
}

function ControlWindowEvidence({ input }: { input: ReportCpInlineInput }) {
  if (input.controlWindows.length === 0) return null
  return <div className="grid gap-3 rounded-lg border p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><b>Inline Control Window</b><p className="mt-1 text-xs text-muted-foreground">只读证据；不是 Recipe setpoint、生产指令或 release verdict。</p></div><ReportBadge tone="watch">SOURCE PROVISIONAL</ReportBadge></div><div className="grid gap-3 md:grid-cols-2">{input.controlWindows.map((window) => <div key={window.model} className="rounded-lg border p-3 text-xs"><div className="flex items-center justify-between gap-2"><b>{window.model === "linear" ? "Linear" : "Quadratic"}</b><ReportBadge tone={window.status === "available" ? "good" : "neutral"}>{window.status.toUpperCase()}</ReportBadge></div>{window.intervals.length > 0 ? <div className="mt-2 grid gap-1 font-mono">{window.intervals.map((interval, index) => <span key={`${window.model}-${index}`}>{formatReportCpInlineValue(interval.min, 6)} – {formatReportCpInlineValue(interval.max, 6)}</span>)}</div> : <p className="mt-2 text-muted-foreground">{window.reason ?? "不可评价"}</p>}{window.basis.length > 0 && <p className="mt-2 text-muted-foreground">{window.basis.join(" · ")}</p>}{window.domain && <p className="mt-2 text-muted-foreground">Observation domain {formatReportCpInlineValue(window.domain.min, 6)} – {formatReportCpInlineValue(window.domain.max, 6)}</p>}</div>)}</div></div>
}
