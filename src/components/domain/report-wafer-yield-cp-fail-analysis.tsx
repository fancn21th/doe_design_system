"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import {
  visibleCpFailParameters,
  visibleCpFails,
  waferYieldPlotGeometry,
} from "@/components/domain/report-wafer-yield-cp-fail-model"
import { EmptyState } from "@/components/domain/report-parts"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ReportWaferYieldCpFail } from "@/schemas/domain-component-inputs"

const CHART_PALETTE = [
  "#ff9f0a",
  "#8e8e93",
  "#ff6b35",
  "#af52de",
  "#007aff",
  "#00a6a6",
  "#d4a017",
  "#5e5ce6",
]
const YIELD_COLOR = "#14a866"
const PLOT_HEIGHT = 220
// Keep endpoint markers, strokes and tick labels inside the SVG frame.
const PLOT_INSET = 12
const PLOT_DATA_HEIGHT = PLOT_HEIGHT - PLOT_INSET * 2
function yieldPlotY(percent: number) {
  return PLOT_INSET + ((100 - percent) / 100) * PLOT_DATA_HEIGHT
}

type ChartTooltip = {
  wafer: ReportWaferYieldCpFail["wafers"][number]
  x: number
  y: number
}

export function WaferYieldCpFailAnalysis({ input }: { input: ReportWaferYieldCpFail }) {
  const [tooltip, setTooltip] = React.useState<ChartTooltip | null>(null)
  const parameters = visibleCpFailParameters(input)
  const parameterColors = new Map(
    parameters.map((parameter, index) => [
      parameter,
      CHART_PALETTE[index % CHART_PALETTE.length],
    ])
  )
  const plotViewport = React.useRef<HTMLDivElement>(null)
  const [viewport, setViewport] = React.useState({ width: 0, compact: false })
  const { width: plotWidth, columnWidth, barWidth } = waferYieldPlotGeometry(viewport.width, input.wafers.length, viewport.compact)

  React.useEffect(() => {
    const element = plotViewport.current
    if (!element) return
    const narrow = window.matchMedia("(max-width: 767px)")
    const measure = () => setViewport({ width: element.clientWidth, compact: narrow.matches })
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    narrow.addEventListener("change", measure)
    return () => {
      observer.disconnect()
      narrow.removeEventListener("change", measure)
    }
  }, [input.wafers.length])
  React.useEffect(() => {
    if (!tooltip) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setTooltip(null)
    }
    const close = () => setTooltip(null)
    window.addEventListener("keydown", closeOnEscape)
    window.addEventListener("scroll", close, true)
    window.addEventListener("resize", close)
    return () => {
      window.removeEventListener("keydown", closeOnEscape)
      window.removeEventListener("scroll", close, true)
      window.removeEventListener("resize", close)
    }
  }, [tooltip])

  return (
    <>
      <Card data-yield-chart-card className="gap-[24px] border py-[24px] ring-0 shadow-sm">
        <CardHeader className="min-h-0! flex! flex-col flex-wrap gap-x-[24px] gap-y-[16px] px-[24px]! py-0! md:flex-row">
          <div className="min-w-0 max-w-full space-y-[8px]">
            <CardTitle className="font-semibold leading-none!">{input.title}</CardTitle>
            <CardDescription className="text-[length:var(--doe-font-body)] leading-[20px]">各 Wafer Yield 与 CP Fail 占比</CardDescription>
          </div>
          <CardAction className="flex w-full min-w-0 flex-1 items-start justify-end gap-3 md:w-auto">
            <ChartLegend
              parameters={parameters}
              parameterColors={parameterColors}
              threshold={input.failThresholdPercent}
            />
          </CardAction>
        </CardHeader>
        <CardContent className="px-[24px] pt-[24px]">
          {input.wafers.length === 0 ? (
            <EmptyState>暂无 Wafer Yield 与 CP Fail 数据</EmptyState>
          ) : (
            <div data-yield-chart-body>
              <div className="grid min-w-0 grid-cols-[4rem_minmax(0,1fr)] gap-2">
                <YieldAxis />
                <div ref={plotViewport} data-yield-plot-viewport className="min-w-0 overflow-x-auto overscroll-x-contain">
                  <div
                    className="relative" data-yield-plot
                    style={{ width: plotWidth }}
                  >
                    <svg
                      className="block h-(--doe-wafer-yield-plot-height)"
                      width={plotWidth}
                      height={PLOT_HEIGHT}
                      viewBox={`0 0 ${plotWidth} ${PLOT_HEIGHT}`}
                      role="img"
                      aria-label="各 Wafer Yield 折线与超过阈值的 CP Fail 堆叠柱"
                    >
                      {[0, 25, 50, 75, 100].map((tick) => {
                        const y = yieldPlotY(tick)
                        return (
                          <line
                            key={tick}
                            x1={0}
                            x2={plotWidth}
                            y1={y}
                            y2={y}
                            stroke="var(--border)"
                            strokeWidth={1}
                            vectorEffect="non-scaling-stroke"
                          />
                        )
                      })}
                      {input.wafers.map((wafer, index) => {
                        const centerX = (index + 0.5) * columnWidth
                        let bottom = yieldPlotY(0)
                        const fails = visibleCpFails(
                          wafer,
                          input.failThresholdPercent
                        ).sort(
                          (a, b) =>
                            parameters.indexOf(a.parameter) -
                            parameters.indexOf(b.parameter)
                        )

                        return (
                          <g key={`${wafer.waferId}-fails`}>
                            {fails.map((fail) => {
                              const requestedHeight =
                                (fail.percent / 100) * PLOT_DATA_HEIGHT
                              const height = Math.min(bottom - PLOT_INSET, requestedHeight)
                              bottom -= height
                              return (
                                <rect
                                  key={fail.parameter}
                                  x={centerX - barWidth / 2}
                                  y={bottom}
                                  width={barWidth}
                                  height={height}
                                  rx={fails.at(-1) === fail ? 4 : 0}
                                  fill={parameterColors.get(fail.parameter)}
                                />
                              )
                            })}
                          </g>
                        )
                      })}
                      {input.wafers.slice(1).map((wafer, index) => {
                        const previous = input.wafers[index]
                        if (previous.yield === null || wafer.yield === null) return null
                        return (
                          <line
                            key={`${previous.waferId}-${wafer.waferId}-yield-line`}
                            x1={(index + 0.5) * columnWidth}
                            x2={(index + 1.5) * columnWidth}
                            y1={yieldPlotY(previous.yield)}
                            y2={yieldPlotY(wafer.yield)}
                            stroke={YIELD_COLOR}
                            strokeWidth={3}
                            strokeLinecap="round"
                            vectorEffect="non-scaling-stroke"
                          />
                        )
                      })}
                      {input.wafers.map((wafer, index) =>
                        wafer.yield === null ? null : (
                          <circle
                            key={`${wafer.waferId}-yield`}
                            cx={(index + 0.5) * columnWidth}
                            cy={yieldPlotY(wafer.yield)}
                            r={4.5}
                            fill={YIELD_COLOR}
                            stroke="var(--background)"
                            strokeWidth={2}
                            vectorEffect="non-scaling-stroke"
                          />
                        )
                      )}
                    </svg>
                    <div
                      className="absolute inset-0 grid h-(--doe-wafer-yield-plot-height)"
                      style={{
                        gridTemplateColumns: `repeat(${input.wafers.length}, minmax(0, 1fr))`,
                      }}
                    >
                      {input.wafers.map((wafer) => (
                        <button
                          key={wafer.waferId}
                          type="button"
                          className="h-full border-0 bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                          aria-label={chartWaferLabel(
                            wafer,
                            input.failThresholdPercent
                          )}
                          onPointerMove={(event) =>
                            setTooltip({
                              wafer,
                              x: event.clientX + 12,
                              y: event.clientY + 12,
                            })
                          }
                          onPointerLeave={() => setTooltip(null)}
                          onFocus={(event) => {
                            const rect = event.currentTarget.getBoundingClientRect()
                            setTooltip({
                              wafer,
                              x: rect.left + rect.width / 2,
                              y: rect.top + 36,
                            })
                          }}
                          onBlur={() => setTooltip(null)}
                        />
                      ))}
                    </div>
                    <ChartXAxis
                      wafers={input.wafers}
                      plotWidth={plotWidth}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {tooltip && typeof document !== "undefined"
        ? createPortal(
            <ChartTooltipCard
              tooltip={tooltip}
              threshold={input.failThresholdPercent}
            />,
            document.body
          )
        : null}
    </>
  )
}

