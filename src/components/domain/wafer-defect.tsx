"use client"

import { useState, type KeyboardEvent, type MouseEvent } from "react"
import { ChevronDown, ChevronLeft, ChevronRight, Expand } from "lucide-react"

import { waferDefectScenarios } from "@/components/domain/wafer-defect.scenarios"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  waferDefectInputSchema,
  type WaferDefectEvidence,
  type WaferDefectInput,
  type WaferDefectPoint,
  type WaferDefectSummary,
} from "@/schemas/domain-component-inputs"

type WaferDefectProps = {
  input?: WaferDefectInput
  onSelectedWaferChange?: (waferId: string) => void
  className?: string
}

type HoverState = {
  point: WaferDefectPoint
  x: number
  y: number
} | null

export function WaferDefect({
  input = waferDefectScenarios.normal.input,
  onSelectedWaferChange,
  className,
}: WaferDefectProps) {
  const scenarioInput = waferDefectScenarios.normal.input
  const parsedInput = waferDefectInputSchema.parse(input)
  const title = parsedInput.title ?? scenarioInput.title ?? "Wafer Defect Map"
  const subtitle =
    parsedInput.subtitle ??
    scenarioInput.subtitle ??
    "按异常Wafer查看缺陷数量、类型、Die位置与缺陷明细"
  const sourceLabel =
    parsedInput.sourceLabel ?? scenarioInput.sourceLabel ?? "SPC DEFECT"
  const sourceNote =
    parsedInput.sourceNote ??
    scenarioInput.sourceNote ??
    "Source-backed: Wafer缺陷数量与采样时间来自SPC；点位、坐标、类型和缺陷图为原型示意。"
  const wafers = parsedInput.wafers ?? scenarioInput.wafers ?? []

  const initialWaferId =
    parsedInput.selectedWaferId ||
    scenarioInput.selectedWaferId ||
    wafers[0]?.waferId ||
    ""
  const [selectedWaferId, setSelectedWaferId] = useState(initialWaferId)
  const selectedWafer =
    wafers.find((wafer) => wafer.waferId === selectedWaferId) ?? wafers[0]
  const [selectedPointId, setSelectedPointId] = useState(
    selectedWafer?.points[0]?.id ?? ""
  )
  const selectedPoint =
    selectedWafer?.points.find((point) => point.id === selectedPointId) ??
    selectedWafer?.points[0]
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [defectTypesExpanded, setDefectTypesExpanded] = useState(false)
  const [hoverState, setHoverState] = useState<HoverState>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const typeStats = getTypeStats(selectedWafer)
  const visibleTypeStats = defectTypesExpanded ? typeStats : typeStats.slice(0, 5)
  const selectedEvidence = selectedPoint
    ? selectedPoint.defects[selectedImageIndex % selectedPoint.defects.length]
    : undefined

  function selectWafer(waferId: string) {
    const wafer = wafers.find((item) => item.waferId === waferId)
    if (!wafer) {
      return
    }

    setSelectedWaferId(waferId)
    setSelectedPointId(wafer.points[0]?.id ?? "")
    setSelectedImageIndex(0)
    setDefectTypesExpanded(false)
    setHoverState(null)
    onSelectedWaferChange?.(waferId)
  }

  function selectPoint(point: WaferDefectPoint) {
    setSelectedPointId(point.id)
    setSelectedImageIndex(0)
    setHoverState(null)
  }

  function moveHover(event: MouseEvent<SVGElement>, point: WaferDefectPoint) {
    setHoverState({
      point,
      x: event.clientX + 14,
      y: event.clientY + 14,
    })
  }

  function stepImage(direction: number) {
    if (!selectedPoint || selectedPoint.defects.length === 0) {
      return
    }

    setSelectedImageIndex(
      (current) =>
        (current + direction + selectedPoint.defects.length) %
        selectedPoint.defects.length
    )
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
          <div className="border-b border-amber-200 bg-amber-50 px-5 py-2.5 text-sm text-amber-900">
            <b>Source-backed:</b>{" "}
            {sourceNote.replace(/^Source-backed:\s*/, "")}
          </div>

          {wafers.length === 0 ? (
            <div className="p-6">
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                暂无Wafer缺陷数据
              </div>
            </div>
          ) : (
            <div className="grid min-h-[var(--doe-defect-panel-min-height)] grid-cols-1 overflow-x-auto overflow-y-hidden lg:grid-cols-[var(--doe-defect-layout)]">
              <WaferList
                wafers={wafers}
                selectedWaferId={selectedWafer?.waferId}
                onSelectWafer={selectWafer}
              />

              <section className="domain-ui-defect-map-panel border-r bg-[linear-gradient(#e8edf1_1px,transparent_1px),linear-gradient(90deg,#e8edf1_1px,transparent_1px)] bg-[size:var(--doe-defect-grid-size)_var(--doe-defect-grid-size)]">
                <h3 className="text-base font-semibold">
                  {selectedWafer?.waferId} Defect Position View
                </h3>
                <div className="mt-3 flex justify-center">
                  <WaferMap
                    points={selectedWafer?.points ?? []}
                    selectedPointId={selectedPoint?.id}
                    onSelectPoint={selectPoint}
                    onHoverPoint={moveHover}
                    onLeavePoint={() => setHoverState(null)}
                  />
                </div>
                <p className="mt-3 max-w-[var(--doe-defect-map-column-min)] text-sm text-muted-foreground">
                  悬停点位查看Wafer、坐标、缺陷数量和类型；点击后在右侧查看缺陷图。
                </p>
              </section>

              <aside className="domain-ui-defect-detail-panel">
                <div className="flex items-end gap-3">
                  <b className="font-mono text-2xl">{selectedWafer?.waferId}</b>
                  <span className="text-sm text-muted-foreground">
                    {selectedWafer?.sampledAt ?? "sample time unknown"}
                  </span>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">缺陷总数</span>
                  <b className="text-2xl text-red-700">
                    {selectedWafer?.defectCount ?? 0}
                  </b>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">
                      缺陷类型分布
                    </span>
                    {typeStats.length > 5 && (
                      <Button
                        aria-label={
                          defectTypesExpanded
                            ? "收起缺陷类型列表"
                            : "展开缺陷类型列表"
                        }
                        title={defectTypesExpanded ? "收起为Top 5" : "展开全部类型"}
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDefectTypesExpanded((open) => !open)}
                      >
                        <ChevronDown
                          className={cn(
                            "transition-transform",
                            defectTypesExpanded && "rotate-180"
                          )}
                        />
                      </Button>
                    )}
                  </div>
                  <div className="mt-3 space-y-2">
                    {visibleTypeStats.map((item) => (
                      <DefectBar
                        key={item.type}
                        label={item.type}
                        value={item.value}
                        total={selectedWafer?.defectCount ?? 0}
                      />
                    ))}
                  </div>
                </div>

                <Separator className="my-8" />

                <DefectImagePanel
                  point={selectedPoint}
                  evidence={selectedEvidence}
                  index={selectedImageIndex}
                  onStepImage={stepImage}
                  onOpenDetail={() => setDetailOpen(true)}
                />
              </aside>
            </div>
          )}
        </CardContent>
      </Card>

      <DefectHoverTooltip state={hoverState} waferId={selectedWafer?.waferId} />
      <DefectDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        wafer={selectedWafer}
        point={selectedPoint}
        evidence={selectedEvidence}
        imageIndex={selectedImageIndex}
        onStepImage={stepImage}
      />
    </div>
  )
}

