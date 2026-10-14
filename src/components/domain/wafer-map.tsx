"use client"

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { defectColor, finalBinColor, finalBinDieColor, parameterColor, parameterColorGradient, waferMapColorSchemes } from "./wafer-map-colors"
import { ChevronLeft, ChevronRight, CircleHelp, Expand, ZoomIn, ZoomOut } from "lucide-react"

import {
  createWaferCanvasLayout,
  boundedWaferZoom,
  canvasPointFromClient,
  dieColorSegments,
  waferTooltipPosition,
  type DieData,
  type WaferMapData,
} from "@/components/domain/wafer-map-model"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
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
  waferMapDataSchema,
  waferMapGalleryInputSchema,
  type WaferMapDefectWaferInput,
  type WaferMapFinalBinWaferInput,
  type WaferMapGalleryInput,
  type WaferMapMapState,
  type WaferMapParameterWaferInput,
} from "@/schemas/domain-component-inputs"

export {
  DEFAULT_FINAL_BIN_PALETTE,
  calculateWaferBounds,
  createDieId,
  createDieVisualStates,
  createWaferLayout,
  DEFAULT_WAFER_RENDER_CONFIG,
} from "@/components/domain/wafer-map-model"
export type {
  DieAppearance,
  DieData,
  DieGeometry,
  DieId,
  DieRenderPolicy,
  DieVisualState,
  WaferBounds,
  WaferCanvasLayout,
  WaferLayoutResult,
  WaferMapData,
  WaferRenderConfig,
} from "@/components/domain/wafer-map-model"

export type AnyWafer =
  | WaferMapFinalBinWaferInput
  | WaferMapParameterWaferInput
  | WaferMapDefectWaferInput

type GalleryMap = WaferMapMapState & { wafer?: AnyWafer }

type ActiveDie = { die: DieData; x: number; y: number }

export function orderedFinalBinCategories(wafers: readonly { dies: readonly { finalBin: string; binCode?: string | null }[] }[]) {
  const categories = new Set<string>()
  for (const wafer of wafers) for (const die of wafer.dies) categories.add(die.binCode ?? die.finalBin)
  return [...categories].sort((left, right) => left.localeCompare(right, undefined, { numeric: true }))
}

export function orderedDefectCategories(input: Extract<WaferMapGalleryInput, { kind: "defect" }>) {
  const categories = new Set(input.defectTypes.map((type) => type.id))
  for (const wafer of input.wafers) for (const die of wafer.dies) {
    for (const classification of die.classBreakdown ?? []) categories.add(classification.typeId)
    for (const record of die.defects) categories.add(record.typeId)
  }
  return [...categories]
}

export type WaferMapCoreProps = {
  input: WaferMapGalleryInput
  wafer: AnyWafer
  className?: string
  selectedDieId?: string | null
  onDieSelect?: (waferId: string, die: DieData) => void
}

export function WaferMapCore({ input, wafer, className, selectedDieId, onDieSelect }: WaferMapCoreProps) {
  const colors = waferMapColorSchemes[input.kind].canvas
  const orderedBins = useMemo(() => input.kind === "cp-final-bin" ? orderedFinalBinCategories(input.wafers) : [], [input])
  const orderedDefectTypes = useMemo(() => input.kind === "defect" ? orderedDefectCategories(input) : [], [input])
  const coreRef = useRef<HTMLDivElement>(null)
  const baseCanvasRef = useRef<HTMLCanvasElement>(null)
  const dataCanvasRef = useRef<HTMLCanvasElement>(null)
  const interactionCanvasRef = useRef<HTMLCanvasElement>(null)
  const [activeDie, setActiveDie] = useState<ActiveDie | null>(null)
  const [size, setSize] = useState(220)
  const mapData = useMemo<WaferMapData>(
    () => ({ id: wafer.waferId, dies: wafer.geometry.dies, bounds: wafer.geometry.bounds }),
    [wafer]
  )
  const layout = useMemo(() => createWaferCanvasLayout(mapData, size, 10), [mapData, size])

  useEffect(() => {
    const element = coreRef.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      const nextSize = Math.round(entry.contentRect.width)
      if (nextSize > 0) setSize(nextSize)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    drawCanvas(baseCanvasRef.current, size, (context) => {
      drawWaferBoundary(context, layout, colors.waferBackground)
      context.save()
      clipWafer(context, layout)
      context.fillStyle = colors.dieBackground
      for (const die of wafer.geometry.dies) {
        const geometry = layout.dieById.get(die.id)
        if (geometry) context.fillRect(geometry.x, geometry.y, geometry.width, geometry.height)
      }
      context.restore()
      strokeWaferBoundary(context, layout, colors.waferBorder)
    })
  }, [colors, layout, size, wafer.geometry.dies])

  useEffect(() => {
    drawCanvas(dataCanvasRef.current, size, (context) => {
      if (input.status !== "ready") return
      context.save()
      clipWafer(context, layout)
      if (input.kind === "cp-final-bin" && isFinalBinWafer(wafer)) {
        for (const die of wafer.dies) drawDie(context, layout, die, finalBinDieColor(die, orderedBins))
      }
      if (input.kind === "cp-parameter" && isParameterWafer(wafer)) {
        for (const die of wafer.dies) {
          const color = die.value === null || die.status !== "VALID"
            ? waferMapColorSchemes["cp-parameter"].invalidValue
            : parameterColor(die.value, input.parameter.scale.domainMin, input.parameter.scale.domainMax)
          drawDie(context, layout, die, color, die.pass === false ? waferMapColorSchemes["cp-parameter"].cpFailOutline ?? undefined : undefined)
        }
      }
      if (input.kind === "defect" && isDefectWafer(wafer)) {
        for (const die of wafer.dies) {
          const matching = matchingDefectClasses(die, input.selectedLayerId, input.selectedDefectTypeIds)
          const geometry = layout.dieById.get(die.id)
          if (!geometry) continue
          for (const segment of dieColorSegments(geometry, matching.map((classification) => defectColor(classification.typeId, orderedDefectTypes)))) {
            context.fillStyle = segment.fill
            context.fillRect(segment.x, segment.y, segment.width, segment.height)
          }
        }
      }
      context.restore()
    })
  }, [input, layout, size, wafer])

  useEffect(() => {
    drawCanvas(interactionCanvasRef.current, size, (context) => {
      if (selectedDieId) {
        strokeSelectedDie(context, layout, selectedDieId, 2, colors.selectedOutline)
      }
      if (activeDie && activeDie.die.id !== selectedDieId) {
        strokeSelectedDie(context, layout, activeDie.die.id, 1.5, colors.hoverOutline)
      }
    })
  }, [activeDie, colors, layout, selectedDieId, size])

  function resolveDie(event: React.PointerEvent<HTMLDivElement>): ActiveDie | null {
    const rect = event.currentTarget.getBoundingClientRect()
    const { x, y } = canvasPointFromClient({ x: event.clientX, y: event.clientY }, rect, size)
    for (const die of wafer.geometry.dies) {
      const geometry = layout.dieById.get(die.id)
      if (geometry && x >= geometry.x && x <= geometry.x + geometry.width && y >= geometry.y && y <= geometry.y + geometry.height) {
        return { die, x: event.clientX, y: event.clientY }
      }
    }
    return null
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    setActiveDie(resolveDie(event))
  }

  function handleClick(event: React.PointerEvent<HTMLDivElement>) {
    const next = resolveDie(event)
    setActiveDie(next)
    if (next) onDieSelect?.(wafer.waferId, next.die)
  }

  const stateLabel = input.status === "pending" ? "Data pending" : input.status === "unavailable" ? "Data unavailable" : null
  return (
    <div
      ref={coreRef}
      className={cn("relative aspect-square overflow-hidden rounded-lg bg-muted/30", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setActiveDie(null)}
      onClick={handleClick}
      role="img"
      aria-label={`${wafer.waferId} wafer map with ${wafer.geometry.dies.length} legal dies`}
    >
      <CanvasLayer canvasRef={baseCanvasRef} size={size} />
      <CanvasLayer canvasRef={dataCanvasRef} size={size} />
      <CanvasLayer canvasRef={interactionCanvasRef} size={size} />
      {stateLabel && <span className="absolute top-2 left-2 rounded bg-background/90 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground ring-1 ring-border">{stateLabel}</span>}
      {activeDie && typeof document !== "undefined" && createPortal(
        <DiePopover activeDie={activeDie} input={input} wafer={wafer} />,
        document.body
      )}
    </div>
  )
}

function CanvasLayer({ size, canvasRef }: { size: number; canvasRef: React.RefObject<HTMLCanvasElement | null> }) {
  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 size-full" width={size} height={size} />
}

function DiePopover({ activeDie, input, wafer }: { activeDie: ActiveDie; input: WaferMapGalleryInput; wafer: AnyWafer }) {
  const tooltipRef = useRef<HTMLDivElement>(null)
  const details = diePopoverData(input, wafer, activeDie.die.id)
  useLayoutEffect(() => {
    const tooltip = tooltipRef.current
    if (!tooltip) return
    const place = () => {
      const position = waferTooltipPosition(activeDie, tooltip.getBoundingClientRect(), { width: window.innerWidth, height: window.innerHeight })
      tooltip.style.left = `${position.left}px`
      tooltip.style.top = `${position.top}px`
    }
    place()
    const observer = new ResizeObserver(place)
    observer.observe(tooltip)
    window.addEventListener("resize", place)
    return () => { observer.disconnect(); window.removeEventListener("resize", place) }
  }, [activeDie])
  return (
    <div ref={tooltipRef} className="pointer-events-none fixed z-50 w-64 max-w-[calc(100vw-32px)] rounded-md bg-popover p-3 text-xs text-popover-foreground shadow-lg ring-1 ring-foreground/10" role="tooltip" style={{ left: activeDie.x, top: activeDie.y }}>
      <div className="grid gap-1">
        <PopoverRow label="Wafer" value={wafer.waferId} />
        <PopoverRow label="DIE_X" value={String(activeDie.die.x)} />
        <PopoverRow label="DIE_Y" value={String(activeDie.die.y)} />
        {details.map((item) => <PopoverRow key={item.label} {...item} />)}
      </div>
    </div>
  )
}

function PopoverRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-3 break-words"><span className="text-muted-foreground">{label}</span><b className="font-mono font-medium">{value}</b></div>
}

