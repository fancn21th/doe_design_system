"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { ChevronLeft, ChevronRight, Expand, ZoomIn, ZoomOut } from "lucide-react"

import {
  DEFAULT_FINAL_BIN_PALETTE,
  createWaferCanvasLayout,
  defectColor,
  finalBinColor,
  parameterColor,
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

type AnyWafer =
  | WaferMapFinalBinWaferInput
  | WaferMapParameterWaferInput
  | WaferMapDefectWaferInput

type ActiveDie = { die: DieData; x: number; y: number }

export type WaferMapCoreProps = {
  input: WaferMapGalleryInput
  wafer: AnyWafer
  className?: string
  selectedDieId?: string | null
  onDieSelect?: (waferId: string, die: DieData) => void
}

export function WaferMapCore({ input, wafer, className, selectedDieId, onDieSelect }: WaferMapCoreProps) {
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
      drawWaferBoundary(context, layout)
      context.save()
      clipWafer(context, layout)
      context.fillStyle = "#cfe1dc"
      for (const die of wafer.geometry.dies) {
        const geometry = layout.dieById.get(die.id)
        if (geometry) context.fillRect(geometry.x, geometry.y, geometry.width, geometry.height)
      }
      context.restore()
      strokeWaferBoundary(context, layout)
    })
  }, [layout, size, wafer.geometry.dies])

  useEffect(() => {
    drawCanvas(dataCanvasRef.current, size, (context) => {
      if (input.status !== "ready") return
      context.save()
      clipWafer(context, layout)
      if (input.kind === "cp-final-bin" && isFinalBinWafer(wafer)) {
        const palette = { ...DEFAULT_FINAL_BIN_PALETTE, ...input.palette }
        for (const die of wafer.dies) drawDie(context, layout, die, finalBinColor(die.finalBin, palette))
      }
      if (input.kind === "cp-parameter" && isParameterWafer(wafer)) {
        for (const die of wafer.dies) {
          const color = die.value === null || die.status !== "VALID"
            ? "#94a3b8"
            : parameterColor(die.value, input.parameter.scale.domainMin, input.parameter.scale.domainMax)
          drawDie(context, layout, die, color, die.pass === false)
        }
      }
      if (input.kind === "defect" && isDefectWafer(wafer)) {
        const selectedTypes = new Set(input.selectedDefectTypeIds)
        for (const die of wafer.dies) {
          const matching = die.defects.find(
            (defect) => defect.layerId === input.selectedLayerId && (selectedTypes.size === 0 || selectedTypes.has(defect.typeId))
          )
          if (matching) drawDie(context, layout, die, defectColor(matching.typeId))
        }
      }
      context.restore()
    })
  }, [input, layout, size, wafer])

  useEffect(() => {
    drawCanvas(interactionCanvasRef.current, size, (context) => {
      if (selectedDieId) {
        strokeSelectedDie(context, layout, selectedDieId, 2)
      }
      if (activeDie && activeDie.die.id !== selectedDieId) {
        strokeSelectedDie(context, layout, activeDie.die.id, 1.5)
      }
    })
  }, [activeDie, layout, selectedDieId, size])

  function resolveDie(event: React.PointerEvent<HTMLDivElement>): ActiveDie | null {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * size
    const y = ((event.clientY - rect.top) / rect.height) * size
    for (const die of wafer.geometry.dies) {
      const geometry = layout.dieById.get(die.id)
      if (geometry && x >= geometry.x && x <= geometry.x + geometry.width && y >= geometry.y && y <= geometry.y + geometry.height) {
        return { die, x: event.clientX + 12, y: event.clientY + 12 }
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
  const details = diePopoverData(input, wafer, activeDie.die.id)
  return (
    <div className="pointer-events-none fixed z-50 w-52 rounded-md bg-popover p-3 text-xs text-popover-foreground shadow-lg ring-1 ring-foreground/10" role="tooltip" style={{ left: activeDie.x, top: activeDie.y }}>
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
  return <div className="flex justify-between gap-3"><span className="text-muted-foreground">{label}</span><b className="font-mono font-medium">{value}</b></div>
}

function diePopoverData(input: WaferMapGalleryInput, wafer: AnyWafer, dieId: string) {
  if (input.kind === "cp-final-bin" && isFinalBinWafer(wafer)) {
    const die = wafer.dies.find((item) => item.id === dieId)
    return die ? [{ label: "Final Bin", value: die.finalBin }] : []
  }
  if (input.kind === "cp-parameter" && isParameterWafer(wafer)) {
    const die = wafer.dies.find((item) => item.id === dieId)
    return die ? [{ label: input.parameter.label, value: die.value?.toLocaleString() ?? "—" }, { label: "Validity", value: die.status }, { label: "Final Bin", value: die.finalBin }] : []
  }
  if (input.kind === "defect" && isDefectWafer(wafer)) {
    const die = wafer.dies.find((item) => item.id === dieId)
    return die ? [{ label: "Defects", value: String(die.defects.length) }] : []
  }
  return []
}

export type WaferMapCardProps = {
  input: WaferMapGalleryInput
  wafer: AnyWafer
  className?: string
  onDieSelect?: (waferId: string, die: DieData) => void
  onExpand?: (waferId: string) => void
}

export function WaferMapCard({ input, wafer, className, onDieSelect, onExpand }: WaferMapCardProps) {
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
            onClick={() => onExpand(wafer.waferId)}
          >
            <Expand />
          </Button>
        )}
      </CardHeader>
      <CardContent className="px-3"><WaferMapCore input={input} wafer={wafer} onDieSelect={onDieSelect} /></CardContent>
      <CardFooter className="grid grid-cols-2 gap-2 bg-transparent px-3 py-2 text-xs"><Metric label="Pass" value={wafer.summary.pass} /><Metric label="Fail" value={wafer.summary.fail} /></CardFooter>
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div><b className="block font-mono text-sm">{value.toLocaleString()}</b><span className="text-muted-foreground">{label}</span></div>
}

export type WaferMapGalleryProps = {
  input: WaferMapGalleryInput
  className?: string
  onDieSelect?: (waferId: string, die: DieData) => void
  onDefectFiltersChange?: (filters: { layerId: string; typeIds: string[] }) => void
  showParameterLegend?: boolean
}

export function WaferMapGallery({ input, className, onDieSelect, onDefectFiltersChange, showParameterLegend = true }: WaferMapGalleryProps) {
  const parsedInput = waferMapGalleryInputSchema.parse(input)
  const [localDefectFilters, setLocalDefectFilters] = useState<{ layerId: string; typeIds: string[] } | null>(null)
  const [expandedWaferId, setExpandedWaferId] = useState<string | null>(null)
  const galleryInput = parsedInput.kind === "defect" && localDefectFilters
    ? { ...parsedInput, selectedLayerId: localDefectFilters.layerId, selectedDefectTypeIds: localDefectFilters.typeIds }
    : parsedInput
  const expandedWafer = galleryInput.wafers.find((wafer) => wafer.waferId === expandedWaferId)

  function changeDefectFilters(next: { layerId: string; typeIds: string[] }) {
    setLocalDefectFilters(next)
    onDefectFiltersChange?.(next)
  }

  return (
    <section className={cn("not-prose domain-ui-typography grid gap-3", className)} aria-label="Wafer map gallery">
      {(galleryInput.kind !== "cp-parameter" || showParameterLegend) && <GalleryLegend input={galleryInput} onDefectFiltersChange={changeDefectFilters} />}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {galleryInput.wafers.map((wafer) => (
          <WaferMapCard
            key={wafer.waferId}
            input={galleryInput}
            wafer={wafer}
            onDieSelect={onDieSelect}
            onExpand={setExpandedWaferId}
          />
        ))}
      </div>
      <WaferMapInspectionDialog
        key={`${galleryInput.kind}-${galleryInput.kind === "defect" ? galleryInput.selectedLayerId : "all"}-${expandedWaferId ?? "closed"}`}
        input={galleryInput}
        wafer={expandedWafer}
        open={Boolean(expandedWafer)}
        onOpenChange={(open) => {
          if (!open) setExpandedWaferId(null)
        }}
        onPrevious={() => setExpandedWaferId(stepWaferId(galleryInput.wafers, expandedWaferId, -1))}
        onNext={() => setExpandedWaferId(stepWaferId(galleryInput.wafers, expandedWaferId, 1))}
        onDieSelect={onDieSelect}
      />
    </section>
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
}: {
  input: WaferMapGalleryInput
  wafer?: AnyWafer
  open: boolean
  onOpenChange: (open: boolean) => void
  onPrevious: () => void
  onNext: () => void
  onDieSelect?: (waferId: string, die: DieData) => void
}) {
  const [selectedDieId, setSelectedDieId] = useState<string | null>(() => wafer ? defaultInspectionDieId(input, wafer) : null)
  const [zoom, setZoom] = useState(100)

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

        <InspectionContext input={input} />
        <InspectionLegend input={input} wafer={wafer} />

        <div className="domain-ui-wafer-inspection-layout min-h-0 gap-4 p-4 pt-3">
          <div className="relative flex min-h-[22rem] min-w-0 items-center justify-center overflow-hidden rounded-2xl border bg-muted/30 p-3">
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-lg bg-background/90 p-1 ring-1 ring-border backdrop-blur-sm">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="缩小"
                disabled={zoom <= 80}
                onClick={() => setZoom((value) => Math.max(80, value - 20))}
              >
                <ZoomOut />
              </Button>
              <span className="w-10 text-center font-mono text-xs font-medium">{zoom}%</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="放大"
                disabled={zoom >= 140}
                onClick={() => setZoom((value) => Math.min(140, value + 20))}
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

            <div
              className="aspect-square h-full max-h-full max-w-full transition-transform duration-150"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              <WaferMapCore
                input={input}
                wafer={wafer}
                className="size-full rounded-xl bg-transparent"
                selectedDieId={selectedDieId}
                onDieSelect={selectDie}
              />
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
            <InspectionStatistics input={input} wafer={wafer} />
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InspectionContext({ input }: { input: WaferMapGalleryInput }) {
  if (input.kind === "cp-parameter") {
    return (
      <div className="flex items-center gap-3 border-b px-5 py-3">
        <span className="text-xs text-muted-foreground">CP Parameter</span>
        <span className="min-w-56 rounded-lg border bg-background px-3 py-2 font-medium">{input.parameter.label}</span>
      </div>
    )
  }
  if (input.kind === "defect") {
    const layer = input.layers.find((item) => item.id === input.selectedLayerId)
    return (
      <div className="flex items-center gap-3 border-b px-5 py-3">
        <span className="text-xs text-muted-foreground">Layer</span>
        <span className="min-w-56 rounded-lg border bg-background px-3 py-2 font-medium">{layer?.label ?? input.selectedLayerId}</span>
      </div>
    )
  }
  return null
}

function InspectionLegend({ input, wafer }: { input: WaferMapGalleryInput; wafer: AnyWafer }) {
  return (
    <div className="flex min-h-11 flex-wrap items-center gap-3 border-b px-5 py-2 text-xs">
      {input.kind === "cp-final-bin" && isFinalBinWafer(wafer) && (
        <>
          <strong>REAL Final Bin Code</strong>
          {wafer.inspection.rows.map((row) => (
            <span key={row.binCode} className="flex items-center gap-1.5">
              <i className="size-2.5 rounded-sm" style={{ background: finalBinColor(row.binCode, { ...DEFAULT_FINAL_BIN_PALETTE, ...input.palette }) }} />
              Bin {row.binCode} · {row.count.toLocaleString()}
            </span>
          ))}
        </>
      )}
      {input.kind === "cp-parameter" && (
        <>
          <strong>Parameter Value</strong>
          <span className="text-muted-foreground">Low</span>
          <i className="h-2 w-44 rounded-full bg-linear-to-r from-yellow-200 via-teal-500 to-slate-900" />
          <span className="text-muted-foreground">High</span>
        </>
      )}
      {input.kind === "defect" && (
        <>
          <strong>Defect Type</strong>
          {input.defectTypes.map((type) => (
            <span key={type.id} className="flex items-center gap-1.5">
              <i className="size-2.5 rounded-sm" style={{ background: defectColor(type.id) }} />
              {type.label}
            </span>
          ))}
        </>
      )}
      <span className="ml-auto flex items-center gap-1.5 text-muted-foreground">
        <i className="size-3 rounded-sm border-2 border-foreground bg-transparent" />
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
    </div>
  )
}

function InspectionStatistics({ input, wafer }: { input: WaferMapGalleryInput; wafer: AnyWafer }) {
  if (input.kind === "cp-final-bin" && isFinalBinWafer(wafer)) {
    return (
      <InspectionTableShell waferId={wafer.waferId} meta={`Tested Die Count：${wafer.inspection.testedDieCount.toLocaleString()}`}>
        <div className="grid grid-cols-2 gap-2">
          <InspectionMetric label="Total Fail Bin Count" value={wafer.inspection.totalFailBinCount.toLocaleString()} />
          <InspectionMetric label="Total Fail Bin Rate" value={formatPercent(wafer.inspection.totalFailBinRatePercent)} />
        </div>
        <Table className="mt-3 text-xs" aria-label="各 Bin Code 数量与占比">
          <TableHeader><TableRow><TableHead>Bin Code</TableHead><TableHead>Bin Des</TableHead><TableHead className="text-right">Count</TableHead><TableHead className="text-right">Rate</TableHead></TableRow></TableHeader>
          <TableBody>{wafer.inspection.rows.map((row) => <TableRow key={row.binCode}><TableCell>Bin {row.binCode}</TableCell><TableCell>{row.binDescription}</TableCell><TableCell className="text-right font-mono">{row.count.toLocaleString()}</TableCell><TableCell className="text-right font-mono">{formatPercent(row.ratePercent)}</TableCell></TableRow>)}</TableBody>
        </Table>
      </InspectionTableShell>
    )
  }

  if (input.kind === "cp-parameter" && isParameterWafer(wafer)) {
    return (
      <InspectionTableShell waferId={wafer.waferId} meta={`Tested Die：${wafer.inspection.testedDieCount.toLocaleString()}`}>
        <Table className="mt-3 text-xs" aria-label="CP 与缺陷分类数量及占比">
          <TableHeader><TableRow><TableHead>Type</TableHead><TableHead className="text-right">Count</TableHead><TableHead className="text-right">Rate</TableHead></TableRow></TableHeader>
          <TableBody>{wafer.inspection.rows.map((row) => <TableRow key={row.classification}><TableCell>{row.label}</TableCell><TableCell className="text-right font-mono">{row.count.toLocaleString()}</TableCell><TableCell className="text-right font-mono">{formatPercent(row.ratePercent)}</TableCell></TableRow>)}</TableBody>
        </Table>
      </InspectionTableShell>
    )
  }

  if (input.kind === "defect" && isDefectWafer(wafer)) {
    const inspection = wafer.inspection.byLayer.find((item) => item.layerId === input.selectedLayerId)
    if (!inspection) return <div className="p-4 text-sm text-muted-foreground">当前 Layer 暂无缺陷统计</div>
    return (
      <InspectionTableShell waferId={wafer.waferId}>
        <div className="grid grid-cols-2 gap-2">
          <InspectionMetric label="Defect Die" value={inspection.defectDieCount.toLocaleString()} />
          <InspectionMetric label="Defect Record" value={inspection.defectRecordCount.toLocaleString()} />
        </div>
        <Table className="mt-3 text-xs" aria-label="各类型缺陷记录总数与占比">
          <TableHeader><TableRow><TableHead>Defect Type</TableHead><TableHead className="text-right">Count</TableHead><TableHead className="text-right">Rate</TableHead></TableRow></TableHeader>
          <TableBody>{inspection.rows.map((row) => <TableRow key={row.typeId}><TableCell>{row.label}</TableCell><TableCell className="text-right font-mono">{row.count.toLocaleString()}</TableCell><TableCell className="text-right font-mono">{formatPercent(row.ratePercent)}</TableCell></TableRow>)}</TableBody>
        </Table>
      </InspectionTableShell>
    )
  }

  return null
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

function InspectionMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border bg-muted/20 p-2"><span className="block text-[11px] text-muted-foreground">{label}</span><b className="mt-1 block font-mono text-sm">{value}</b></div>
}

function selectedDieRows(input: WaferMapGalleryInput, wafer: AnyWafer, dieId: string) {
  if (input.kind === "cp-final-bin" && isFinalBinWafer(wafer)) {
    const die = wafer.dies.find((item) => item.id === dieId)
    const bin = wafer.inspection.rows.find((row) => row.binCode === die?.finalBin)
    return {
      status: die ? { label: die.pass ? "CP Pass" : "CP Fail", tone: die.pass ? "pass" as const : "fail" as const } : null,
      items: die ? [
        { label: "Final Bin", value: `Bin ${die.finalBin}` },
        { label: "Bin Des", value: bin?.binDescription ?? "—" },
      ] : [],
    }
  }
  if (input.kind === "cp-parameter" && isParameterWafer(wafer)) {
    const die = wafer.dies.find((item) => item.id === dieId)
    return {
      status: die ? { label: die.pass ? "CP Pass" : "CP Fail", tone: die.pass ? "pass" as const : "fail" as const } : null,
      items: die ? [
        { label: "CP Parameter", value: input.parameter.label },
        { label: "Parameter Value", value: die.value === null ? "—" : `${die.value.toLocaleString()}${input.parameter.unit ? ` ${input.parameter.unit}` : ""}` },
        { label: "Validity", value: die.status },
        { label: "Final Bin", value: `Bin ${die.finalBin}` },
      ] : [],
    }
  }
  if (input.kind === "defect" && isDefectWafer(wafer)) {
    const die = wafer.dies.find((item) => item.id === dieId)
    const defects = die?.defects.filter((defect) => defect.layerId === input.selectedLayerId) ?? []
    return {
      status: null,
      items: [
        { label: "Layer", value: input.layers.find((item) => item.id === input.selectedLayerId)?.label ?? input.selectedLayerId },
        { label: "Defect Record", value: defects.length.toLocaleString() },
        { label: "Defect Type", value: defects.map((defect) => defect.typeLabel).join(", ") || "—" },
      ],
    }
  }
  return { status: null, items: [] }
}

function defaultInspectionDieId(input: WaferMapGalleryInput, wafer: AnyWafer) {
  if (input.kind === "defect" && isDefectWafer(wafer)) {
    const match = wafer.dies.find((die) => die.defects.some((defect) => defect.layerId === input.selectedLayerId))
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

function stepWaferId(wafers: AnyWafer[], currentWaferId: string | null, direction: number) {
  if (wafers.length === 0) return null
  const index = Math.max(0, wafers.findIndex((wafer) => wafer.waferId === currentWaferId))
  return wafers[(index + direction + wafers.length) % wafers.length]?.waferId ?? null
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`
}

function GalleryLegend({ input, onDefectFiltersChange }: { input: WaferMapGalleryInput; onDefectFiltersChange: (filters: { layerId: string; typeIds: string[] }) => void }) {
  if (input.kind === "cp-parameter") return <GalleryFilterSurface><p className="text-xs text-muted-foreground"><b className="mr-2 text-foreground">{input.parameter.label}</b>{input.parameter.scale.domainMin} → {input.parameter.scale.domainMax}{input.parameter.unit ? ` ${input.parameter.unit}` : ""}</p></GalleryFilterSurface>
  if (input.kind === "defect") return <DefectFilterComboboxes input={input} onChange={onDefectFiltersChange} />
  const binCounts = new Map<string, number>()
  for (const wafer of input.wafers) for (const die of wafer.dies) binCounts.set(die.finalBin, (binCounts.get(die.finalBin) ?? 0) + 1)
  return <GalleryFilterSurface><div className="flex flex-wrap gap-2 text-xs">{[...binCounts.entries()].sort(([left], [right]) => Number(left) - Number(right)).map(([bin, count]) => <span key={bin} className="flex items-center gap-1"><i className="size-2 rounded-sm" style={{ background: finalBinColor(bin, { ...DEFAULT_FINAL_BIN_PALETTE, ...input.palette }) }} />Bin {bin} · {count.toLocaleString()}</span>)}</div></GalleryFilterSurface>
}

type FilterOption = { id: string; label: string }

function DefectFilterComboboxes({
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
  const selectedTypeOption = selectedType ?? typeOptions[0]

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
        onValueChange={(nextType) => onChange({
          layerId: input.selectedLayerId,
          typeIds: nextType && nextType.id !== "__all__" ? [nextType.id] : [],
        })}
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

function GalleryFilterSurface({ children }: { children: React.ReactNode }) {
  return <Card size="sm" className="border ring-0 shadow-none"><CardContent className="py-0">{children}</CardContent></Card>
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
      waferId: parsed.id,
      geometry: { coordinateSystem: "CP_DIE_GRID_V1", dies: parsed.dies, bounds: parsed.bounds },
      dies: parsed.dies.map((die) => ({ ...die, finalBin: "1", pass: true })),
      summary: { pass: parsed.dies.length, fail: 0 },
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

function drawDie(context: CanvasRenderingContext2D, layout: ReturnType<typeof createWaferCanvasLayout>, die: DieData, fill: string, nonPass = false) {
  const geometry = layout.dieById.get(die.id)
  if (!geometry) return
  context.fillStyle = fill
  context.fillRect(geometry.x, geometry.y, geometry.width, geometry.height)
  if (nonPass) {
    context.strokeStyle = "#d92d20"
    context.lineWidth = Math.max(0.7, geometry.width * 0.12)
    context.strokeRect(geometry.x, geometry.y, geometry.width, geometry.height)
  }
}

function strokeSelectedDie(context: CanvasRenderingContext2D, layout: ReturnType<typeof createWaferCanvasLayout>, dieId: string, lineWidth: number) {
  const geometry = layout.dieById.get(dieId)
  if (!geometry) return
  context.strokeStyle = "#172b2b"
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
function drawWaferBoundary(context: CanvasRenderingContext2D, layout: ReturnType<typeof createWaferCanvasLayout>) { context.fillStyle = "#f3f6f5"; context.beginPath(); context.arc(layout.centerX, layout.centerY, layout.radius, 0, Math.PI * 2); context.fill() }
function strokeWaferBoundary(context: CanvasRenderingContext2D, layout: ReturnType<typeof createWaferCanvasLayout>) { context.strokeStyle = "#c7d2d9"; context.lineWidth = 1.25; context.beginPath(); context.arc(layout.centerX, layout.centerY, layout.radius, 0, Math.PI * 2); context.stroke() }
