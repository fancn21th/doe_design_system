"use client"

import {
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  formatReportCpInlineValue,
  formatReportCpInlineMeasurementValue,
  reportCpInlineSpecEntries,
  visibleReportCpInlineModels,
  type ReportCpInlineModelVisibility,
} from "@/components/domain/report-cp-inline-model"
import type {
  ReportCpInlineFitInput,
  ReportCpInlineFitPanel,
  ReportCpInlineFitPoint,
} from "@/schemas/domain-component-inputs"

export const REPORT_CP_INLINE_MODEL_COLORS = {
  linear: "var(--doe-cp-inline-linear)",
  quadratic: "var(--doe-cp-inline-quadratic)",
}

export function ReportCpInlineFitChart({
  panel,
  spec,
  visibility,
  inlineParameter,
  cpParameter,
  cpUnit,
}: {
  panel: ReportCpInlineFitPanel
  spec: ReportCpInlineFitInput["spec"]
  visibility: ReportCpInlineModelVisibility
  inlineParameter: string
  cpParameter: string
  cpUnit?: string | null
}) {
  const models = visibleReportCpInlineModels(panel.models, visibility)
  const specs = reportCpInlineSpecEntries(spec)
  const roots = panel.roots.filter(
    (root) => root.domainStatus === "in-domain" &&
      models.some((model) => model.kind === root.model)
  )

  return (
    <div className="min-w-0 rounded-(--doe-radius-control) border p-3">
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-hidden>
        {models.map((model) => (
          <span key={model.kind} className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4" style={{ backgroundColor: REPORT_CP_INLINE_MODEL_COLORS[model.kind] }} />
            {model.kind === "linear" ? "Linear" : "Quadratic"}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-[var(--doe-cp-inline-wafer)]" />Wafer</span>
        {models.map((model) => <span key={`${model.kind}-root`} className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full border-2" style={{ borderColor: REPORT_CP_INLINE_MODEL_COLORS[model.kind] }} />{model.kind === "linear" ? "Linear" : "Quadratic"} 交点</span>)}
        {specs.map(({ kind }) => <span key={kind} className="inline-flex items-center gap-1.5"><span className="w-4 border-t border-dashed" style={{ borderColor: kind === "target" ? "var(--doe-cp-inline-accent)" : "var(--doe-cp-inline-limit)" }} />{kind === "target" ? "Target" : kind.toUpperCase()}</span>)}
      </div>
      <div className="mb-1 text-xs text-muted-foreground">{panel.metricLabel}{cpUnit ? ` (${cpUnit})` : ""}</div>
      <div className="domain-ui-cp-inline-chart" role="img" aria-label={`${cpParameter} · ${panel.title}，${panel.points.length} 个 Wafer 散点，${models.length} 条可见拟合曲线`}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <ComposedChart margin={{ top: 20, right: 22, bottom: 12, left: 0 }} accessibilityLayer>
            <CartesianGrid stroke="var(--border)" />
            <XAxis type="number" dataKey="x" domain={["dataMin", "dataMax"]} tickFormatter={(value: number) => formatReportCpInlineValue(value, Math.abs(value) < 10 ? 4 : 1)} tick={{ fontSize: 11 }} />
            <YAxis type="number" dataKey="y" domain={["auto", "auto"]} tickFormatter={(value: number) => formatReportCpInlineMeasurementValue(value)} tick={{ fontSize: 11 }} width={82} />
            <RechartsTooltip content={<FitPointTooltip />} />
            {specs.map(({ kind, value }) => (
              <ReferenceLine key={kind} y={value} ifOverflow="extendDomain" stroke={kind === "target" ? "var(--doe-cp-inline-accent)" : "var(--doe-cp-inline-limit)"} strokeDasharray="5 4" label={{ value: kind === "target" ? "Target" : kind.toUpperCase(), fontSize: 11, position: "insideTopRight" }} />
            ))}
            {models.map((model) => (
              <Line key={model.kind} name={model.label} data={model.series} dataKey="y" type="linear" dot={false} isAnimationActive={false} stroke={REPORT_CP_INLINE_MODEL_COLORS[model.kind]} strokeWidth={2.5} />
            ))}
            <Scatter name="Wafer" data={panel.points} fill="var(--doe-cp-inline-wafer)" isAnimationActive={false}>
              <LabelList dataKey="label" position="top" fontSize={11} />
            </Scatter>
            {roots.map((root) => <ReferenceDot key={root.id} x={root.x} y={root.y} r={4} fill="var(--background)" stroke={REPORT_CP_INLINE_MODEL_COLORS[root.model]} strokeWidth={2} ifOverflow="extendDomain" />)}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-center text-xs break-words text-muted-foreground">{inlineParameter} · Wafer Median</div>
    </div>
  )
}

function FitPointTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload?: unknown }> }) {
  if (!active || !payload?.length) return null
  const point = payload.find((entry) => {
    const candidate = entry.payload as Partial<ReportCpInlineFitPoint> | undefined
    return candidate?.grain === "WAFER" && typeof candidate.label === "string"
  })?.payload as ReportCpInlineFitPoint | undefined
  if (!point) return null
  return (
    <div className="rounded-(--doe-radius-control) border bg-background p-3 text-xs shadow-md">
      <b className="block">{point.label} · {point.role}</b>
      <span className="mt-1 block font-mono">Inline {formatReportCpInlineValue(point.x)}</span>
      <span className="block font-mono">CP {formatReportCpInlineMeasurementValue(point.y)}</span>
    </div>
  )
}