function WaferList({
  wafers,
  selectedWaferId,
  onSelectWafer,
}: {
  wafers: WaferDefectSummary[]
  selectedWaferId?: string
  onSelectWafer: (waferId: string) => void
}) {
  return (
    <aside className="domain-ui-defect-wafer-panel flex overflow-auto border-b bg-muted/20 lg:flex-col lg:border-r lg:border-b-0">
      <div className="domain-ui-defect-wafer-list flex w-full lg:grid">
        {wafers.map((wafer) => {
          const active = wafer.waferId === selectedWaferId

          return (
            <Button
              key={wafer.waferId}
              variant="outline"
              className={cn(
                "domain-ui-defect-wafer-item h-auto justify-start rounded-lg bg-background text-left lg:w-full",
                active &&
                  "border-primary bg-sky-50 text-foreground shadow-[inset_3px_0_0_var(--primary)]"
              )}
              onClick={() => onSelectWafer(wafer.waferId)}
            >
              <span>
                <b className="block font-mono text-sm">{wafer.waferId}</b>
                <span className="mt-1 block text-sm font-normal text-red-600">
                  {wafer.defectCount} defects
                </span>
              </span>
            </Button>
          )
        })}
      </div>
    </aside>
  )
}

function WaferMap({
  points,
  selectedPointId,
  onSelectPoint,
  onHoverPoint,
  onLeavePoint,
}: {
  points: WaferDefectPoint[]
  selectedPointId?: string
  onSelectPoint: (point: WaferDefectPoint) => void
  onHoverPoint: (
    event: MouseEvent<SVGElement>,
    point: WaferDefectPoint
  ) => void
  onLeavePoint: () => void
}) {
  function keySelect(event: KeyboardEvent<SVGGElement>, point: WaferDefectPoint) {
    if (event.key !== "Enter" && event.key !== " ") {
      return
    }

    event.preventDefault()
    onSelectPoint(point)
  }

  return (
    <svg
      className="aspect-square w-full max-w-[var(--doe-defect-map-size)]"
      viewBox="0 0 360 360"
      role="img"
      aria-label="Wafer defect position map"
    >
      <circle
        cx="180"
        cy="180"
        r="145"
        fill="#f0f4f5"
        stroke="#657783"
        strokeWidth="2"
      />
      <circle cx="180" cy="180" r="100" fill="none" stroke="#ccd5da" />
      <circle cx="180" cy="180" r="55" fill="none" stroke="#ccd5da" />
      <line
        x1="35"
        y1="180"
        x2="325"
        y2="180"
        stroke="#d6dde1"
        strokeDasharray="4 4"
      />
      <line
        x1="180"
        y1="35"
        x2="180"
        y2="325"
        stroke="#d6dde1"
        strokeDasharray="4 4"
      />
      {points.map((point) => {
        const active = point.id === selectedPointId
        const color = colorForDefect(point.defects[0]?.type)

        return (
          <g
            key={point.id}
            role="button"
            tabIndex={0}
            aria-label={`${point.id} ${point.defects.length} defects`}
            className="cursor-pointer outline-none"
            onClick={() => onSelectPoint(point)}
            onKeyDown={(event) => keySelect(event, point)}
            onMouseEnter={(event) => onHoverPoint(event, point)}
            onMouseMove={(event) => onHoverPoint(event, point)}
            onMouseLeave={onLeavePoint}
            onFocus={(event) => {
              const rect = event.currentTarget.getBoundingClientRect()
              onHoverPoint(
                {
                  clientX: rect.left + rect.width / 2,
                  clientY: rect.top + rect.height / 2,
                } as MouseEvent<SVGElement>,
                point
              )
            }}
            onBlur={onLeavePoint}
          >
            {active && (
              <circle
                cx={point.mapPosition.x}
                cy={point.mapPosition.y}
                r="14"
                fill={color}
                className="domain-ui-defect-ripple motion-reduce:animate-none motion-reduce:opacity-30"
              />
            )}
            <circle
              cx={point.mapPosition.x}
              cy={point.mapPosition.y}
              r={active ? "9" : "7"}
              fill={color}
              stroke="#fff"
              strokeWidth={active ? "3" : "2"}
            />
          </g>
        )
      })}
      <path
        d="M164 325h32l-7 13h-18z"
        fill="#fff"
        stroke="#657783"
        strokeWidth="2"
      />
    </svg>
  )
}