function ChartLegend({
  parameters,
  parameterColors,
  threshold,
}: {
  parameters: string[]
  parameterColors: Map<string, string>
  threshold: number
}) {
  return (
    <div
      className="flex min-w-0 flex-wrap items-center justify-end gap-x-5 gap-y-2 pt-1 text-xs text-muted-foreground"
      aria-label="Yield 与 CP Fail 图例"
    >
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
        <i className="relative block h-0.5 w-6 bg-[#14a866] after:absolute after:top-1/2 after:left-1/2 after:size-2 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-[#14a866]" />
        Wafer Yield
      </span>
      {parameters.map((parameter) => (
        <span
          key={parameter}
          className="inline-flex items-center gap-1.5 whitespace-nowrap"
        >
          <i
            className="size-2.5 rounded-sm"
            style={{ background: parameterColors.get(parameter) }}
          />
          {parameter}
        </span>
      ))}
      <span className="whitespace-nowrap">
        仅显示 CP Fail &gt; {threshold}%
      </span>
    </div>
  )
}

function YieldAxis() {
  return (
    <div data-yield-axis className="grid h-(--doe-wafer-yield-plot-height) grid-cols-[1rem_minmax(0,1fr)] gap-2 text-xs text-muted-foreground">
      <span data-yield-axis-title className="self-center justify-self-center whitespace-nowrap [writing-mode:vertical-rl] rotate-180">
        Yield (%)
      </span>
      <div data-yield-axis-ticks className="relative h-full tabular-nums">
        {[100, 75, 50, 25, 0].map((tick) => (
          <span key={tick} data-yield-tick={tick} className="absolute right-1 -translate-y-1/2" style={{ top: yieldPlotY(tick) }}>{tick}%</span>
        ))}
      </div>
    </div>
  )
}

