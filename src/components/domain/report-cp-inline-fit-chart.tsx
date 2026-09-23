"use client"

import {
  CartesianGrid,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  ReferenceArea,
  ReferenceLine,
  Scatter,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  formatReportCpInlineValue,
  reportCpInlineThresholdValue,
  visibleReportCpInlineModels,
} from "@/components/domain/report-cp-inline-model"
import type {
  ReportCpInlineControlWindow,
  ReportCpInlineFitPanel,
  ReportCpInlineInput,
} from "@/schemas/domain-component-inputs"

const MODEL_COLORS = {
  linear: "var(--chart-2)",
  quadratic: "var(--chart-5)",
}

export function ReportCpInlineFitChart({
  panel,
  spec,
  controlWindows,
  quadraticEnabled,
  inlineParameter,
}: {
  panel: ReportCpInlineFitPanel
  spec: ReportCpInlineInput["spec"]
  controlWindows: ReportCpInlineControlWindow[]
  quadraticEnabled: boolean
  inlineParameter: string
}) {
  const models = visibleReportCpInlineModels(panel.models, quadraticEnabled)
  const threshold = reportCpInlineThresholdValue(panel, spec)
  const baselinePoints = panel.points.filter((point) => point.role === "BSL")
  const splitPoints = panel.points.filter((point) => point.role === "SPLIT")
  const visibleWindows = controlWindows.filter(
    (window) =>
      window.status === "available" &&
      (window.model === "linear" || quadraticEnabled)
  )

  return (
    <div className="max-w-full overflow-x-auto overscroll-x-contain">
      <div className="domain-ui-cp-inline-chart">
        <ComposedChart
          width={960}
          height={500}
          margin={{ top: 48, right: 32, bottom: 48, left: 24 }}
          accessibilityLayer
        >
          <CartesianGrid stroke="var(--border)" strokeDasharray="2 2" />
          <XAxis
            type="number"
            dataKey="x"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(value: number) => value.toFixed(2)}
            label={{
              value: `${inlineParameter} · Inline`,
              position: "insideBottom",
              offset: -28,
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={["auto", "auto"]}
            tickFormatter={(value: number) =>
              Math.abs(value) < 0.1 ? value.toPrecision(4) : value.toFixed(2)
            }
            width={72}
            label={{
              value: panel.metricLabel,
              angle: -90,
              position: "insideLeft",
            }}
          />
          <RechartsTooltip content={<FitPointTooltip />} />
          <Legend verticalAlign="top" align="left" />
          {visibleWindows.flatMap((window) =>
            window.intervals.map((interval, index) => (
              <ReferenceArea
                key={`${window.model}-${index}`}
                x1={interval.min}
                x2={interval.max}
                fill="var(--chart-1)"
                fillOpacity={0.08}
                strokeOpacity={0}
                label={`${window.model} window`}
              />
            ))
          )}
          {threshold != null && (
            <ReferenceLine
              y={threshold}
              stroke="var(--chart-4)"
              strokeWidth={2}
              strokeDasharray="8 5"
              label={`${panel.thresholdKind.toUpperCase()} ${threshold}`}
            />
          )}
          {panel.roots
            .filter(
              (root) =>
                root.domainStatus === "in-domain" &&
                (root.model === "linear" || quadraticEnabled)
            )
            .map((root) => (
              <ReferenceLine
                key={root.id}
                x={root.x}
                stroke={MODEL_COLORS[root.model]}
                strokeDasharray="2 4"
                label={`${root.model} ${formatReportCpInlineValue(root.x, 6)}`}
              />
            ))}
          {models.map((model) => (
            <Line
              key={model.kind}
              name={model.label}
              data={model.series}
              dataKey="y"
              type="linear"
              dot={false}
              isAnimationActive={false}
              stroke={MODEL_COLORS[model.kind]}
              strokeWidth={model.kind === "linear" ? 3 : 2.5}
              strokeDasharray={model.kind === "quadratic" ? "8 5" : undefined}
            />
          ))}
          <Scatter
            name="BSL"
            data={baselinePoints}
            fill="var(--chart-4)"
            isAnimationActive={false}
          >
            <LabelList dataKey="label" position="top" fontSize={11} />
          </Scatter>
          <Scatter
            name="Split"
            data={splitPoints}
            fill="var(--chart-1)"
            isAnimationActive={false}
          >
            <LabelList dataKey="label" position="top" fontSize={11} />
          </Scatter>
        </ComposedChart>
      </div>
    </div>
  )
}

function FitPointTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload?: unknown }>
}) {
  if (!active || !payload?.length) return null
  const point = payload.find((entry) => {
    const candidate = entry.payload as Partial<ReportCpInlineFitPanel["points"][number]>
    return typeof candidate.label === "string" && Array.isArray(candidate.inlineWafers)
  })?.payload as ReportCpInlineFitPanel["points"][number] | undefined
  if (!point) return null

  return (
    <div className="rounded-lg border bg-background p-3 text-xs shadow-md">
      <b className="block text-sm">{point.label}</b>
      <span className="mt-1 block font-mono">Inline {formatReportCpInlineValue(point.x, 6)}</span>
      <span className="block font-mono">CP {formatReportCpInlineValue(point.y, 6)}</span>
      <span className="mt-1 block text-muted-foreground">
        Inline Wafer {point.inlineWafers.join(", ") || "—"}
      </span>
      <span className="block text-muted-foreground">
        CP Wafer {point.cpWafers.join(", ") || "—"}
      </span>
    </div>
  )
}
