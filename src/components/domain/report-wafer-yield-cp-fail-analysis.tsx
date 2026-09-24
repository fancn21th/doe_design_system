"use client"

import { ChevronDown } from "lucide-react"
import * as React from "react"
import { createPortal } from "react-dom"

import {
  groupConsecutiveWaferSteps,
  visibleCpFailParameters,
  visibleCpFails,
} from "@/components/domain/report-wafer-yield-cp-fail-model"
import { EmptyState } from "@/components/domain/report-parts"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
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
const MIN_PLOT_WIDTH = 1100
const COLUMN_WIDTH = 44

type ChartTooltip = {
  wafer: ReportWaferYieldCpFail["wafers"][number]
  x: number
  y: number
}

export function WaferYieldCpFailAnalysis({ input }: { input: ReportWaferYieldCpFail }) {
  const [open, setOpen] = React.useState(true)
  const [tooltip, setTooltip] = React.useState<ChartTooltip | null>(null)
  const parameters = visibleCpFailParameters(input)
  const parameterColors = new Map(
    parameters.map((parameter, index) => [
      parameter,
      CHART_PALETTE[index % CHART_PALETTE.length],
    ])
  )
  const plotWidth = Math.max(MIN_PLOT_WIDTH, input.wafers.length * COLUMN_WIDTH)
  const columnWidth = input.wafers.length > 0
    ? plotWidth / input.wafers.length
    : COLUMN_WIDTH
  const groups = groupConsecutiveWaferSteps(input.wafers)

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
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card size="sm" className="gap-0 border py-0 ring-0 shadow-none">
        <CardHeader className="border-b">
          <CardTitle className="text-base">{input.title}</CardTitle>
          <CardAction>
            <CollapsibleTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${open ? "收起" : "展开"} ${input.title}`}
                >
                  <ChevronDown
                    className={cn(
                      "transition-transform",
                      !open && "-rotate-90"
                    )}
                  />
                </Button>
              }
            />
          </CardAction>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="p-0">
            {input.wafers.length === 0 ? (
              <EmptyState>暂无 Wafer Yield 与 CP Fail 数据</EmptyState>
            ) : (
              <div className="p-4">
                <ChartLegend
                  parameters={parameters}
                  parameterColors={parameterColors}
                  threshold={input.failThresholdPercent}
                />
                <div className="grid min-w-0 grid-cols-[3rem_minmax(0,1fr)] gap-2">
                  <YieldAxis />
                  <div className="min-w-0 overflow-x-auto overscroll-x-contain">
                    <div
                      className="relative min-w-(--doe-wafer-yield-chart-min-width)"
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
                          const y = PLOT_HEIGHT - (tick / 100) * PLOT_HEIGHT
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
                          let bottom = PLOT_HEIGHT
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
                                  (fail.percent / 100) * PLOT_HEIGHT
                                const height = Math.min(bottom, requestedHeight)
                                bottom -= height
                                return (
                                  <rect
                                    key={fail.parameter}
                                    x={centerX - 12}
                                    y={bottom}
                                    width={24}
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
                              y1={PLOT_HEIGHT - (previous.yield / 100) * PLOT_HEIGHT}
                              y2={PLOT_HEIGHT - (wafer.yield / 100) * PLOT_HEIGHT}
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
                              cy={PLOT_HEIGHT - (wafer.yield / 100) * PLOT_HEIGHT}
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
                        groups={groups}
                        columnWidth={columnWidth}
                        plotWidth={plotWidth}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
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
    </Collapsible>
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
      className="mb-3 ml-14 flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-xs text-muted-foreground"
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
    <div className="relative h-(--doe-wafer-yield-plot-height) text-xs text-muted-foreground">
      <span className="absolute top-1/2 -left-3 -translate-y-1/2 -rotate-90 whitespace-nowrap">
        Yield (%)
      </span>
      <div className="flex h-full flex-col items-end justify-between pr-1 tabular-nums">
        {[100, 75, 50, 25, 0].map((tick) => (
          <span key={tick}>{tick}%</span>
        ))}
      </div>
    </div>
  )
}

function ChartXAxis({
  wafers,
  groups,
  columnWidth,
  plotWidth,
}: {
  wafers: ReportWaferYieldCpFail["wafers"]
  groups: Array<{ step: string; startIndex: number; count: number }>
  columnWidth: number
  plotWidth: number
}) {
  return (
    <div className="relative h-[9.125rem]" style={{ width: plotWidth }}>
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
              title={wafer.condition}
            >
              {wafer.condition}
            </span>
            <span className="flex items-center justify-center border-t font-mono text-[10px] text-foreground">
              {wafer.waferId}
            </span>
          </div>
        ))}
      </div>
      {groups.map((group) => (
        <span
          key={`${group.step}-${group.startIndex}`}
          className="absolute top-[6.75rem] flex h-[2.375rem] items-start justify-center overflow-hidden border-t border-l bg-background px-1 pt-1.5 text-center text-[10px] leading-3 text-foreground last:border-r"
          style={{
            left: group.startIndex * columnWidth,
            width: group.count * columnWidth,
          }}
          title={group.step}
        >
          {group.step}
        </span>
      ))}
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
      <TooltipRow
        label="Yield"
        value={tooltip.wafer.yield === null ? "Unavailable" : `${tooltip.wafer.yield.toFixed(2)}%`}
      />
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
  return `${wafer.waferId} Yield ${wafer.yield === null ? "Unavailable" : `${wafer.yield.toFixed(2)}%`}${
    fails ? `, ${fails}` : ""
  }`
}
