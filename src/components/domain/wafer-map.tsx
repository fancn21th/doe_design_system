"use client"

import { useEffect, useMemo, useRef } from "react"

import { cn } from "@/lib/utils"
import { waferMapDataSchema } from "@/schemas/domain-component-inputs"
import {
  baseDiePolicy,
  createDieVisualStates,
  createWaferLayout,
  DEFAULT_WAFER_RENDER_CONFIG,
  type DieData,
  type DieRenderPolicy,
  type DieVisualState,
  type WaferMapData,
  type WaferRenderConfig,
} from "@/components/domain/wafer-map-model"

export {
  baseDiePolicy,
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
  WaferLayoutResult,
  WaferMapData,
  WaferRenderConfig,
} from "@/components/domain/wafer-map-model"

export type CanvasDieRendererProps = {
  width: number
  height: number
  background: string
  visuals: readonly DieVisualState[]
  ariaLabel: string
}

export function CanvasDieRenderer({
  width,
  height,
  background,
  visuals,
  ariaLabel,
}: CanvasDieRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const context = canvas.getContext("2d")
    if (!context) {
      return
    }

    const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(width * devicePixelRatio)
    canvas.height = Math.round(height * devicePixelRatio)
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
    context.clearRect(0, 0, width, height)
    context.fillStyle = background
    context.fillRect(0, 0, width, height)

    for (const { geometry, appearance } of visuals) {
      if (appearance.visible === false) {
        continue
      }

      context.globalAlpha = appearance.opacity ?? 1
      context.fillStyle = appearance.fill
      context.fillRect(geometry.x, geometry.y, geometry.width, geometry.height)

      if (appearance.stroke) {
        context.strokeStyle = appearance.stroke
        context.lineWidth = appearance.strokeWidth ?? 1
        context.strokeRect(geometry.x, geometry.y, geometry.width, geometry.height)
      }
    }

    context.globalAlpha = 1
  }, [background, height, visuals, width])

  return (
    <canvas
      ref={canvasRef}
      className="block max-w-full"
      style={{ width, height }}
      role="img"
      aria-label={ariaLabel}
    />
  )
}

export type BaseDieLayerViewProps = CanvasDieRendererProps

export function BaseDieLayerView(props: BaseDieLayerViewProps) {
  return <CanvasDieRenderer {...props} />
}

export type BaseDieLayerContainerProps = {
  wafer: WaferMapData
  config: WaferRenderConfig
  policy: DieRenderPolicy<DieData, void>
}

export function BaseDieLayerContainer({
  wafer,
  config,
  policy,
}: BaseDieLayerContainerProps) {
  const layout = useMemo(() => createWaferLayout(wafer, config), [config, wafer])
  const visuals = useMemo(
    () => createDieVisualStates(wafer.dies, layout.dies, policy),
    [layout.dies, policy, wafer.dies]
  )

  return (
    <BaseDieLayerView
      width={layout.width}
      height={layout.height}
      background={config.background}
      visuals={visuals}
      ariaLabel={`Wafer ${wafer.id}, ${wafer.dies.length} dies`}
    />
  )
}

export type WaferMapProps = {
  data: WaferMapData
  width?: number
  height?: number
  padding?: number
  dieScale?: number
  renderPolicy?: DieRenderPolicy<DieData, void>
  className?: string
}

export function WaferMapContainer({
  data,
  width,
  height,
  padding,
  dieScale,
  renderPolicy = baseDiePolicy,
}: Omit<WaferMapProps, "className">) {
  const parsedData = waferMapDataSchema.parse(data)
  const config = useMemo(
    () => ({
      ...DEFAULT_WAFER_RENDER_CONFIG,
      width: width ?? DEFAULT_WAFER_RENDER_CONFIG.width,
      height: height ?? DEFAULT_WAFER_RENDER_CONFIG.height,
      padding: padding ?? DEFAULT_WAFER_RENDER_CONFIG.padding,
      dieScale: dieScale ?? DEFAULT_WAFER_RENDER_CONFIG.dieScale,
    }),
    [dieScale, height, padding, width]
  )

  return (
    <BaseDieLayerContainer
      wafer={parsedData}
      config={config}
      policy={renderPolicy}
    />
  )
}

export function WaferMap({ className, ...props }: WaferMapProps) {
  return (
    <div className={cn("not-prose domain-ui-typography inline-block max-w-full", className)}>
      <WaferMapContainer {...props} />
    </div>
  )
}