function DefectBar({
  label,
  value,
  total,
}: {
  label: string
  value: number
  total: number
}) {
  const width = total > 0 ? `${Math.max(6, (value / total) * 100)}%` : "0%"

  return (
    <div className="grid grid-cols-[5.5rem_1fr_1.5rem] items-center gap-2 text-sm">
      <span className="truncate" title={label}>
        {label}
      </span>
      <div className="h-1.5 bg-muted">
        <div className="h-full bg-red-500" style={{ width }} />
      </div>
      <b className="text-right">{value}</b>
    </div>
  )
}

function DefectImagePanel({
  point,
  evidence,
  index,
  onStepImage,
  onOpenDetail,
}: {
  point?: WaferDefectPoint
  evidence?: WaferDefectEvidence
  index: number
  onStepImage: (direction: number) => void
  onOpenDetail: () => void
}) {
  if (!point || !evidence) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        点击左侧Defect Map中的点位查看该Die的缺陷图片
      </div>
    )
  }

  const coordinate = point.coordinate
    ? `坐标 X ${point.coordinate.x} / Y ${point.coordinate.y}`
    : "坐标 Unknown"

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <b className="font-mono text-base">{coordinate}</b>
        <span className="font-mono text-sm text-muted-foreground">
          {index + 1} / {point.defects.length}
        </span>
      </div>

      <div className="relative overflow-hidden rounded-lg border bg-zinc-900">
        <Button
          type="button"
          variant="ghost"
          className="domain-ui-defect-image-trigger relative w-full justify-start overflow-hidden rounded-none p-0 text-white hover:bg-zinc-900"
          aria-label={`放大查看${point.id}缺陷图片`}
          onClick={onOpenDetail}
        >
          <DefectImageScene imageIndex={index} />
          <span className="absolute bottom-3 left-4 text-left text-white">
            <b className="block text-sm">{evidence.type} ×1</b>
            <span className="font-mono text-sm">{evidence.id}</span>
          </span>
          <span className="absolute right-3 bottom-3 flex items-center gap-1 rounded bg-black/40 px-2 py-1 font-mono text-xs opacity-0 transition-opacity group-hover/button:opacity-100">
            <Expand className="size-3" />
            点击放大
          </span>
        </Button>
        <div className="pointer-events-none absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between">
          <Button
            type="button"
            aria-label="上一张缺陷图片"
            variant="outline"
            size="icon-sm"
            className="pointer-events-auto rounded-full border-white/70 bg-black/40 text-white hover:bg-black/60"
            onClick={(event) => {
              event.stopPropagation()
              onStepImage(-1)
            }}
          >
            <ChevronLeft />
          </Button>
          <Button
            type="button"
            aria-label="下一张缺陷图片"
            variant="outline"
            size="icon-sm"
            className="pointer-events-auto rounded-full border-white/70 bg-black/40 text-white hover:bg-black/60"
            onClick={(event) => {
              event.stopPropagation()
              onStepImage(1)
            }}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  )
}

