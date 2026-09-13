"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"

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
  onDieSelect?: (waferId: string, die: DieData) => void
}

export function WaferMapCore({ input, wafer, className, onDieSelect }: WaferMapCoreProps) {
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
      if (!activeDie) return
      const geometry = layout.dieById.get(activeDie.die.id)
      if (!geometry) return
      context.strokeStyle = "#172b2b"
      context.lineWidth = 1.5
      context.strokeRect(geometry.x - 0.5, geometry.y - 0.5, geometry.width + 1, geometry.height + 1)
    })
  }, [activeDie, layout, size])

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

export type WaferMapCardProps = { input: WaferMapGalleryInput; wafer: AnyWafer; className?: string; onDieSelect?: (waferId: string, die: DieData) => void }

export function WaferMapCard({ input, wafer, className, onDieSelect }: WaferMapCardProps) {
  return (
    <Card size="sm" className={cn("gap-2", className)}>
      <CardHeader className="px-3"><CardTitle className="font-mono">{wafer.waferId}</CardTitle></CardHeader>
      <CardContent className="px-3"><WaferMapCore input={input} wafer={wafer} onDieSelect={onDieSelect} /></CardContent>
      <CardFooter className="grid grid-cols-2 gap-2 px-3 py-2 text-xs"><Metric label="Pass" value={wafer.summary.pass} /><Metric label="Fail" value={wafer.summary.fail} /></CardFooter>
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
}

export function WaferMapGallery({ input, className, onDieSelect, onDefectFiltersChange }: WaferMapGalleryProps) {
  const parsedInput = waferMapGalleryInputSchema.parse(input)
  const [localDefectFilters, setLocalDefectFilters] = useState<{ layerId: string; typeIds: string[] } | null>(null)
  const galleryInput = parsedInput.kind === "defect" && localDefectFilters
    ? { ...parsedInput, selectedLayerId: localDefectFilters.layerId, selectedDefectTypeIds: localDefectFilters.typeIds }
    : parsedInput

  function changeDefectFilters(next: { layerId: string; typeIds: string[] }) {
    setLocalDefectFilters(next)
    onDefectFiltersChange?.(next)
  }

  return (
    <section className={cn("not-prose domain-ui-typography grid gap-3", className)} aria-label="Wafer map gallery">
      <GalleryLegend input={galleryInput} onDefectFiltersChange={changeDefectFilters} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {galleryInput.wafers.map((wafer) => <WaferMapCard key={wafer.waferId} input={galleryInput} wafer={wafer} onDieSelect={onDieSelect} />)}
      </div>
    </section>
  )
}

function GalleryLegend({ input, onDefectFiltersChange }: { input: WaferMapGalleryInput; onDefectFiltersChange: (filters: { layerId: string; typeIds: string[] }) => void }) {
  if (input.kind === "cp-parameter") return <div className="rounded-lg border bg-muted/20 px-3 py-2 text-xs text-muted-foreground"><b className="mr-2 text-foreground">{input.parameter.label}</b>{input.parameter.scale.domainMin} → {input.parameter.scale.domainMax}{input.parameter.unit ? ` ${input.parameter.unit}` : ""}</div>
  if (input.kind === "defect") return <div className="grid gap-2 rounded-lg border bg-muted/20 px-3 py-2 text-xs"><div className="flex flex-wrap items-center gap-1"><span className="mr-1 text-muted-foreground">Layer</span>{input.layers.map((layer) => <FilterButton key={layer.id} active={layer.id === input.selectedLayerId} onClick={() => onDefectFiltersChange({ layerId: layer.id, typeIds: input.selectedDefectTypeIds })}>{layer.label}</FilterButton>)}</div><div className="flex flex-wrap items-center gap-1"><span className="mr-1 text-muted-foreground">Type</span>{input.defectTypes.map((type) => <FilterButton key={type.id} active={input.selectedDefectTypeIds.includes(type.id)} onClick={() => onDefectFiltersChange({ layerId: input.selectedLayerId, typeIds: input.selectedDefectTypeIds.includes(type.id) ? input.selectedDefectTypeIds.filter((id) => id !== type.id) : [...input.selectedDefectTypeIds, type.id] })}><i className="size-2 rounded-sm" style={{ background: defectColor(type.id) }} />{type.label}</FilterButton>)}</div></div>
  const binCounts = new Map<string, number>()
  for (const wafer of input.wafers) for (const die of wafer.dies) binCounts.set(die.finalBin, (binCounts.get(die.finalBin) ?? 0) + 1)
  return <div className="flex flex-wrap gap-2 rounded-lg border bg-muted/20 px-3 py-2 text-xs">{[...binCounts.entries()].sort(([left], [right]) => Number(left) - Number(right)).map(([bin, count]) => <span key={bin} className="flex items-center gap-1"><i className="size-2 rounded-sm" style={{ background: finalBinColor(bin, { ...DEFAULT_FINAL_BIN_PALETTE, ...input.palette }) }} />Bin {bin} · {count.toLocaleString()}</span>)}</div>
}

function FilterButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return <button type="button" className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5", active ? "bg-background text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground")} aria-pressed={active} onClick={onClick}>{children}</button>
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
  const input: WaferMapGalleryInput = { kind: "cp-final-bin", status: "pending", wafers: [{ waferId: parsed.id, geometry: { coordinateSystem: "CP_DIE_GRID_V1", dies: parsed.dies, bounds: parsed.bounds }, dies: parsed.dies.map((die) => ({ ...die, finalBin: "1", pass: true })), summary: { pass: parsed.dies.length, fail: 0 } }] }
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