export function diePopoverData(input: WaferMapGalleryInput, wafer: AnyWafer, dieId: string) {
  const details = selectedDieRows(input, wafer, dieId)
  if (input.kind === "cp-parameter") return [
    ...(details.status ? [{ label: "CP 状态", value: details.status.label }] : []),
    ...details.items,
  ]
  if (input.kind === "cp-final-bin") return [
    ...(details.status ? [{ label: "CP 状态", value: details.status.label }] : []),
    ...details.items,
  ]
  return details.items
}

export type WaferMapCardProps = {
  input: WaferMapGalleryInput
  wafer: AnyWafer
  mapState?: WaferMapMapState
  className?: string
  onDieSelect?: (waferId: string, die: DieData) => void
  onExpand?: (mapId: string) => void
}

export function WaferMapCard({ input, wafer, mapState, className, onDieSelect, onExpand }: WaferMapCardProps) {
  const defectSummary = input.kind === "cp-parameter" && "defectSummary" in wafer ? wafer.defectSummary : undefined
  return (
    <Card size="sm" className={cn("gap-2 border ring-0 shadow-none", className)}>
      <CardHeader className="flex items-center justify-between px-3">
        <CardTitle className="font-mono">{wafer.waferId}</CardTitle>
        {onExpand && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`全屏查看 ${wafer.waferId}`}
            onClick={() => onExpand(wafer.mapId)}
          >
            <Expand />
          </Button>
        )}
      </CardHeader>
      <CardContent className="px-3"><WaferMapCore input={input} wafer={wafer} onDieSelect={onDieSelect} /></CardContent>
      {mapState?.availability === "partial" && <MapStateNote state={mapState} />}
      <CardFooter className={cn("grid gap-2 bg-transparent px-3 py-2 text-xs", defectSummary ? "grid-cols-3" : "grid-cols-2")}>
        <Metric label={input.kind === "defect" ? "无缺陷 Die" : "Pass"} value={wafer.summary?.pass} />
        <Metric label={input.kind === "defect" ? "有缺陷 Die" : "Fail"} value={wafer.summary?.fail} />
        {defectSummary && <CpDefectSummary summary={defectSummary} />}
        {input.kind === "defect" && <span className="col-span-2 text-[11px] text-muted-foreground">当前 Layer 全部类型汇总</span>}
        {!wafer.summary && <SummaryUnavailable reason={wafer.summaryUnavailableReason} className="col-span-2" />}
      </CardFooter>
    </Card>
  )
}

function CpDefectSummary({ summary }: { summary: NonNullable<WaferMapFinalBinWaferInput["defectSummary"]> }) {
  return <div className="min-w-0">
    <Metric label={`Defect Die · Layer ${summary.layerId}`} value={summary.status === "AVAILABLE" ? summary.defectDieCount : null} />
    {summary.status !== "AVAILABLE" && <p className="mt-1 text-xs text-muted-foreground">{inspectionReasonLabel(summary.unavailableReason) ?? (summary.status === "EMPTY" ? "该 Layer 无 Map 数据" : "缺陷统计未提供")}</p>}
  </div>
}

function Metric({ label, value }: { label: string; value?: number | null }) {
  return <div><b className="block font-mono text-sm">{value === undefined || value === null ? "—" : value.toLocaleString()}</b><span className="text-muted-foreground">{label}</span></div>
}

export type WaferMapGalleryProps = {
  /** Report consumers may provide the missing-map body; available maps stay intact. */
  renderMissingMap?: (state: WaferMapMapState) => React.ReactNode
  input: WaferMapGalleryInput
  className?: string
  onDieSelect?: (waferId: string, die: DieData) => void
  onDefectFiltersChange?: (filters: { layerId: string; typeIds: string[] }) => void
  focusedWaferId?: string | null
  /** Physical wafer intent survives map identity changes; rendering uses mapId. */
  expandedWaferId?: string | null
  onExpandedWaferChange?: (waferId: string | null) => void
  parameterOptions?: Array<{ label: string; value: string; disabled?: boolean }>
  onParameterChange?: (parameterCode: string | null) => void
  showParameterLegend?: boolean
}

