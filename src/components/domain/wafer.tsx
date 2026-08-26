"use client"

import { useState, type ReactNode } from "react"

import { waferScenarios } from "@/components/domain/wafer.scenarios"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  waferInputSchema,
  type WaferCapabilityParameter,
  type WaferCapabilityVariant,
  type WaferInput,
} from "@/schemas/domain-component-inputs"

type WaferProps = {
  input?: WaferInput
  onSelectedParameterChange?: (parameterId: string) => void
  onSourceSnapshot?: (parameterId: string) => void
  className?: string
}

export function Wafer({
  input = waferScenarios.normal.input,
  onSelectedParameterChange,
  onSourceSnapshot,
  className,
}: WaferProps) {
  const scenarioInput = waferScenarios.normal.input
  const parsedInput = waferInputSchema.parse(input)
  const title = parsedInput.title ?? scenarioInput.title ?? "Process Capability by Wafer"
  const subtitle =
    parsedInput.subtitle ??
    scenarioInput.subtitle ??
    "按Wafer比较原始测量值、Mean ± 3σ、规格窗口与Cpk"
  const sourceLabel = parsedInput.sourceLabel ?? scenarioInput.sourceLabel ?? "SPC PARAMETER"
  const parameters = parsedInput.parameters ?? scenarioInput.parameters ?? []
  const initialParameterId =
    parsedInput.selectedParameterId ||
    scenarioInput.selectedParameterId ||
    parameters[0]?.id ||
    ""
  const [selectedParameterId, setSelectedParameterId] = useState(initialParameterId)
  const selectedParameter =
    parameters.find((parameter) => parameter.id === selectedParameterId) ??
    parameters[0]

  function selectParameter(parameterId: string) {
    setSelectedParameterId(parameterId)
    onSelectedParameterChange?.(parameterId)
  }

  return (
    <div className={cn("not-prose domain-ui-typography", className)}>
      <Card className="gap-0 overflow-hidden rounded-lg py-0 shadow-none">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>{title}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            </div>
            <Badge
              variant="outline"
              className="h-7 rounded-md border-sky-200 bg-sky-50 px-2.5 font-mono text-sky-700"
            >
              {sourceLabel}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {parameters.length === 0 ? (
            <div className="p-6">
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                暂无Wafer过程能力数据
              </div>
            </div>
          ) : (
            <div className="grid min-h-[var(--doe-wafer-panel-min-height)] grid-cols-1 overflow-hidden lg:grid-cols-[var(--doe-wafer-layout)]">
              <ParameterList
                parameters={parameters}
                selectedParameterId={selectedParameter?.id}
                onSelectParameter={selectParameter}
              />

              <main className="min-w-0">
                {selectedParameter && (
                  <>
                    <ParameterSummary parameter={selectedParameter} />
                    <VariantStrip variants={selectedParameter.variants} />
                    <CapabilitySection
                      parameter={selectedParameter}
                      onSourceSnapshot={onSourceSnapshot}
                    />
                  </>
                )}
              </main>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ParameterList({
  parameters,
  selectedParameterId,
  onSelectParameter,
}: {
  parameters: WaferCapabilityParameter[]
  selectedParameterId?: string
  onSelectParameter: (parameterId: string) => void
}) {
  return (
    <aside className="domain-ui-wafer-parameter-panel border-b bg-muted/20 lg:border-r lg:border-b-0">
      <div className="mb-3">
        <span className="block font-mono text-xs tracking-wide text-muted-foreground">
          PARAMETER
        </span>
        <b className="mt-1 block text-sm">{parameters.length} available</b>
      </div>
      <div className="domain-ui-wafer-parameter-list flex overflow-auto lg:grid">
        {parameters.map((parameter) => {
          const active = parameter.id === selectedParameterId

          return (
            <Button
              key={parameter.id}
              variant="outline"
              className={cn(
                "domain-ui-wafer-parameter-item h-auto min-w-56 justify-start rounded-lg bg-background text-left lg:min-w-0 lg:w-full",
                active &&
                  "border-sky-300 bg-sky-50 text-foreground shadow-[inset_3px_0_0_var(--primary)]"
              )}
              onClick={() => onSelectParameter(parameter.id)}
            >
              <span className="min-w-0 whitespace-normal">
                <b className="block break-all font-mono text-xs leading-5 whitespace-normal">
                  {parameter.id}
                </b>
                <span className="mt-1 block text-xs font-normal text-muted-foreground">
                  {parameter.observedWaferCount} wafers · {parameter.rawPointCount} raw
                </span>
              </span>
            </Button>
          )
        })}
      </div>
    </aside>
  )
}

function ParameterSummary({
  parameter,
}: {
  parameter: WaferCapabilityParameter
}) {
  return (
    <section className="grid border-b lg:grid-cols-[minmax(16rem,1fr)_repeat(4,var(--doe-wafer-kpi-width))]">
      <div className="p-4">
        <h3 className="break-all font-mono text-sm font-semibold">{parameter.id}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {parameter.observedWaferCount} observed wafers · {parameter.rawPointCount} raw points · sample through {parameter.sampledThrough}
        </p>
      </div>
      {[
        ["LSL", parameter.spec.lsl],
        ["TARGET", parameter.spec.target],
        ["USL", parameter.spec.usl],
        ["CPK", parameter.spec.cpk],
      ].map(([label, value]) => (
        <div key={label} className="border-t p-4 lg:border-t-0 lg:border-l">
          <span className="block font-mono text-xs text-muted-foreground">
            {label}
          </span>
          <b className="mt-1 block font-mono text-base">
            {formatMetric(Number(value))}
          </b>
        </div>
      ))}
    </section>
  )
}

function VariantStrip({
  variants,
}: {
  variants: WaferCapabilityVariant[]
}) {
  return (
    <section className="flex gap-3 overflow-auto border-b bg-muted/20 p-4">
      <div className="w-36 shrink-0 py-2">
        <b className="block font-mono text-xs text-muted-foreground">
          DERIVED VARIANTS
        </b>
        <span className="mt-1 block text-xs text-muted-foreground">
          Reference candidate is inferred, not official BSL.
        </span>
      </div>
      {variants.map((variant) => (
        <article
          key={variant.id}
          className={cn(
            "w-52 shrink-0 border border-border border-t-2 bg-background p-3",
            variant.tone === "reference" ? "border-t-emerald-600" : "border-t-sky-600"
          )}
        >
          <b className="block font-mono text-xs">{variant.id}</b>
          <span className="mt-1 block text-sm">{variant.role}</span>
          <span className="mt-1 block text-xs text-muted-foreground">
            Wafer {variant.waferId} · Tool {variant.toolId}
          </span>
        </article>
      ))}
    </section>
  )
}

function CapabilitySection({
  parameter,
  onSourceSnapshot,
}: {
  parameter: WaferCapabilityParameter
  onSourceSnapshot?: (parameterId: string) => void
}) {
  return (
    <section>
      <div className="flex items-start justify-between gap-4 border-b p-4">
        <div>
          <h3 className="text-base font-semibold">Cpk / 3σ by Wafer</h3>
          <p className="text-sm text-muted-foreground">
            Mean ± 3 sample σ with raw measurement overlay
          </p>
        </div>
        <Button
          variant="outline"
          className="border-sky-200 bg-sky-50 font-mono text-sky-700"
          onClick={() => onSourceSnapshot?.(parameter.id)}
        >
          SOURCE SNAPSHOT
        </Button>
      </div>
      <div className="overflow-auto p-4">
        <CapabilityChart parameter={parameter} />
      </div>
      <Separator />
      <div className="flex flex-wrap gap-4 p-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <i className="size-2 rounded-full bg-sky-300" />
          Raw value
        </span>
        <span className="flex items-center gap-2">
          <i className="h-0.5 w-5 bg-slate-700" />
          Mean ± 3σ
        </span>
        <span>◆ Mean</span>
        <span className="text-red-500">--- Active source SPEC</span>
      </div>
    </section>
  )
}

function CapabilityChart({
  parameter,
}: {
  parameter: WaferCapabilityParameter
}) {
  const values = [parameter.spec.lsl, parameter.spec.target, parameter.spec.usl]
  const allObserved = parameter.waferStats.flatMap((stat) => [
    stat.mean - stat.sigma * 3,
    stat.mean + stat.sigma * 3,
    ...stat.rawValues,
  ])
  const minValue = Math.min(...values, ...allObserved) - 0.04
  const maxValue = Math.max(...values, ...allObserved) + 0.04
  const width = Math.max(760, parameter.waferStats.length * 260 + 180)
  const height = 330
  const plot = {
    left: 58,
    right: width - 88,
    top: 32,
    bottom: 258,
  }
  const dataGutter = Math.min(160, Math.max(120, (plot.right - plot.left) * 0.24))
  const dataPlot = {
    left: plot.left + dataGutter,
    right: plot.right - dataGutter,
  }
  const y = (value: number) =>
    plot.bottom -
    ((value - minValue) / Math.max(0.01, maxValue - minValue)) *
      (plot.bottom - plot.top)
  const xStep =
    parameter.waferStats.length > 1
      ? (dataPlot.right - dataPlot.left) / (parameter.waferStats.length - 1)
      : 0

  return (
    <svg
      className="block h-[var(--doe-wafer-chart-height)] min-w-[47.5rem] w-full"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${parameter.id} Cpk by wafer chart`}
    >
      {[parameter.spec.usl, 4.2, parameter.spec.target, 3.8, parameter.spec.lsl].map(
        (value) => {
          const isSpec = value === parameter.spec.usl || value === parameter.spec.lsl
          const isTarget = value === parameter.spec.target

          return (
            <g key={value}>
              <line
                x1={plot.left}
                y1={y(value)}
                x2={plot.right}
                y2={y(value)}
                stroke={isSpec ? "#d94a42" : isTarget ? "#347fb8" : "#e5e7e9"}
                strokeDasharray={isSpec ? "5 4" : undefined}
              />
              <text
                x="12"
                y={y(value) + 4}
                className="fill-muted-foreground font-mono text-xs"
              >
                {value.toFixed(1)}
              </text>
            </g>
          )
        }
      )}
      <SpecLabel x={plot.right + 8} y={y(parameter.spec.usl)} color="#d33b33">
        USL {parameter.spec.usl.toFixed(1)}
      </SpecLabel>
      <SpecLabel x={plot.right + 8} y={y(parameter.spec.target)} color="#1769aa">
        TARGET {parameter.spec.target.toFixed(1)}
      </SpecLabel>
      <SpecLabel x={plot.right + 8} y={y(parameter.spec.lsl)} color="#d33b33">
        LSL {parameter.spec.lsl.toFixed(1)}
      </SpecLabel>

      {parameter.waferStats.map((stat, index) => {
        const x = parameter.waferStats.length === 1 ? width / 2 : dataPlot.left + xStep * index
        const high = y(stat.mean + stat.sigma * 3)
        const low = y(stat.mean - stat.sigma * 3)
        const raw = stat.rawValues.length > 0 ? stat.rawValues : [stat.mean]

        return (
          <g key={stat.waferId}>
            <line x1={x} y1={high} x2={x} y2={low} stroke="#265b78" strokeWidth="2" />
            <line x1={x - 22} y1={high} x2={x + 22} y2={high} stroke="#265b78" strokeWidth="2" />
            <line x1={x - 22} y1={low} x2={x + 22} y2={low} stroke="#265b78" strokeWidth="2" />
            {raw.map((value, rawIndex) => (
              <circle
                key={`${stat.waferId}-${rawIndex}`}
                aria-label={`${stat.waferId} Raw ${value.toFixed(3)}`}
                cx={x + ((rawIndex * 13) % 34) - 17}
                cy={y(value)}
                r="4"
                fill="#78a8c3"
                fillOpacity=".78"
                stroke="#fff"
              />
            ))}
            <rect
              x={x - 5}
              y={y(stat.mean) - 5}
              width="10"
              height="10"
              transform={`rotate(45 ${x} ${y(stat.mean)})`}
              fill="#2078a6"
            />
            <text
              x={x}
              y="300"
              textAnchor="middle"
              className="fill-muted-foreground font-mono text-sm"
            >
              {stat.waferId}
            </text>
            <text
              x={x}
              y="318"
              textAnchor="middle"
              className="fill-sky-700 text-xs"
            >
              Cpk {stat.cpk.toFixed(3)}
            </text>
          </g>
        )
      })}
      <text
        x={width / 2}
        y="328"
        textAnchor="middle"
        className="fill-muted-foreground text-sm"
      >
        Observed Wafer ID
      </text>
    </svg>
  )
}

function SpecLabel({
  x,
  y,
  color,
  children,
}: {
  x: number
  y: number
  color: string
  children: ReactNode
}) {
  return (
    <text x={x} y={y + 4} fill={color} fontSize="12">
      {children}
    </text>
  )
}

function formatMetric(value: number) {
  if (Number.isInteger(value)) {
    return value.toFixed(1)
  }

  return value.toString()
}