function ChartXAxis({
  wafers,
  plotWidth,
}: {
  wafers: ReportWaferYieldCpFail["wafers"]
  plotWidth: number
}) {
  return (
    <div className="relative h-[6.75rem]" style={{ width: plotWidth }}>
      <div
        className="grid h-[6.75rem]"
        style={{
          gridTemplateColumns: `repeat(${wafers.length}, minmax(0, 1fr))`,
        }}
      >
        {wafers.map((wafer) => (
          <div key={wafer.waferId} className="grid grid-rows-[5.125rem_1.625rem] border-l last:border-r">
            <span
              className="flex items-start justify-center overflow-hidden pt-2 text-[10px] leading-3 text-muted-foreground [writing-mode:vertical-rl] [transform:rotate(180deg)]"
              title={(wafer.memberships?.length ?? 0) > 0 ? `${wafer.memberships?.length} memberships` : wafer.condition}
            >
              {wafer.memberships?.length === 1
                ? wafer.memberships[0].roleLabel
                : (wafer.memberships?.length ?? 0) > 1
                  ? `${wafer.memberships?.length} memberships`
                  : wafer.condition}
            </span>
            <span className="flex items-center justify-center border-t font-mono text-[10px] text-foreground">
              {wafer.waferId}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChartTooltipCard({
  tooltip,
  threshold,
}: {
  tooltip: ChartTooltip
  threshold: number
}) {
  const cardRef = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState({
    left: tooltip.x,
    top: tooltip.y,
  })
  const fails = visibleCpFails(tooltip.wafer, threshold)

  React.useLayoutEffect(() => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const left = Math.max(
      12,
      Math.min(tooltip.x, window.innerWidth - rect.width - 12)
    )
    const top = Math.max(
      12,
      tooltip.y + rect.height > window.innerHeight - 12
        ? tooltip.y - rect.height - 24
        : tooltip.y
    )
    setPosition({ left, top })
  }, [tooltip])

  return (
    <div
      ref={cardRef}
      role="tooltip"
      className="pointer-events-none fixed z-50 w-max max-w-[calc(100vw-1.5rem)] rounded-lg bg-popover p-3 text-xs text-popover-foreground shadow-lg ring-1 ring-foreground/10"
      style={position}
    >
      <strong className="mb-1.5 block text-sm">
        Wafer {tooltip.wafer.waferId.replace(/^W/i, "")}
      </strong>
      {tooltip.wafer.sourceWaferId && tooltip.wafer.sourceWaferId !== tooltip.wafer.waferId
        ? <TooltipRow label="Wafer ID" value={tooltip.wafer.sourceWaferId} />
        : null}
      <TooltipRow
        label="Yield"
        value={tooltip.wafer.yield === null ? "Unavailable" : `${tooltip.wafer.yield.toFixed(2)}%`}
      />
      {(tooltip.wafer.memberships ?? []).map((membership) => (
        <TooltipRow
          key={`${membership.stepKey}:${membership.variantRowId}`}
          label={`${membership.stage} / ${membership.step}`}
          value={`${membership.roleLabel}${membership.condition ? ` · ${membership.condition}` : ""}`}
        />
      ))}
      {fails.map((fail) => (
        <TooltipRow
          key={fail.parameter}
          label={fail.parameter}
          value={`${fail.percent?.toFixed(2)}% (${fail.failedDies === null ? "Unavailable" : fail.failedDies.toLocaleString()} dies)`}
        />
      ))}
    </div>
  )
}

function TooltipRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-52 items-center justify-between gap-5 py-0.5">
      <span className="text-muted-foreground">{label}</span>
      <strong className="font-mono font-medium">{value}</strong>
    </div>
  )
}

function chartWaferLabel(
  wafer: ReportWaferYieldCpFail["wafers"][number],
  threshold: number
) {
  const fails = visibleCpFails(wafer, threshold)
    .map((fail) => `${fail.parameter} ${fail.percent.toFixed(2)}%`)
    .join(", ")
  const memberships = (wafer.memberships ?? [])
    .map((membership) => `${membership.stage} / ${membership.step} ${membership.roleLabel}`)
    .join(", ")
  return `${wafer.sourceWaferId ?? wafer.waferId} Yield ${wafer.yield === null ? "Unavailable" : `${wafer.yield.toFixed(2)}%`}${
    fails ? `, ${fails}` : ""
  }${memberships ? `, memberships: ${memberships}` : ""}`
}