export function WaferMapGallery({ renderMissingMap, input, className, onDieSelect, onDefectFiltersChange, focusedWaferId, expandedWaferId: controlledExpandedWaferId, onExpandedWaferChange, parameterOptions, onParameterChange, showParameterLegend = true }: WaferMapGalleryProps) {
  const parsedInput = waferMapGalleryInputSchema.parse(input)
  const galleryRef = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!focusedWaferId) return
    const target = Array.from(galleryRef.current?.querySelectorAll<HTMLElement>("[data-wafer-id]") ?? []).find((element) => element.dataset.waferId === focusedWaferId)
    target?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [focusedWaferId, input])
  const [localDefectFilters, setLocalDefectFilters] = useState<{ layerId: string; typeIds: string[] } | null>(null)
  const [localExpandedWaferId, setLocalExpandedWaferId] = useState<string | null>(null)
  const expandedWaferId = controlledExpandedWaferId !== undefined ? controlledExpandedWaferId : localExpandedWaferId
  const changeExpandedWafer = (waferId: string | null) => {
    setLocalExpandedWaferId(waferId)
    onExpandedWaferChange?.(waferId)
  }
  // A parent callback makes filters controlled. Standalone gallery previews may
  // still retain local display state, but must not override a Report selection.
  const galleryInput = parsedInput.kind === "defect" && localDefectFilters && !onDefectFiltersChange
    ? { ...parsedInput, selectedLayerId: localDefectFilters.layerId, selectedDefectTypeIds: localDefectFilters.typeIds }
    : parsedInput
  const galleryMaps = createGalleryMaps(galleryInput)
  const drawableMaps = galleryMaps.filter((map): map is GalleryMap & { wafer: AnyWafer } => Boolean(map.wafer))
  const expandedMap = drawableMaps.find((map) => map.waferId === expandedWaferId)

  function changeDefectFilters(next: { layerId: string; typeIds: string[] }) {
    if (!onDefectFiltersChange) setLocalDefectFilters(next)
    onDefectFiltersChange?.(next)
  }

  return (
    <section ref={galleryRef} className={cn("not-prose domain-ui-typography grid gap-3", className)} aria-label="Wafer map gallery">
      {(galleryInput.kind !== "cp-parameter" || showParameterLegend) && <GalleryLegend input={galleryInput} onDefectFiltersChange={changeDefectFilters} />}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {galleryMaps.map((map) => map.wafer ? (
          <div key={map.mapId} data-wafer-id={map.wafer.waferId} className={cn("rounded-lg", focusedWaferId === map.wafer.waferId && "ring-2 ring-primary")}>
          <WaferMapCard
            input={galleryInput}
            wafer={map.wafer}
            mapState={map}
            onDieSelect={onDieSelect}
            onExpand={(mapId) => changeExpandedWafer(drawableMaps.find((candidate) => candidate.mapId === mapId)?.waferId ?? null)}
          />
          </div>
        ) : (
          <WaferMapStateCard key={map.mapId} map={map} renderMissingMap={renderMissingMap} />
        ))}
      </div>
      <WaferMapInspectionDialog
        key={`${galleryInput.kind}-${galleryInput.kind === "defect" ? galleryInput.selectedLayerId : "all"}-${expandedMap?.mapId ?? "closed"}`}
        input={galleryInput}
        wafer={expandedMap?.wafer}
        open={Boolean(expandedMap)}
        onOpenChange={(open) => {
          if (!open) changeExpandedWafer(null)
        }}
        onPrevious={() => changeExpandedWafer(stepWaferId(drawableMaps, expandedWaferId, -1))}
        onNext={() => changeExpandedWafer(stepWaferId(drawableMaps, expandedWaferId, 1))}
        onDieSelect={onDieSelect}
        parameterOptions={parameterOptions}
        onParameterChange={onParameterChange}
        onDefectFiltersChange={changeDefectFilters}
      />
    </section>
  )
}

function createGalleryMaps(input: WaferMapGalleryInput): GalleryMap[] {
  const waferByMapId = new Map(input.wafers.map((wafer) => [wafer.mapId, wafer]))
  const declaredStates = input.mapStates ?? input.wafers.map((wafer) => ({
    mapId: wafer.mapId,
    waferId: wafer.waferId,
    availability: "available" as const,
  }))
  const maps = declaredStates.map((state) => ({
    ...state,
    wafer: state.availability === "available" || state.availability === "partial"
      ? waferByMapId.get(state.mapId)
      : undefined,
  }))
  for (const wafer of input.wafers) {
    if (!maps.some((map) => map.mapId === wafer.mapId)) {
      maps.push({ mapId: wafer.mapId, waferId: wafer.waferId, availability: "available", wafer })
    }
  }
  return maps
}

function WaferMapStateCard({ map, renderMissingMap }: { map: GalleryMap; renderMissingMap?: WaferMapGalleryProps["renderMissingMap"] }) {
  return (
    <Card size="sm" className={cn("gap-2 border ring-0 shadow-none", !renderMissingMap && "border-dashed")}>
      <CardHeader className="px-3"><CardTitle className="font-mono">{map.waferId}</CardTitle></CardHeader>
      <CardContent className="px-3 pb-3">
        {renderMissingMap?.(map) ?? <MapStateNote state={map} className="min-h-40 items-center justify-center text-center" />}
      </CardContent>
    </Card>
  )
}

function MapStateNote({ state, className }: { state: Pick<WaferMapMapState, "availability" | "reason">; className?: string }) {
  const label = state.availability === "empty"
    ? "当前 Wafer 无此 Map 数据"
    : state.availability === "partial"
      ? "Map 数据不完整"
      : "当前 Wafer Map 不可用"
  return (
    <div className={cn("flex flex-col gap-1 rounded-md bg-muted/40 p-3 text-xs text-muted-foreground", className)}>
      <strong className="font-medium text-foreground">{label}</strong>
      {state.reason && <span>{state.reason}</span>}
    </div>
  )
}

function WaferMapInspectionDialog({
  input,
  wafer,
  open,
  onOpenChange,
  onPrevious,
  onNext,
  onDieSelect,
  parameterOptions,
  onParameterChange,
  onDefectFiltersChange,
}: {
  input: WaferMapGalleryInput
  wafer?: AnyWafer
  open: boolean
  onOpenChange: (open: boolean) => void
  onPrevious: () => void
  onNext: () => void
  onDieSelect?: (waferId: string, die: DieData) => void
  parameterOptions?: WaferMapGalleryProps["parameterOptions"]
  onParameterChange?: WaferMapGalleryProps["onParameterChange"]
  onDefectFiltersChange: (filters: { layerId: string; typeIds: string[] }) => void
}) {
  const [selectedDieId, setSelectedDieId] = useState<string | null>(() => wafer ? defaultInspectionDieId(input, wafer) : null)
  const [zoom, setZoom] = useState(100)
  const [mapBaseSize, setMapBaseSize] = useState(400)
  // Base UI mounts portal content after the initial open render. Bind to the
  // actual node mount, and let React 19 run ref cleanup on close/replacement.
  const viewportRef = useMemo(() => createWaferZoomViewportRef(
    setMapBaseSize,
    (delta) => setZoom((value) => boundedWaferZoom(value + delta)),
  ), [])

  if (!wafer) return null

  const selectDie = (_waferId: string, die: DieData) => {
    setSelectedDieId(die.id)
    onDieSelect?.(wafer.waferId, die)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="domain-ui-typography domain-ui-wafer-inspection-dialog max-w-none gap-0 overflow-hidden p-0 sm:max-w-none"
      >
        <DialogHeader className="border-b px-5 py-4 pr-14">
          <DialogTitle className="font-mono text-base">
            {inspectionTitle(input, wafer.waferId)}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {wafer.waferId} Wafer Map 放大查看与统计明细
          </DialogDescription>
        </DialogHeader>

        <InspectionContext input={input} parameterOptions={parameterOptions} onParameterChange={onParameterChange} onDefectFiltersChange={onDefectFiltersChange} />
        <InspectionLegend input={input} wafer={wafer} />

        <div className="domain-ui-wafer-inspection-layout min-h-0 gap-4 p-4 pt-3">
          <div className="relative flex min-h-[22rem] min-w-0 items-center justify-center overflow-hidden rounded-2xl border bg-muted/30 p-3">
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-lg bg-background/90 p-1 ring-1 ring-border backdrop-blur-sm">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="缩小"
                disabled={zoom <= 60}
                onClick={() => setZoom((value) => boundedWaferZoom(value - 20))}
              >
                <ZoomOut />
              </Button>
              <span className="w-10 text-center font-mono text-xs font-medium">{zoom}%</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="放大"
                disabled={zoom >= 300}
                onClick={() => setZoom((value) => boundedWaferZoom(value + 20))}
              >
                <ZoomIn />
              </Button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              className="absolute left-4 z-20 rounded-full bg-background/90"
              aria-label="查看上一片 Wafer"
              onClick={onPrevious}
            >
              <ChevronLeft />
            </Button>

            <div ref={viewportRef} className="absolute inset-0 overflow-auto overscroll-contain p-3" tabIndex={0} role="region" aria-label="Wafer Map 缩放区域">
              <div className="grid place-items-center" style={{ width: `max(100%, ${mapBaseSize * zoom / 100}px)`, height: `max(100%, ${mapBaseSize * zoom / 100}px)` }}>
                <div className="shrink-0" style={{ width: mapBaseSize * zoom / 100, height: mapBaseSize * zoom / 100 }}>
                  <WaferMapCore
                    input={input}
                    wafer={wafer}
                    className="size-full rounded-xl bg-transparent"
                    selectedDieId={selectedDieId}
                    onDieSelect={selectDie}
                  />
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              className="absolute right-4 z-20 rounded-full bg-background/90"
              aria-label="查看下一片 Wafer"
              onClick={onNext}
            >
              <ChevronRight />
            </Button>
          </div>

          <aside className="min-h-0 overflow-auto rounded-2xl border bg-background" aria-label={`${wafer.waferId} Wafer 明细`}>
            <SelectedDiePanel input={input} wafer={wafer} selectedDieId={selectedDieId} />
            <Separator />
            <WaferSummaryPanel wafer={wafer} kind={input.kind} />
            <Separator />
            <InspectionStatistics input={input} wafer={wafer} />
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** React callback-ref lifecycle: late portal mount and remount are both bound. */
export function createWaferZoomViewportRef(onSize: (size: number) => void, onZoom: (delta: number) => void) {
  return (viewport: HTMLDivElement | null) => {
    if (!viewport) return
    const observer = new ResizeObserver(([entry]) => onSize(Math.max(1, Math.min(entry.contentRect.width, entry.contentRect.height) - 24)))
    observer.observe(viewport)
    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY === 0) return
      event.preventDefault()
      onZoom(event.deltaY < 0 ? 10 : -10)
    }
    viewport.addEventListener("wheel", handleWheel, { passive: false })
    return () => { observer.disconnect(); viewport.removeEventListener("wheel", handleWheel) }
  }
}

