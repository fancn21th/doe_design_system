"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import {
  createMeasurementDomain,
  createMeasurementGroupReferenceLabels,
  createMeasurementHitIndex,
  createMeasurementLayout,
  createMeasurementReferenceLabels,
  groupBounds,
  groupIndexAt,
  measurementY,
  measurementOutsideReferences,
  measurementChartWidth,
  measurementGroupLabel,
  measurementWaferIdentity,
  measurementPopoverBounds,
  nearestMeasurementPoint,
  type MeasurementHitIndex,
  type MeasurementPointPresentation,
  resolveMeasurementComparison,
  type MeasurementDomain,
  type MeasurementLayout,
  type PositionedMeasurementPoint,
} from "@/components/domain/measurement-model"
import { cn } from "@/lib/utils"
import {
  measurementInputSchema,
  type MeasurementGroup,
  type MeasurementInput,
} from "@/schemas/domain-component-inputs"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const CHART_HEIGHT = 560

type ActivePoint = PositionedMeasurementPoint & { groupIndex: number }
type CanvasLayerProps = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  width: number
  height: number
}

export type MeasurementProps = {
  /** Opt into the approved Report chart card without changing other Measurement consumers. */
  appearance?: "report-chart"
  /** Individual samples use clear, spread-out circles; density remains the CP default. */
  pointPresentation?: MeasurementPointPresentation
  /** A consumer may supply fallback presentation without changing evidence state. */
  renderState?: (status: "pending" | "unavailable" | "empty") => React.ReactNode
  /** The UI-facing rendering contract. Apps adapt their upstream DTO before passing it here. */
  input: MeasurementInput
  /** Reports a whole wafer-column click without creating a persistent visual selection. */
  onGroupSelect?: (groupId: string) => void
  /** Optional report-level context rendered with the chart metadata. */
  headerAction?: React.ReactNode
  /** Explicit Step comparison context; ambiguous membership is never auto-selected. */
  activeComparisonId?: string | null
  /** Canvas dimension zoom; it does not change the supplied numeric domain. */
  canvasZoom?: number
  className?: string
}