function DefectDetailDialog({
  open,
  onOpenChange,
  wafer,
  point,
  evidence,
  imageIndex,
  onStepImage,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  wafer?: WaferDefectSummary
  point?: WaferDefectPoint
  evidence?: WaferDefectEvidence
  imageIndex: number
  onStepImage: (direction: number) => void
}) {
  if (!point || !evidence) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="domain-ui-typography w-[min(var(--doe-defect-dialog-width),calc(100vw-2rem))] max-w-none gap-0 overflow-hidden p-0 sm:max-w-none">
        <DialogHeader className="border-b p-4">
          <DialogTitle>
            {point.id} · {point.defects.length} Defects
          </DialogTitle>
        </DialogHeader>
        <div className="relative h-[var(--doe-defect-modal-image-height)] overflow-hidden bg-zinc-900">
          <DefectImageScene imageIndex={imageIndex} spacious />
          <div className="pointer-events-none absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between">
            <Button
              type="button"
              aria-label="上一张缺陷图片"
              variant="outline"
              size="icon-lg"
              className="pointer-events-auto rounded-full border-white/70 bg-black/50 text-white hover:bg-black/70"
              onClick={() => onStepImage(-1)}
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              aria-label="下一张缺陷图片"
              variant="outline"
              size="icon-lg"
              className="pointer-events-auto rounded-full border-white/70 bg-black/50 text-white hover:bg-black/70"
              onClick={() => onStepImage(1)}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
        <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetaTile label="Wafer" value={wafer?.waferId ?? "Unknown"} />
          <MetaTile
            label="坐标"
            value={
              point.coordinate
                ? `X ${point.coordinate.x} / Y ${point.coordinate.y}`
                : "Unknown"
            }
          />
          <MetaTile label="缺陷类型" value={evidence.type} />
          <MetaTile label="缺陷ID" value={evidence.id} />
          <MetaTile
            label="图片"
            value={`${imageIndex + 1} / ${point.defects.length}`}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DefectHoverTooltip({
  state,
  waferId,
}: {
  state: HoverState
  waferId?: string
}) {
  if (!state) {
    return null
  }

  const { point } = state
  const coordinate = point.coordinate
    ? `X ${point.coordinate.x} / Y ${point.coordinate.y}`
    : "Unknown"

  return (
    <div
      className="fixed z-50 grid min-w-56 max-w-80 gap-1 rounded-lg bg-zinc-950 px-3 py-2 text-xs text-white shadow-lg"
      style={{ left: state.x, top: state.y }}
      role="tooltip"
    >
      <TooltipRow label="Wafer编号" value={waferId ?? "Unknown"} />
      <TooltipRow label="坐标" value={coordinate} />
      <TooltipRow label="缺陷数量" value={String(point.defects.length)} />
      <TooltipRow label="缺陷类型" value={typeSummary(point.defects)} />
      <TooltipRow
        label="缺陷ID"
        value={point.defects.map((item) => item.id).join("；")}
      />
    </div>
  )
}

function TooltipRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[4.5rem_1fr] gap-2">
      <span className="text-zinc-400">{label}</span>
      <b className="font-medium break-words">{value}</b>
    </div>
  )
}

function MetaTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted p-3">
      <span className="block text-xs text-muted-foreground">{label}</span>
      <b className="mt-1 block font-mono text-sm">{value}</b>
    </div>
  )
}

function DefectImageScene({
  imageIndex,
  spacious = false,
}: {
  imageIndex: number
  spacious?: boolean
}) {
  const scene = imageIndex % 3
  const scale = spacious ? "scale-125" : ""

  return (
    <span className="absolute inset-0 overflow-hidden">
      {scene === 0 && (
        <span className={cn("absolute inset-5", scale)}>
          <span className="absolute left-[20%] top-[24%] size-4 rounded-full bg-zinc-400" />
          <span className="absolute left-[43%] top-[42%] size-18 rounded-full bg-zinc-300" />
          <span className="absolute right-[24%] top-[28%] size-5 rounded-full bg-zinc-500" />
          <span className="absolute left-[28%] top-[64%] h-[180%] w-3 -translate-y-1/2 rotate-45 bg-white/15" />
        </span>
      )}
      {scene === 1 && (
        <span className={cn("absolute inset-5", scale)}>
          <span className="absolute left-[48%] top-[34%] size-20 rounded-full bg-zinc-300" />
          <span className="absolute left-[24%] top-[68%] size-5 rounded-full bg-zinc-500" />
          <span className="absolute left-[38%] top-[20%] h-[150%] w-4 rotate-[25deg] bg-white/15" />
        </span>
      )}
      {scene === 2 && (
        <span className={cn("absolute inset-5", scale)}>
          <span className="absolute left-[40%] top-[42%] h-16 w-24 rounded-[50%] bg-zinc-300" />
          <span className="absolute right-[18%] bottom-[28%] size-4 rounded-full bg-zinc-500" />
        </span>
      )}
    </span>
  )
}

function getTypeStats(wafer?: Pick<WaferDefectSummary, "points">) {
  const counts = new Map<string, number>()

  for (const defect of wafer?.points.flatMap((point) => point.defects) ?? []) {
    counts.set(defect.type, (counts.get(defect.type) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([type, value]) => ({ type, value }))
    .sort((a, b) => b.value - a.value || a.type.localeCompare(b.type))
}

function typeSummary(defects: WaferDefectEvidence[]) {
  return getTypeStatsFromEvidence(defects)
    .map((item) => `${item.type} ×${item.value}`)
    .join("；")
}

function getTypeStatsFromEvidence(defects: WaferDefectEvidence[]) {
  const counts = new Map<string, number>()

  for (const defect of defects) {
    counts.set(defect.type, (counts.get(defect.type) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([type, value]) => ({ type, value }))
    .sort((a, b) => b.value - a.value || a.type.localeCompare(b.type))
}

function colorForDefect(type?: string) {
  if (type === "Particle") {
    return "#c44b3e"
  }
  if (type === "Scratch") {
    return "#df7655"
  }
  return "#7f8790"
}