function InspectionContext({ input, parameterOptions, onParameterChange, onDefectFiltersChange }: {
  input: WaferMapGalleryInput
  parameterOptions?: WaferMapGalleryProps["parameterOptions"]
  onParameterChange?: WaferMapGalleryProps["onParameterChange"]
  onDefectFiltersChange: (filters: { layerId: string; typeIds: string[] }) => void
}) {
  const parameterInputId = useId()
  if (input.kind === "cp-parameter") {
    const options = (parameterOptions ?? []).filter((item) => !item.disabled).map((item) => ({ id: item.value, label: item.label }))
    return (
      <div className="flex flex-wrap items-center gap-3 border-b px-5 py-3">
        {onParameterChange && options.length > 0 ? <FilterCombobox
          id={parameterInputId}
          label="CP Parameter"
          placeholder="搜索并选择 CP Parameter"
          items={options}
          value={options.find((item) => item.id === input.parameter.parameterCode) ?? null}
          onValueChange={(item) => { if (item) onParameterChange(item.id) }}
        /> : <><span className="text-xs text-muted-foreground">CP Parameter</span><span className="font-medium">{input.parameter.label}</span></>}
      </div>
    )
  }
  if (input.kind === "defect") {
    return <div className="border-b px-5 py-3"><DefectFilterComboboxes input={input} onChange={onDefectFiltersChange} /></div>
  }
  return null
}

function InspectionLegend({ input, wafer }: { input: WaferMapGalleryInput; wafer: AnyWafer }) {
  const orderedBins = input.kind === "cp-final-bin" ? orderedFinalBinCategories(input.wafers) : []
  const orderedDefectTypes = input.kind === "defect" ? orderedDefectCategories(input) : []
  return (
    <div className="flex min-h-11 flex-wrap items-center gap-3 border-b px-5 py-2 text-xs">
      {input.kind === "cp-final-bin" && isFinalBinWafer(wafer) && (
        <>
          <strong>Final Bin</strong>
          <span className="text-muted-foreground">按 CP 状态区分 Pass / Fail</span>
          {wafer.inspection?.rows.map((row) => (
            <span key={row.binCode} className="flex items-center gap-1.5">
              <FinalBinSwatches bin={row.binCode} wafers={[wafer]} orderedBins={orderedBins} />
              Bin {row.binCode} · {row.count.toLocaleString()}
            </span>
          ))}
          {!wafer.inspection && <span className="text-muted-foreground">Final Bin 统计明细不可用</span>}
        </>
      )}
      {input.kind === "cp-parameter" && (
        <>
          <ParameterLegend input={input} />
        </>
      )}
      {input.kind === "defect" && (
        <>
          <strong>Defect Type</strong>
          {input.defectTypes.map((type) => (
            <span key={type.id} className="flex items-center gap-1.5">
              <i className="size-2.5 rounded-sm" style={{ background: defectColor(type.id, orderedDefectTypes) }} />
              {type.label}
            </span>
          ))}
          <span className="flex items-center gap-1.5 text-muted-foreground"><i className="size-2.5 rounded-sm" style={{ background: waferMapColorSchemes.defect.canvas.dieBackground }} />无缺陷记录 / 未匹配筛选</span>
        </>
      )}
      <span className="ml-auto flex items-center gap-1.5 text-muted-foreground">
        <i className="size-3 rounded-sm border-2 bg-transparent" style={{ borderColor: waferMapColorSchemes[input.kind].canvas.selectedOutline }} />
        Selected Die
      </span>
    </div>
  )
}