export function Measurement({
  appearance,
  pointPresentation = "density",
  renderState,
  input,
  onGroupSelect,
  headerAction,
  activeComparisonId,
  canvasZoom = 1,
  className,
}: MeasurementProps) {
  const reportChart = appearance === "report-chart"
  const parsedInput = useMemo(() => measurementInputSchema.parse(input), [input])
  const [viewportWidth, setViewportWidth] = useState(0)
  const [viewportLeft, setViewportLeft] = useState(0)
  const [activePoint, setActivePoint] = useState<ActivePoint | null>(null)
  const [hoveredGroupIndex, setHoveredGroupIndex] = useState<number | null>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const baseCanvasRef = useRef<HTMLCanvasElement>(null)
  const pointCanvasRef = useRef<HTMLCanvasElement>(null)
  const summaryCanvasRef = useRef<HTMLCanvasElement>(null)
  const interactionCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const observer = new ResizeObserver(([entry]) => setViewportWidth(entry.contentRect.width))
    observer.observe(host)
    return () => observer.disconnect()
  }, [parsedInput.status, parsedInput.groups.length])

  const width = measurementChartWidth(viewportWidth, parsedInput.groups.length) * canvasZoom
  const chartHeight = CHART_HEIGHT * canvasZoom
  const hoveredWafer = hoveredGroupIndex === null ? null : parsedInput.groups[hoveredGroupIndex]
  const hoveredComparison = hoveredWafer ? resolveMeasurementComparison(parsedInput, hoveredWafer.id, activeComparisonId) : null
  const comparison = hoveredComparison ?? parsedInput.comparisonGroups?.find((group) => group.id === activeComparisonId)
  const displayGroups = useMemo(() => parsedInput.groups.map((group) => {
    const member = comparison?.members.find((member) => member.waferId === group.id)
    if (!member || !comparison) return group
    return { ...group, role: member.isBaselineVariant ? "baseline" as const : "experiment" as const,
      context: { stage: comparison.stageLabel, step: comparison.stepLabel, sequence: String(comparison.stepSequence), condition: member.condition, roleLabel: member.roleLabel },
      comparison: { cohortId: comparison.id, role: member.isBaselineVariant ? "baseline" as const : "variant" as const },
    }
  }), [parsedInput.groups, comparison])
  const domain = useMemo(() => createMeasurementDomain(parsedInput), [parsedInput])
  const layout = useMemo(
    () => createMeasurementLayout(width, chartHeight, parsedInput.groups.length),
    [width, chartHeight, parsedInput.groups.length],
  )
  const hitIndex = useMemo(
    () => (domain ? createMeasurementHitIndex(parsedInput, domain, layout, pointPresentation) : new Map()),
    [parsedInput, domain, layout, pointPresentation],
  )

  useEffect(() => {
    if (!domain) return
    drawPointLayer(pointCanvasRef.current, hitIndex, layout, pointPresentation)
    drawSummaryLayer(summaryCanvasRef.current, parsedInput.groups, domain, layout, pointPresentation)
  }, [parsedInput, domain, layout, hitIndex, pointPresentation])

  useEffect(() => {
    if (!domain) return
    drawBaseLayer(baseCanvasRef.current, { ...parsedInput, groups: displayGroups }, domain, layout)
  }, [parsedInput, displayGroups, domain, layout])

  useEffect(() => {
    if (!domain) return
    drawInteractionLayer(
      interactionCanvasRef.current,
      displayGroups,
      layout,
      hoveredGroupIndex,
      activePoint,
    )
  }, [displayGroups, domain, layout, hoveredGroupIndex, activePoint])

  const metricLabel = `${parsedInput.metric.label}${parsedInput.metric.unit ? ` (${parsedInput.metric.unit})` : ""}`

  if (parsedInput.status === "pending") {
    return renderState?.("pending") ?? <MeasurementState className={className} label="Measurement 数据加载中" />
  }
  if (parsedInput.status === "unavailable") {
    return renderState?.("unavailable") ?? <MeasurementState className={className} label="Measurement 数据当前不可用" />
  }
  if (!parsedInput.groups.length || !domain) {
    return renderState?.("empty") ?? <MeasurementState className={className} label="暂无 Measurement 数据" />
  }

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = interactionCanvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * layout.width
    const y = ((event.clientY - rect.top) / rect.height) * layout.height
    const groupIndex = groupIndexAt(x, layout, parsedInput.groups.length)
    setHoveredGroupIndex(groupIndex)
    const next = groupIndex === null ? null : nearestMeasurementPoint(hitIndex, groupIndex, x, y)
    setActivePoint((current) => {
      if (!next || groupIndex === null) return current ? null : current
      if (current?.point.id === next.point.id && current.groupIndex === groupIndex) return current
      return { ...next, groupIndex }
    })
  }

  const onClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = interactionCanvasRef.current
    if (!canvas || !onGroupSelect) return
    const rect = canvas.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * layout.width
    const groupIndex = groupIndexAt(x, layout, parsedInput.groups.length)
    if (groupIndex !== null) onGroupSelect(parsedInput.groups[groupIndex].id)
  }

  return (
    <Card size={reportChart ? "default" : "sm"} className={cn("min-w-0 w-full max-w-full border ring-0 shadow-none", reportChart && "gap-[24px] py-[24px] rounded-xl shadow-sm", className)}>
      <CardHeader className={cn("flex flex-wrap items-start justify-between gap-3", reportChart ? "min-h-0! px-[24px]! py-0!" : "border-b")}>
        <div className={cn("min-w-0 break-words", reportChart && "grid gap-[8px]")}>
          <CardTitle className={reportChart ? "text-[16px] font-semibold leading-[16px]" : undefined}>{parsedInput.title ?? "Measurement"}</CardTitle>
          {parsedInput.subtitle && <CardDescription className={reportChart ? "text-[14px] leading-[20px]" : undefined}>{parsedInput.subtitle}</CardDescription>}
        </div>
        <CardAction className="min-w-0 max-w-full flex flex-wrap items-center justify-end gap-2 break-words text-xs text-muted-foreground">
          {headerAction}
          {parsedInput.sourceLabel && <span className="rounded-md border px-2 py-1">{parsedInput.sourceLabel}</span>}
          <span className="rounded-md border px-2 py-1">{parsedInput.groups.length} wafers</span>
          <span className="rounded-md border px-2 py-1">{parsedInput.metric.label}</span>

          {reportChart && <MeasurementLegend individual={pointPresentation === "individual"} />}
        </CardAction>
      </CardHeader>
      <CardContent className={cn("min-w-0", reportChart ? "px-[8px] pt-[16px] sm:px-[24px] sm:pt-[24px]" : "px-0")}>
        {!reportChart && <MeasurementLegend className="px-3" individual={pointPresentation === "individual"} />}
        {pointPresentation === "individual" && <div className="flex flex-wrap gap-x-4 gap-y-1 px-3 pt-2 text-xs text-muted-foreground" aria-label="视野外参考值">
          {measurementOutsideReferences(parsedInput, domain).map((line, index) => <span key={`${line.groupLabel ?? "shared"}:${line.id}:${index}`}>
            {line.groupLabel ? `${line.groupLabel} · ` : ""}{line.label} {line.value} · {line.direction === "below" ? "低于当前显示范围" : "高于当前显示范围"}
          </span>)}
        </div>}
        <dl className="sr-only" aria-label="晶圆专属参考线">
          {parsedInput.groups.flatMap((group) => (group.referenceLines ?? []).map((line) => (
            <div key={`${group.id}:${line.id}`}><dt>{group.label} · {line.label}</dt><dd>{line.value}</dd></div>
          )))}
        </dl>
        <div className={cn("min-w-0 max-w-full overflow-x-auto", !reportChart && "p-3")} ref={hostRef} onScroll={(event) => setViewportLeft(event.currentTarget.scrollLeft)} tabIndex={0} aria-label="Measurement 图表横向滚动区">
          <div className="relative" style={{ width, minWidth: width, height: chartHeight }}>
            <CanvasLayer canvasRef={baseCanvasRef} width={width} height={chartHeight} />
            {pointPresentation === "individual" ? <>
              <CanvasLayer canvasRef={summaryCanvasRef} width={width} height={chartHeight} />
              <CanvasLayer canvasRef={pointCanvasRef} width={width} height={chartHeight} />
            </> : <>
              <CanvasLayer canvasRef={pointCanvasRef} width={width} height={chartHeight} />
              <CanvasLayer canvasRef={summaryCanvasRef} width={width} height={chartHeight} />
            </>}
            <canvas
              data-hover-comparison={hoveredComparison?.id ?? ""}
              data-hover-wafer={hoveredWafer?.id ?? ""}
              data-canvas-zoom={canvasZoom}
              aria-label={`${metricLabel} grouped distribution. Click a wafer column to select it.`}
              className="absolute inset-0 cursor-crosshair"
              height={chartHeight}
              onClick={onClick}
              onPointerLeave={() => { setActivePoint(null); setHoveredGroupIndex(null) }}
              onPointerMove={onPointerMove}
              ref={interactionCanvasRef}
              role="img"
              title={hoveredGroupIndex === null ? undefined : groupIdentity(parsedInput.groups[hoveredGroupIndex])}
              width={width}
            />
            {hoveredGroupIndex !== null && displayGroups[hoveredGroupIndex] && (
              <PointPopover
                group={displayGroups[hoveredGroupIndex]}
                metric={parsedInput.metric}
                point={activePoint}
                viewportLeft={viewportLeft}
                viewportWidth={viewportWidth}
                leftAnchor={groupBounds(hoveredGroupIndex, layout).center}
                membershipCount={(parsedInput.comparisonGroups ?? []).filter((group) => group.members.some((member) => member.waferId === displayGroups[hoveredGroupIndex].id)).length}
                comparisonResolved={Boolean(hoveredComparison)}
              />
            )}
            {parsedInput.groups.map((group, index) => <button
              key={group.id} type="button" aria-label={`查看 ${measurementWaferIdentity(group)} 晶圆比较组明细`}
              className="absolute bottom-0 h-10 rounded focus-visible:outline-2 focus-visible:outline-primary"
              style={{ left: groupBounds(index, layout).left, width: layout.groupWidth }}
              onClick={() => onGroupSelect?.(group.id)}
              onFocus={() => setHoveredGroupIndex(index)} onBlur={() => setHoveredGroupIndex(null)}
            ><span className="sr-only">{group.label}</span></button>)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CanvasLayer({ canvasRef, width, height }: CanvasLayerProps) {
  return <canvas aria-hidden className="pointer-events-none absolute inset-0" height={height} ref={canvasRef} width={width} />
}

function MeasurementState({ className, label }: { className?: string; label: string }) {
  return <Card className={cn("border ring-0 shadow-none", className)}><CardContent className="p-8 text-center text-sm text-muted-foreground">{label}</CardContent></Card>
}

function LegendMark({ color, dashed, label }: { color: string; dashed?: boolean; label: string }) {
  return <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full" style={dashed ? { borderTop: `2px dashed ${color}`, borderRadius: 0, width: 18 } : { backgroundColor: color }} />{label}</span>
}

function PointPopover({ group, metric, point, viewportLeft, viewportWidth, leftAnchor, membershipCount, comparisonResolved }: {
  group: MeasurementGroup; metric: MeasurementInput["metric"]; point: ActivePoint | null; viewportLeft: number; viewportWidth: number;
  leftAnchor: number; membershipCount: number; comparisonResolved: boolean;
}) {
  const { left, width } = measurementPopoverBounds(leftAnchor, viewportLeft, viewportWidth)
  const rows = [
    ["CP Parameter", metric.label],
    ["Rendered points", String(group.summary.count)],
    ["统计样本 N", group.capability?.n == null ? "—" : String(group.capability.n)],
    ["Mean", formatValue(group.summary.mean)],
    ["Median", formatValue(group.summary.median)],
    ["Sample σ", formatValue(group.summary.sampleSigma)],
    [group.capability?.specSource === "SOURCE" ? "SOURCE CPK" : "CPK", formatValue(group.capability?.cpk)],
    ["CPU", formatValue(group.capability?.cpu)],
    ["CPL", formatValue(group.capability?.cpl)],
    ["Capability 状态", group.capability?.status ?? "未提供"],
    ...(membershipCount > 1 && !comparisonResolved ? [["比较组", `多归属 · ${membershipCount} 个比较组，请选择比较组`]] : [
      ["Stage / Step / Seq", [group.context?.stage, group.context?.step, group.context?.sequence].filter(Boolean).join(" / ") || "未提供"],
      ["Role / Condition", [group.context?.roleLabel ?? (group.role === "baseline" ? "BSL" : group.role === "experiment" ? "Split" : null), group.context?.condition].filter(Boolean).join(" · ") || "未提供"],
    ]),
    ...(point ? [
      ["Measured Value", `${formatValue(point.point.value)}${metric.unit ? ` ${metric.unit}` : ""}`],
      ["Source Status", point.point.sourceStatus],
      ...(point.point.finalBin != null ? [["Final Bin", point.point.finalBin]] : []),
      ...(point.point.result !== undefined ? [["Die Result", point.point.result]] : []),
    ] : []),
    ...(group.referenceLines ?? []).map((line) => [line.label, formatValue(line.value)]),
  ]
  return <aside data-measurement-wafer-tooltip={group.id} className="pointer-events-none absolute top-12 z-10 max-h-[470px] w-[308px] overflow-y-auto rounded-xl border bg-background/95 p-4 shadow-xl backdrop-blur" style={{ left, width }}>
    <p className="border-b pb-2 text-sm font-semibold">{measurementWaferIdentity(group)}{point ? ` · DIE_X ${point.point.x} / DIE_Y ${point.point.y}` : " · Wafer Statistics"}</p>
    <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
      {rows.map(([label, value]) => <div className="contents" key={label}><dt className="text-muted-foreground">{label}</dt><dd className="break-words font-semibold">{value}</dd></div>)}
    </dl>
  </aside>
}

function drawBaseLayer(canvas: HTMLCanvasElement | null, input: MeasurementInput, domain: MeasurementDomain, layout: MeasurementLayout) {
  const context = prepareContext(canvas, layout)
  if (!context) return
  context.clearRect(0, 0, layout.width, layout.height)
  context.font = "12px ui-sans-serif, system-ui, sans-serif"
  context.textAlign = "right"
  const ticks = 8
  const tickWidth = layout.left - 42
  for (let index = 0; index <= ticks; index++) {
    const value = domain.minimum + ((domain.maximum - domain.minimum) * index) / ticks
    const y = measurementY(value, domain, layout)
    context.strokeStyle = "#e7edf1"
    context.lineWidth = 1
    context.beginPath(); context.moveTo(layout.left, y); context.lineTo(layout.width - layout.right, y); context.stroke()
    context.fillStyle = "#64748b"
    context.fillText(fitCanvasText(context, formatValue(value), tickWidth), layout.left - 10, y + 4)
  }
  context.save()
  context.translate(18, layout.top + layout.plotHeight / 2)
  context.rotate(-Math.PI / 2)
  context.textAlign = "center"
  context.fillStyle = "#475569"
  context.fillText(fitCanvasText(context, `${input.metric.label}${input.metric.unit ? ` (${input.metric.unit})` : ""}`, layout.plotHeight - 16), 0, 0)
  context.restore()
  input.referenceLines.forEach((line) => {
    if (line.value < domain.minimum || line.value > domain.maximum) return
    const y = measurementY(line.value, domain, layout)
    context.strokeStyle = line.kind === "mock-spec" ? "#b45309" : "#a94b3b"
    context.setLineDash([7, 5])
    context.beginPath(); context.moveTo(layout.left, y); context.lineTo(layout.width - layout.right, y); context.stroke()
    context.setLineDash([])
  })
  context.font = "12px ui-sans-serif, system-ui, sans-serif"
  context.textAlign = "left"
  createMeasurementReferenceLabels(input.referenceLines, domain, layout).forEach(({ lines, value, anchorY, labelY }) => {
    context.fillStyle = lines[0].kind === "mock-spec" ? "#b45309" : "#a94b3b"
    const text = fitCanvasText(context, `${lines.map((line) => line.label).join(" / ")} ${formatValue(value)}`, layout.plotWidth - 12)
    // A quiet label backing preserves readability where a reference crosses the die cloud.
    context.save()
    context.fillStyle = "rgba(255, 255, 255, 0.92)"
    context.fillRect(layout.left + 2, labelY - 13, context.measureText(text).width + 6, 16)
    context.restore()
    context.fillText(text, layout.left + 4, labelY)
    if (Math.abs(labelY - (anchorY - 6)) > 6) {
      context.strokeStyle = context.fillStyle
      context.beginPath(); context.moveTo(layout.left + 2, Math.max(layout.top, Math.min(anchorY, layout.top + layout.plotHeight))); context.lineTo(layout.left + 2, labelY - 4); context.stroke()
    }
  })
  createMeasurementGroupReferenceLabels(input, domain, layout).forEach(({ lines, value, anchorY, labelY, left, right }) => {
    context.strokeStyle = lines[0].kind === "mock-spec" ? "#b45309" : "#a94b3b"
    context.setLineDash([7, 5])
    context.beginPath(); context.moveTo(left, anchorY); context.lineTo(right, anchorY); context.stroke()
    context.setLineDash([])
    context.textAlign = "left"
    context.fillStyle = context.strokeStyle
    const text = fitCanvasText(context, `${lines.map((line) => line.label).join(" / ")} ${formatValue(value)}`, right - left - 4)
    context.save()
    context.fillStyle = "rgba(255, 255, 255, 0.92)"
    context.fillRect(left, labelY - 13, context.measureText(text).width + 4, 16)
    context.restore()
    context.fillText(text, left + 2, labelY)
    if (Math.abs(labelY - (anchorY - 6)) > 6) {
      context.beginPath(); context.moveTo(left, anchorY); context.lineTo(left, labelY - 4); context.stroke()
    }
  })
  input.groups.forEach((group, index) => {
    const bounds = groupBounds(index, layout)
    context.textAlign = "center"
    context.fillStyle = group.role === "baseline" ? "#1d4ed8" : "#475569"
    context.font = "600 12px ui-sans-serif, system-ui, sans-serif"
    context.fillText(fitCanvasText(context, measurementGroupLabel(group.label), layout.groupWidth - 12), bounds.center, layout.height - 26)
    const detail = group.context?.roleLabel
      ? [group.context.roleLabel, group.context.condition].filter(Boolean).join(" · ")
      : group.context?.stage ?? (group.role === "baseline" ? "BSL" : "")
    if (detail) { context.font = "11px ui-sans-serif, system-ui, sans-serif"; context.fillStyle = "#64748b"; context.fillText(fitCanvasText(context, detail, layout.groupWidth - 12), bounds.center, layout.height - 10) }
  })
}

function groupIdentity(group: MeasurementGroup | undefined) {
  if (!group) return undefined
  return [measurementWaferIdentity(group), group.context?.stage, group.context?.step, group.context?.sequence, group.context?.condition, ...(group.referenceLines ?? []).map((line) => `${line.label} ${formatValue(line.value)}`)].filter(Boolean).join(" · ")
}

function fitCanvasText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (context.measureText(text).width <= maxWidth) return text
  let length = text.length
  while (length > 0 && context.measureText(`${text.slice(0, length)}…`).width > maxWidth) length--
  return `${text.slice(0, length)}…`
}

function drawPointLayer(canvas: HTMLCanvasElement | null, hitIndex: MeasurementHitIndex, layout: MeasurementLayout, presentation: MeasurementPointPresentation) {
  const context = prepareContext(canvas, layout)
  if (!context) return
  context.clearRect(0, 0, layout.width, layout.height)
  const individual = presentation === "individual"
  context.fillStyle = individual ? "rgba(37, 99, 166, 0.85)" : "rgba(37, 99, 166, 0.20)"
  context.strokeStyle = "rgba(255, 255, 255, 0.90)"
  context.lineWidth = 0.8
  // Paint the exact coordinates used by hover lookup; retain every supplied visible point.
  for (const points of hitIndex.values()) for (const { x, y } of points) {
    if (individual) {
      context.beginPath(); context.arc(x, y, 4, 0, Math.PI * 2); context.fill(); context.stroke()
    } else context.fillRect(x - 1.25, y - 1.25, 2.5, 2.5)
  }
}

function drawSummaryLayer(canvas: HTMLCanvasElement | null, groups: MeasurementGroup[], domain: MeasurementDomain, layout: MeasurementLayout, presentation: MeasurementPointPresentation) {
  const context = prepareContext(canvas, layout)
  if (!context) return
  context.clearRect(0, 0, layout.width, layout.height)
  context.save(); context.beginPath(); context.rect(layout.left, layout.top, layout.plotWidth, layout.plotHeight); context.clip()
  groups.forEach((group, index) => {
    const { summary } = group
    if ([summary.q1, summary.q3, summary.mean, summary.median, summary.whiskerLow, summary.whiskerHigh, summary.sampleSigma].some((value) => value === null)) return
    const bounds = groupBounds(index, layout)
    const boxHalfWidth = Math.min(22, layout.groupWidth * 0.28)
    const meanY = measurementY(summary.mean!, domain, layout)
    const medianY = measurementY(summary.median!, domain, layout)
    const lowY = measurementY(summary.whiskerLow!, domain, layout)
    const highY = measurementY(summary.whiskerHigh!, domain, layout)
    const q1Y = measurementY(summary.q1!, domain, layout)
    const q3Y = measurementY(summary.q3!, domain, layout)
    const sigmaLow = measurementY(summary.mean! - summary.sampleSigma! * 3, domain, layout)
    const sigmaHigh = measurementY(summary.mean! + summary.sampleSigma! * 3, domain, layout)
    context.strokeStyle = "#8b5cf6"; context.lineWidth = 1.8
    context.beginPath(); context.moveTo(bounds.center, sigmaLow); context.lineTo(bounds.center, sigmaHigh); context.stroke()
    context.strokeStyle = "#71717a"; context.lineWidth = 1.4
    context.beginPath(); context.moveTo(bounds.center, highY); context.lineTo(bounds.center, lowY); context.stroke()
    context.beginPath(); context.moveTo(bounds.center - 6, highY); context.lineTo(bounds.center + 6, highY); context.moveTo(bounds.center - 6, lowY); context.lineTo(bounds.center + 6, lowY); context.stroke()
    context.fillStyle = presentation === "individual" ? "rgba(37, 99, 166, 0.08)" : "rgba(37, 99, 166, 0.82)"
    context.fillRect(bounds.center - boxHalfWidth, q3Y, boxHalfWidth * 2, Math.max(1, q1Y - q3Y))
    if (presentation === "individual") {
      context.strokeStyle = "#94a3b8"; context.lineWidth = 1
      context.strokeRect(bounds.center - boxHalfWidth, q3Y, boxHalfWidth * 2, Math.max(1, q1Y - q3Y))
    }
    context.strokeStyle = "#c53a3a"; context.lineWidth = 2
    context.beginPath(); context.moveTo(bounds.center - boxHalfWidth, medianY); context.lineTo(bounds.center + boxHalfWidth, medianY); context.stroke()
    context.fillStyle = "#0f766e"
    context.beginPath(); context.arc(bounds.center, meanY, 4.5, 0, Math.PI * 2); context.fill()
    context.fillStyle = "#ffffff"
    context.beginPath(); context.arc(bounds.center, meanY, 2, 0, Math.PI * 2); context.fill()
  })
  context.restore()
}

function drawInteractionLayer(canvas: HTMLCanvasElement | null, groups: MeasurementGroup[], layout: MeasurementLayout, hoveredGroupIndex: number | null, activePoint: ActivePoint | null) {
  const context = prepareContext(canvas, layout)
  if (!context) return
  context.clearRect(0, 0, layout.width, layout.height)
  const hoveredCohort = hoveredGroupIndex === null ? undefined : groups[hoveredGroupIndex]?.comparison?.cohortId
  if (hoveredCohort) groups.forEach((group, index) => {
    if (group.comparison?.cohortId !== hoveredCohort) return
    const bounds = groupBounds(index, layout)
    const baseline = group.comparison.role === "baseline"
    context.fillStyle = baseline ? "rgba(37, 99, 235, 0.08)" : "rgba(15, 118, 110, 0.06)"
    context.strokeStyle = baseline ? "#2563eb" : "#0f766e"
    context.lineWidth = 2.5
    context.fillRect(bounds.left + 1.5, layout.top, layout.groupWidth - 3, layout.plotHeight)
    context.strokeRect(bounds.left + 1.5, layout.top, layout.groupWidth - 3, layout.plotHeight)
  })
  if (activePoint) {
    context.strokeStyle = "#ffffff"; context.lineWidth = 3
    context.beginPath(); context.arc(activePoint.x, activePoint.y, 5, 0, Math.PI * 2); context.stroke()
    context.strokeStyle = "#0f172a"; context.lineWidth = 1.5
    context.beginPath(); context.arc(activePoint.x, activePoint.y, 5, 0, Math.PI * 2); context.stroke()
  }
}

function prepareContext(canvas: HTMLCanvasElement | null, layout: MeasurementLayout) {
  if (!canvas) return null
  const ratio = Math.min(window.devicePixelRatio || 1, 2)
  if (canvas.width !== Math.round(layout.width * ratio) || canvas.height !== Math.round(layout.height * ratio)) {
    canvas.width = Math.round(layout.width * ratio)
    canvas.height = Math.round(layout.height * ratio)
    canvas.style.width = `${layout.width}px`
    canvas.style.height = `${layout.height}px`
  }
  const context = canvas.getContext("2d")
  if (!context) return null
  context.setTransform(ratio, 0, 0, ratio, 0, 0)
  return context
}

function formatValue(value: number | null | undefined) {
  if (value === null || value === undefined) return "—"
  if (Math.abs(value) >= 1000 || Math.abs(value) < 0.01) return value.toExponential(3)
  return value.toFixed(Math.abs(value) < 1 ? 4 : 3).replace(/\.?(0+)$/, "")
}

function MeasurementLegend({ className, individual }: { className?: string; individual?: boolean }) {
  return <div className={cn("flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground", className)}>
    <LegendMark color="#2563a6" label={individual ? "measurement point" : "die point"} />
    <LegendMark color="#0f766e" label="mean" />
    <LegendMark color="#c53a3a" label="median" />
    <LegendMark color="#7c3aed" label="mean ±3σ" />
    <LegendMark color="#b45309" dashed label="reference" />
  </div>
}