function SelectedDiePanel({ input, wafer, selectedDieId }: { input: WaferMapGalleryInput; wafer: AnyWafer; selectedDieId: string | null }) {
  const die = wafer.geometry.dies.find((item) => item.id === selectedDieId)
  if (!die) {
    return <div className="p-4 text-sm text-muted-foreground">点击左侧 Wafer Map 查看 Die 明细</div>
  }

  const rows = selectedDieRows(input, wafer, die.id)
  return (
    <div className="grid gap-3 p-4">
      <strong className="font-mono text-sm">X{die.x} / Y{die.y}</strong>
      {rows.status && (
        <span className={cn(
          "w-fit rounded-full px-2.5 py-1 text-xs font-medium",
          rows.status.tone === "pass" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        )}>
          {rows.status.label}
        </span>
      )}
      <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 text-xs">
        {rows.items.map((row) => (
          <div key={row.label} className="col-span-2 grid grid-cols-subgrid">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="text-right font-mono font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>
      {input.kind === "defect" && isDefectWafer(wafer) && <DefectRecordsPanel key={`${wafer.mapId}:${die.id}`} die={wafer.dies.find((item) => item.id === die.id)} layerId={input.selectedLayerId} />}
    </div>
  )
}

function DefectRecordsPanel({ die, layerId }: { die?: WaferMapDefectWaferInput["dies"][number]; layerId: string }) {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
  const detailId = useId()
  const records = die?.defects.filter((record) => record.layerId === layerId) ?? []
  const selectedRecord = records.find((record) => record.id === selectedRecordId)
  if (die?.defectRecordsStatus === "UNAVAILABLE" || records.length === 0) {
    return die?.defectCount === 0 ? null : <p className="text-xs text-muted-foreground">逐条记录未提供</p>
  }
  return <section className="grid gap-2" aria-label="当前 Die 缺陷记录">
    <h5 className="text-xs font-medium">缺陷记录 ID</h5>
    <div className="flex flex-wrap gap-2">
      {records.map((record) => <Button key={record.id} type="button" variant="outline" size="sm" className="max-w-full font-mono" aria-expanded={selectedRecordId === record.id} aria-controls={detailId} onClick={() => setSelectedRecordId((current) => current === record.id ? null : record.id)}>{record.id}</Button>)}
    </div>
    {selectedRecord && <div id={detailId}><DefectRecordDetails record={selectedRecord} /></div>}
  </section>
}

/** Renders delivered record fields only; no image or network action is attached. */
export function DefectRecordDetails({ record }: { record: WaferMapDefectWaferInput["dies"][number]["defects"][number] }) {
  const value = (number?: number | null) => number === null || number === undefined ? "—" : number.toLocaleString()
  const fields = [
    { label: "Defect ID", value: record.id },
    { label: "Layer", value: record.layerId },
    { label: "缺陷分类", value: record.typeLabel },
    { label: "分类编号", value: value(record.classNumber) },
    { label: "SIZE_X", value: value(record.sizeX) },
    { label: "SIZE_Y", value: value(record.sizeY) },
    { label: "WAFER_X", value: value(record.waferX) },
    { label: "WAFER_Y", value: value(record.waferY) },
    { label: "图片数量", value: value(record.imageCount) },
  ]
  return <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 rounded-lg border p-3 text-xs" aria-label={`缺陷记录 ${record.id} 明细`}>
    {fields.map((field) => <div key={field.label} className="col-span-2 grid grid-cols-subgrid"><dt className="text-muted-foreground">{field.label}</dt><dd className="break-all text-right font-mono">{field.value}</dd></div>)}
  </dl>
}

export function InspectionStatistics({ input, wafer }: { input: WaferMapGalleryInput; wafer: AnyWafer }) {
  if (!wafer.inspection) {
    return <>
      {input.kind === "cp-parameter" && isParameterWafer(wafer) && <div className="p-4"><ParameterCpSummary summary={wafer.cpSummary} /></div>}
      <DetailStatisticsUnavailable reason={wafer.inspectionUnavailableReason} />
    </>
  }
  if (input.kind === "cp-final-bin" && isFinalBinWafer(wafer)) {
    return (
      <InspectionTableShell waferId={wafer.waferId} meta={`Tested Die Count：${wafer.inspection.testedDieCount.toLocaleString()}`}>
        <div className="grid grid-cols-2 gap-2">
          <InspectionMetric label="Total Fail Bin Count" value={wafer.inspection.totalFailBinCount.toLocaleString()} />
          <InspectionMetric label="Total Fail Bin Rate" value={formatPercent(wafer.inspection.totalFailBinRatePercent)} help="本片完整 CP Map 中，上游 CP 分类为 Fail 的 Die 数 / Tested Die Count × 100%。Pass/Fail 按上游分类提供，不由 Bin 编号推断。" />
        </div>
        <Table className="domain-ui-report-table mt-3" aria-label="各 Bin Code 数量与占比">
          <TableHeader><TableRow><TableHead>Bin Code</TableHead><TableHead>Bin Des</TableHead><TableHead className="text-right">Count</TableHead><TableHead className="text-right"><span className="inline-flex items-center gap-1">Rate<InspectionHelp label="各 Bin Rate" text="该 Bin 的 Die Count / 本片完整 CP Map 的 Tested Die Count × 100%。统计不受当前选中 Die 影响。" /></span></TableHead></TableRow></TableHeader>
          <TableBody>{wafer.inspection.rows.map((row) => <TableRow key={row.binCode}><TableCell>Bin {row.binCode}</TableCell><TableCell>{row.binDescription}</TableCell><TableCell className="text-right font-mono">{row.count.toLocaleString()}</TableCell><TableCell className="text-right font-mono">{formatPercent(row.ratePercent)}</TableCell></TableRow>)}</TableBody>
        </Table>
      </InspectionTableShell>
    )
  }

  if (input.kind === "cp-parameter" && isParameterWafer(wafer)) {
    const statistics = wafer.inspection
    const unit = statistics.unit ? ` ${statistics.unit}` : ""
    return (
      <InspectionTableShell waferId={wafer.waferId} meta={`参数有效样本数：${statistics.sampleCount?.toLocaleString() ?? "—"}`}>
        <ParameterCpSummary summary={wafer.cpSummary} />
        <div className="grid grid-cols-2 gap-2">
          <InspectionMetric label="Uniformity (RsU)" value={statistics.uniformityPercent === null || statistics.uniformityPercent === undefined ? "—" : formatPercent(statistics.uniformityPercent)} hint={statistics.uniformityPercent == null ? variationStatusLabel(statistics.uniformityStatus) : undefined} />
          <InspectionMetric label="Hi/Lo Var." value={statistics.hiLoVariationPercent === null || statistics.hiLoVariationPercent === undefined ? "—" : formatPercent(statistics.hiLoVariationPercent)} hint={statistics.hiLoVariationPercent == null ? variationStatusLabel(statistics.hiLoVariationStatus) : undefined} />
          <InspectionMetric label={`SPEC LSL${unit}`} value={formatParameterMetric(statistics.lsl)} />
          <InspectionMetric label={`SPEC USL${unit}`} value={formatParameterMetric(statistics.usl)} />
          <InspectionMetric label={`Mean${unit}`} value={formatParameterMetric(statistics.mean)} />
          <InspectionMetric label={`Std. Dev.${unit}`} value={formatParameterMetric(statistics.stddev)} />
          <InspectionMetric label={`Min${unit}`} value={formatParameterMetric(statistics.min)} />
          <InspectionMetric label={`Max${unit}`} value={formatParameterMetric(statistics.max)} />
          <InspectionMetric label={`Median${unit}`} value={formatParameterMetric(statistics.median)} />
          <InspectionMetric label="CPK" value={statistics.cpk?.toFixed(2) ?? "—"} />
        </div>
        <p className="text-xs text-muted-foreground">CPK 状态：{cpkStatusLabel(statistics.cpkStatus)}</p>
      </InspectionTableShell>
    )
  }

  if (input.kind === "defect" && isDefectWafer(wafer)) {
    const inspection = wafer.inspection.byLayer.find((item) => item.layerId === input.selectedLayerId)
    if (!inspection) return <div className="p-4 text-sm text-muted-foreground">当前 Layer 暂无缺陷统计</div>
    return (
      <InspectionTableShell waferId={wafer.waferId} meta="当前 Layer 全部类型汇总；不随类型筛选变化">
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2"><InspectionMetric label="Tested Dies" value={inspection.testedDieCount == null ? "—" : inspection.testedDieCount.toLocaleString()} /></div>
          <InspectionMetric label="Defect Die" value={inspection.defectDieCount.toLocaleString()} />
          <InspectionMetric label="Defect Record" value={inspection.defectRecordCount.toLocaleString()} />
        </div>
        {inspection.classBreakdownStatus === "UNAVAILABLE" && <p className="text-xs text-muted-foreground">分类明细未提供</p>}
        {inspection.outsideGridCount !== undefined && <p className="text-xs text-muted-foreground">网格外记录：{inspection.outsideGridCount.toLocaleString()}。</p>}
        <p className="text-xs text-muted-foreground">Rate = Count / Tested Dies × 100%；Count 为当前 Layer 的缺陷记录数。</p>
        {!(inspection.testedDieCount != null && inspection.testedDieCount > 0) && <p className="text-xs text-muted-foreground">Rate 不可用：当前 Defect 检测的 Tested Dies 未提供或为 0。</p>}
        <Table className="domain-ui-report-table mt-3" aria-label="各类型缺陷记录总数与缺陷率">
          <TableHeader><TableRow><TableHead>Defect Type</TableHead><TableHead className="text-right">Count</TableHead><TableHead className="text-right">Rate</TableHead></TableRow></TableHeader>
          <TableBody>{inspection.rows.map((row) => <TableRow key={row.typeId}><TableCell>{row.label}</TableCell><TableCell className="text-right font-mono">{row.count.toLocaleString()}</TableCell><TableCell className="text-right font-mono">{inspection.testedDieCount != null && inspection.testedDieCount > 0 && row.ratePercent !== null ? formatPercent(row.ratePercent) : "—"}</TableCell></TableRow>)}</TableBody>
        </Table>
      </InspectionTableShell>
    )
  }

  return null
}

function ParameterCpSummary({ summary }: { summary: WaferMapParameterWaferInput["cpSummary"] }) {
  // Only the same-test Backend projection owns these counts and percentages.
  // Legacy wafer.summary and valid parameter sample N are never fallbacks.
  const available = summary?.status === "AVAILABLE"
  const count = (value?: number | null) => available && value !== null && value !== undefined ? value.toLocaleString() : "—"
  const rate = (value?: number | null) => available && value !== null && value !== undefined ? formatPercent(value) : "—"
  return (
    <section className="grid gap-2" aria-label="当前 Parameter Map CP 测试统计">
      <h5 className="text-xs font-medium">当前 Parameter Map CP 测试统计</h5>
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2"><InspectionMetric label="CP Tested Die Count" value={count(summary?.testedDieCount)} /></div>
        <InspectionMetric label="CP Pass" value={count(summary?.passDieCount)} />
        <InspectionMetric label="CP Fail" value={count(summary?.failDieCount)} />
        <InspectionMetric label="CP Pass Rate" value={rate(summary?.passRatePercent)} />
        <InspectionMetric label="CP Fail Rate" value={rate(summary?.failRatePercent)} />
      </div>
      {!available && <p className="text-xs text-muted-foreground">{inspectionReasonLabel(summary?.unavailableReason) ?? "CP 测试统计未提供。"}</p>}
      <p className="text-xs text-muted-foreground">CP Tested 为该测试的 Die 数，参数有效样本数为当前参数的有效量测数。</p>
    </section>
  )
}

function WaferSummaryPanel({ wafer, kind }: { wafer: AnyWafer; kind: WaferMapGalleryInput["kind"] }) {
  if (!wafer.summary) return <SummaryUnavailable reason={wafer.summaryUnavailableReason} className="m-4" />
  return (
    <section className="grid grid-cols-2 gap-2 p-4" aria-label="Wafer 汇总">
      {kind === "defect" && <p className="col-span-2 text-xs text-muted-foreground">当前 Layer 全部类型汇总</p>}
      {kind === "cp-parameter" && <p className="col-span-2 text-xs text-muted-foreground">所选 CP slice 汇总</p>}
      <InspectionMetric label={kind === "defect" ? "无缺陷 Die" : "Pass"} value={wafer.summary.pass.toLocaleString()} />
      <InspectionMetric label={kind === "defect" ? "有缺陷 Die" : "Fail"} value={wafer.summary.fail.toLocaleString()} />
    </section>
  )
}

function SummaryUnavailable({ reason, className }: { reason?: string; className?: string }) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      {reason ?? "当前晶圆暂无汇总统计。"}
    </p>
  )
}

function DetailStatisticsUnavailable({ reason }: { reason?: string }) {
  return (
    <section className="grid gap-2 p-4" aria-label="统计明细不可用">
      <h4 className="text-sm font-medium">统计明细不可用</h4>
      <p className="text-xs text-muted-foreground">
        {inspectionReasonLabel(reason) ?? "当前地图暂无分类统计明细。"}
      </p>
    </section>
  )
}

function InspectionTableShell({ waferId, meta, children }: { waferId: string; meta?: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3 p-4" aria-label="当前 Wafer 统计">
      <div>
        <h4 className="font-mono text-sm font-semibold">{waferId}</h4>
        {meta && <p className="mt-1 text-xs text-muted-foreground">{meta}</p>}
      </div>
      {children}
    </section>
  )
}

function InspectionHelp({ label, text }: { label: string; text: string }) {
  return <TooltipProvider><Tooltip><TooltipTrigger render={<Button type="button" variant="ghost" size="icon-xs" aria-label={`关于 ${label}`} />}><CircleHelp /></TooltipTrigger><TooltipContent>{text}</TooltipContent></Tooltip></TooltipProvider>
}

function InspectionMetric({ label, value, help, hint }: { label: string; value: string; help?: string; hint?: string }) {
  return <div className="rounded-lg border bg-muted/20 p-2"><span className="flex items-center gap-1 text-[11px] text-muted-foreground">{label}{help && <InspectionHelp label={label} text={help} />}</span><b className="mt-1 block font-mono text-sm">{value}</b>{hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}</div>
}

function variationStatusLabel(status?: string | null) {
  if (!status || status === "AVAILABLE") return undefined
  const labels: Record<string, string> = { MISSING_STATISTICS: "统计未提供", ZERO_MEAN: "均值为零，无法计算", NON_FINITE_INPUT: "输入数值不可用", NON_FINITE_RESULT: "计算结果不可用" }
  return labels[status] ?? inspectionReasonLabel(status)
}


export function selectedDieRows(input: WaferMapGalleryInput, wafer: AnyWafer, dieId: string) {
  if (input.kind === "cp-final-bin" && isFinalBinWafer(wafer)) {
    const die = wafer.dies.find((item) => item.id === dieId)
    const bin = wafer.inspection?.rows.find((row) => row.binCode === (die?.binCode ?? die?.finalBin))
    return {
      status: die ? { label: die.pass ? "CP Pass" : "CP Fail", tone: die.pass ? "pass" as const : "fail" as const } : null,
      items: die ? [
        { label: "Final Bin", value: `Bin ${die.binCode ?? die.finalBin}` },
        { label: "Bin Des", value: die.binDescription ?? bin?.binDescription ?? "—" },
      ] : [],
    }
  }
  if (input.kind === "cp-parameter" && isParameterWafer(wafer)) {
    const die = wafer.dies.find((item) => item.id === dieId)
    return {
      status: die?.pass === undefined ? null : { label: die.pass ? "CP Pass" : "CP Fail", tone: die.pass ? "pass" as const : "fail" as const },
      items: die ? [
        { label: "CP Parameter", value: input.parameter.label },
        { label: "Parameter Value", value: die.value === null ? "—" : `${die.value.toLocaleString()}${input.parameter.unit ? ` ${input.parameter.unit}` : ""}` },
        { label: "Validity", value: die.status },
        ...parameterSpecRows(wafer),
        { label: "Final Bin", value: die.binCode == null ? "—" : `Bin ${die.binCode}` },
        { label: "Bin Des", value: die.binDescription ?? die.finalBin ?? "—" },
        ...(die.pass === undefined ? [{ label: "CP 状态", value: cpUnavailableLabel(die.cpUnavailableReason) }] : []),
      ] : [],
    }
  }
  if (input.kind === "defect" && isDefectWafer(wafer)) {
    const die = wafer.dies.find((item) => item.id === dieId)
    const classes = die ? defectClassesForLayer(die, input.selectedLayerId) : []
    return {
      status: null,
      items: [
        { label: "Layer", value: input.layers.find((item) => item.id === input.selectedLayerId)?.label ?? input.selectedLayerId },
        { label: "Defect Record", value: die ? defectRecordCountForLayer(die, input.selectedLayerId).toLocaleString() : "—" },
        ...(die?.classBreakdownStatus === "UNAVAILABLE" ? [{ label: "Defect Type", value: "分类明细未提供" }] : classes.map((classification) => ({ label: classification.label, value: classification.count.toLocaleString() }))),
      ],
    }
  }
  return { status: null, items: [] }
}

/** SPEC belongs to this wafer's aligned inspection, never the global context. */
function parameterSpecRows(wafer: WaferMapParameterWaferInput) {
  const inspection = wafer.inspection
  const unit = inspection?.unit ? ` ${inspection.unit}` : ""
  return [
    { label: `SPEC LSL${unit}`, value: inspection?.lsl == null ? "—" : String(inspection.lsl) },
    { label: `SPEC USL${unit}`, value: inspection?.usl == null ? "—" : String(inspection.usl) },
  ]
}

function defaultInspectionDieId(input: WaferMapGalleryInput, wafer: AnyWafer) {
  if (input.kind === "defect" && isDefectWafer(wafer)) {
    const match = wafer.dies.find((die) => defectRecordCountForLayer(die, input.selectedLayerId) > 0)
    if (match) return match.id
  }
  const sorted = [...wafer.geometry.dies].sort((left, right) => (Math.abs(left.x) + Math.abs(left.y)) - (Math.abs(right.x) + Math.abs(right.y)))
  return sorted[0]?.id ?? null
}

function inspectionTitle(input: WaferMapGalleryInput, waferId: string) {
  if (input.kind === "cp-final-bin") return `CP Map_Final Bin ${waferId}`
  if (input.kind === "cp-parameter") return `CP Map_Parameter Map ${waferId}`
  return `Defect Map ${waferId}`
}

function stepWaferId(maps: Array<GalleryMap & { wafer: AnyWafer }>, currentWaferId: string | null, direction: number) {
  if (maps.length === 0) return null
  const index = Math.max(0, maps.findIndex((map) => map.waferId === currentWaferId))
  return maps[(index + direction + maps.length) % maps.length]?.waferId ?? null
}

/** Presentation labels only; source capability status remains untouched. */
function cpkStatusLabel(status: string) {
  const labels: Record<string, string> = {
    AVAILABLE: "可计算",
    NO_SPEC: "规格未提供",
    INVALID_SPEC: "规格无效",
    MISSING_STATISTICS: "统计未提供",
    INSUFFICIENT_SAMPLE: "样本不足",
    ZERO_SIGMA: "标准差为零",
    INVALID_SIGMA: "标准差无效",
    NON_FINITE_INPUT: "数值不可用",
    NON_FINITE_RESULT: "数值不可用",
  }
  return labels[status] ?? "不可计算"
}

function inspectionReasonLabel(reason?: string) {
  const labels: Record<string, string> = {
    MAP_SLICE_MISMATCH: "Map 与所选 CP slice 不一致。",
    MAP_TEST_IDENTITY_MISMATCH: "Map 与参数统计的测试身份不一致。",
    MISSING_MAP_IDENTITY: "Map 身份未提供。",
    MISSING_STATISTICS_IDENTITY: "参数统计身份未提供。",
    AMBIGUOUS_STATISTICS: "参数统计对应多个测试，尚不能确定。",
    MISSING_STATISTICS: "参数统计未提供。",
    PARAMETER_MAP_MISSING: "当前参数的 Map 未提供。",
    BIN_MAP_MISSING: "Final Bin Map 未提供。",
    LAYER_NO_RECORD: "当前 Layer 无检测记录。",
    DEFECT_SUMMARY_UNAVAILABLE: "当前 Layer 缺陷统计未提供。",
    DEFECT_INSPECTION_SUMMARY_INCOMPLETE: "缺陷检测统计不完整。",
    DEFECT_MAP_UNAVAILABLE: "缺陷 Map 当前不可用。",
    DEFECT_MAP_REF_MISSING: "缺陷 Map 快照引用未提供。",
    DEFECT_DETAIL_IDENTITY_INCOMPLETE: "缺陷记录身份不完整。",
    DEFECT_SNAPSHOT_NOT_FOUND: "该报告没有可用的缺陷快照。",
    DEFECT_SNAPSHOT_UNAVAILABLE: "缺陷快照统计当前不可用。",
    MAP_EMPTY: "当前 Map 无可绘制数据。",
    AMBIGUOUS_CP_MAP_IDENTITY: "CP Map 对应多个测试，尚不能确定。",
    CP_MAP_IDENTITY_MISMATCH: "CP Map 与参数 Map 的测试身份不一致。",
    CP_MAP_IDENTITY_UNAVAILABLE: "CP Map 测试身份未提供。",
    CP_BIN_MAP_MISSING: "同一 CP 测试的 Final Bin Map 未提供。",
    CP_COORDINATE_SOURCE_MISSING: "CP 坐标来源未提供。",
    CP_COORDINATE_SOURCE_MISMATCH: "CP Map 与参数 Map 的坐标来源不一致。",
    PARAMETER_COORDINATE_DUPLICATE: "参数 Map 存在重复 Die 坐标。",
    CP_COORDINATE_DUPLICATE: "CP Map 存在重复 Die 坐标。",
    MAP_COORDINATE_COVERAGE_MISMATCH: "CP Map 与参数 Map 的 Die 坐标范围不一致。",
    CP_DIE_COORDINATE_MISSING: "当前 Die 的 CP 坐标未提供。",
    CP_CLASSIFICATION_UNAVAILABLE: "CP Pass / Fail 分类未提供。",
  }
  return reason ? labels[reason] ?? (reason.startsWith("CP_") ? "CP 数据暂不可用。" : reason) : undefined
}

function cpUnavailableLabel(reason?: string | null) {
  if (!reason) return "CP 状态未提供"
  const label = inspectionReasonLabel(reason)
  return label === reason && /^[A-Z][A-Z0-9_]+$/.test(reason) ? "CP 状态暂不可用" : label ?? "CP 状态未提供"
}

function formatParameterMetric(value: number | null) {
  return value?.toLocaleString("en-US", { maximumFractionDigits: 4 }) ?? "—"
}

function defectRecordCountForLayer(die: WaferMapDefectWaferInput["dies"][number], layerId: string) {
  return die.defectCount ?? die.defects.filter((record) => record.layerId === layerId).length
}

/** Preserve supplied aggregates; records are a distinct optional delivery. */
export function matchingDefectClasses(die: WaferMapDefectWaferInput["dies"][number], layerId: string, selectedTypeIds: readonly string[]) {
  const selectedTypes = new Set(selectedTypeIds)
  return defectClassesForLayer(die, layerId).filter((classification) => classification.count > 0 && (selectedTypes.size === 0 || selectedTypes.has(classification.typeId)))
}

export function defectClassesForLayer(die: WaferMapDefectWaferInput["dies"][number], layerId: string) {
  if (die.classBreakdown) return die.classBreakdown
  const byType = new Map<string, { typeId: string; label: string; count: number }>()
  for (const record of die.defects) {
    if (record.layerId !== layerId) continue
    const current = byType.get(record.typeId)
    byType.set(record.typeId, { typeId: record.typeId, label: record.typeLabel, count: (current?.count ?? 0) + 1 })
  }
  return [...byType.values()]
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`
}

function FinalBinSwatches({ bin, wafers, orderedBins }: {
  bin: string
  wafers: WaferMapFinalBinWaferInput[]
  orderedBins: readonly string[]
}) {
  // A bin can contain both supplied CP states. Show both instead of inferring
  // one state from its name or converting inspection counts into new facts.
  const suppliedColors = new Map<string, string>()
  for (const wafer of wafers) for (const die of wafer.dies) {
    if (die.binCode === bin || die.finalBin === bin) {
      suppliedColors.set(finalBinDieColor(die, orderedBins), die.pass ? "Pass" : "Fail")
    }
  }
  const colors = suppliedColors.size ? [...suppliedColors.entries()].map(([color, label]) => ({ color, label })) : [{ label: "状态未提供", color: finalBinColor(bin, orderedBins) }]
  return <span className="inline-flex gap-0.5">{colors.map(({ label, color }) => (
    <i key={color} title={label} aria-label={label} className="size-2.5 rounded-sm" style={{ background: color }} />
  ))}</span>
}

function ParameterLegend({ input }: { input: Extract<WaferMapGalleryInput, { kind: "cp-parameter" }> }) {
  const { label, scale, unit } = input.parameter
  const format = (value: number) => value.toLocaleString("en-US", { maximumSignificantDigits: 6 })
  return <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
    <strong>{label}{unit ? ` (${unit})` : ""}</strong>
    <span className="inline-flex items-center gap-2" aria-label={`参数色阶 ${scale.domainMin} 至 ${scale.domainMax}`}>
      <span title={String(scale.domainMin)}>{format(scale.domainMin)}</span>
      <i className="h-2 w-32 rounded-full" style={{ background: parameterColorGradient(scale.domainMin, scale.domainMax) }} />
      <span title={String(scale.domainMax)}>{format(scale.domainMax)}</span>
    </span>
    <span className="inline-flex items-center gap-1 text-muted-foreground"><i className="size-2.5 rounded-sm" style={{ background: waferMapColorSchemes["cp-parameter"].invalidValue }} />无有效值</span>
    {waferMapColorSchemes["cp-parameter"].cpFailOutline ? <span className="inline-flex items-center gap-1 text-muted-foreground"><i className="size-2.5 rounded-sm border-2" style={{ borderColor: waferMapColorSchemes["cp-parameter"].cpFailOutline }} />CP Fail（已提供时）</span> : null}
  </div>
}

function GalleryLegend({ input, onDefectFiltersChange }: { input: WaferMapGalleryInput; onDefectFiltersChange: (filters: { layerId: string; typeIds: string[] }) => void }) {
  if (input.kind === "cp-parameter") return <GalleryLegendRow><ParameterLegend input={input} /></GalleryLegendRow>
  if (input.kind === "defect") return <DefectFilterComboboxes input={input} onChange={onDefectFiltersChange} />
  const binCounts = new Map<string, number>()
  for (const wafer of input.wafers) for (const die of wafer.dies) {
    const bin = die.binCode ?? die.finalBin
    binCounts.set(bin, (binCounts.get(bin) ?? 0) + 1)
  }
  const orderedBins = [...binCounts.keys()].sort((left, right) => left.localeCompare(right, undefined, { numeric: true }))
  return <GalleryLegendRow><div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
    <span className="text-muted-foreground">按 CP 状态区分 Pass / Fail</span>
    {orderedBins.map((bin) => (
      <span key={bin} className="flex items-center gap-1"><FinalBinSwatches bin={bin} wafers={input.wafers} orderedBins={orderedBins} />Bin {bin} · {binCounts.get(bin)?.toLocaleString()}</span>
    ))}
  </div></GalleryLegendRow>
}

type FilterOption = { id: string; label: string }

export function DefectFilterComboboxes({
  input,
  onChange,
}: {
  input: Extract<WaferMapGalleryInput, { kind: "defect" }>
  onChange: (filters: { layerId: string; typeIds: string[] }) => void
}) {
  const layerInputId = useId()
  const typeInputId = useId()
  const selectedLayer = input.layers.find((layer) => layer.id === input.selectedLayerId) ?? null
  const selectedType = input.selectedDefectTypeIds.length === 1
    ? input.defectTypes.find((type) => type.id === input.selectedDefectTypeIds[0]) ?? null
    : null
  const typeOptions: FilterOption[] = [
    { id: "__all__", label: "All Defect Type" },
    ...input.defectTypes,
  ]
  const selectedTypeOption = selectedType ?? (input.selectedDefectTypeIds.length === 0 ? typeOptions[0] : {
    id: "__unavailable_selection__",
    label: input.selectedDefectTypeIds.length === 1 ? `当前 Layer 不可用 · ${input.selectedDefectTypeIds[0]}` : `已选择 ${input.selectedDefectTypeIds.length} 类`,
  })
  if (selectedTypeOption.id === "__unavailable_selection__") typeOptions.push(selectedTypeOption)

  return (
    <div className="flex flex-wrap gap-3">
      <FilterCombobox
        id={layerInputId}
        label="Layer"
        placeholder="搜索并选择 Layer"
        items={input.layers}
        value={selectedLayer}
        onValueChange={(nextLayer) => {
          if (nextLayer) onChange({ layerId: nextLayer.id, typeIds: input.selectedDefectTypeIds })
        }}
      />
      <FilterCombobox
        id={typeInputId}
        label="Defect Type"
        placeholder="搜索 Defect Type"
        items={typeOptions}
        value={selectedTypeOption}
        onValueChange={(nextType) => {
          if (nextType?.id === "__unavailable_selection__") return
          onChange({ layerId: input.selectedLayerId, typeIds: nextType && nextType.id !== "__all__" ? [nextType.id] : [] })
        }}
      />
    </div>
  )
}

function FilterCombobox({
  id,
  label,
  placeholder,
  items,
  value,
  onValueChange,
}: {
  id: string
  label: string
  placeholder: string
  items: FilterOption[]
  value: FilterOption | null
  onValueChange: (value: FilterOption | null) => void
}) {
  return (
    <Combobox
      items={items}
      value={value}
      onValueChange={onValueChange}
      itemToStringLabel={(item) => item.label}
      itemToStringValue={(item) => item.id}
      isItemEqualToValue={(item, selectedItem) => item.id === selectedItem.id}
    >
      <div className="grid gap-1 sm:w-64">
        <label htmlFor={id} className="text-xs font-medium text-muted-foreground">{label}</label>
        <ComboboxInput id={id} placeholder={placeholder} />
      </div>
      <ComboboxContent>
        <ComboboxEmpty>无匹配选项</ComboboxEmpty>
        <ComboboxList>
          {(item: FilterOption) => (
            <ComboboxItem key={item.id} value={item}>{item.label}</ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

function GalleryLegendRow({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-8 items-center">{children}</div>
}

export type WaferMapProps = {
  data: WaferMapData
  className?: string
  width?: number
  height?: number
  padding?: number
  dieScale?: number
}

export function WaferMap({ data, className }: WaferMapProps) {
  const parsed = waferMapDataSchema.parse(data)
  const input: WaferMapGalleryInput = {
    kind: "cp-final-bin",
    status: "pending",
    wafers: [{
      mapId: `cp-final-bin:${parsed.id}`,
      waferId: parsed.id,
      geometry: { coordinateSystem: "CP_DIE_GRID_V1", dies: parsed.dies, bounds: parsed.bounds },
      dies: parsed.dies.map((die) => ({ ...die, finalBin: "1", pass: true })),
      inspection: {
        testedDieCount: parsed.dies.length,
        totalFailBinCount: 0,
        totalFailBinRatePercent: 0,
        rows: [{ binCode: "1", binDescription: "PASS", count: parsed.dies.length, ratePercent: parsed.dies.length > 0 ? 100 : 0 }],
      },
    }],
  }
  return <WaferMapCore className={className} input={input} wafer={input.wafers[0]} />
}

function isFinalBinWafer(wafer: AnyWafer): wafer is WaferMapFinalBinWaferInput { return wafer.dies.length === 0 || "finalBin" in wafer.dies[0] }
function isParameterWafer(wafer: AnyWafer): wafer is WaferMapParameterWaferInput { return wafer.dies.length === 0 || "value" in wafer.dies[0] }
function isDefectWafer(wafer: AnyWafer): wafer is WaferMapDefectWaferInput { return wafer.dies.length === 0 || "defects" in wafer.dies[0] }

function drawDie(context: CanvasRenderingContext2D, layout: ReturnType<typeof createWaferCanvasLayout>, die: DieData, fill: string, outline?: string) {
  const geometry = layout.dieById.get(die.id)
  if (!geometry) return
  context.fillStyle = fill
  context.fillRect(geometry.x, geometry.y, geometry.width, geometry.height)
  if (outline) {
    context.strokeStyle = outline
    context.lineWidth = Math.max(0.7, geometry.width * 0.12)
    context.strokeRect(geometry.x, geometry.y, geometry.width, geometry.height)
  }
}

function strokeSelectedDie(context: CanvasRenderingContext2D, layout: ReturnType<typeof createWaferCanvasLayout>, dieId: string, lineWidth: number, color: string) {
  const geometry = layout.dieById.get(dieId)
  if (!geometry) return
  context.strokeStyle = color
  context.lineWidth = lineWidth
  context.strokeRect(geometry.x - 0.5, geometry.y - 0.5, geometry.width + 1, geometry.height + 1)
}

function drawCanvas(canvas: HTMLCanvasElement | null, size: number, draw: (context: CanvasRenderingContext2D) => void) {
  if (!canvas) return
  const ratio = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = size * ratio
  canvas.height = size * ratio
  const context = canvas.getContext("2d")
  if (!context) return
  context.setTransform(ratio, 0, 0, ratio, 0, 0)
  context.clearRect(0, 0, size, size)
  draw(context)
}

function clipWafer(context: CanvasRenderingContext2D, layout: ReturnType<typeof createWaferCanvasLayout>) { context.beginPath(); context.arc(layout.centerX, layout.centerY, layout.radius, 0, Math.PI * 2); context.clip() }
function drawWaferBoundary(context: CanvasRenderingContext2D, layout: ReturnType<typeof createWaferCanvasLayout>, color: string) { context.fillStyle = color; context.beginPath(); context.arc(layout.centerX, layout.centerY, layout.radius, 0, Math.PI * 2); context.fill() }
function strokeWaferBoundary(context: CanvasRenderingContext2D, layout: ReturnType<typeof createWaferCanvasLayout>, color: string) { context.strokeStyle = color; context.lineWidth = 1.25; context.beginPath(); context.arc(layout.centerX, layout.centerY, layout.radius, 0, Math.PI * 2); context.stroke() }
