export { DEFAULT_FINAL_BIN_PALETTE, finalBinColor, parameterColor, parameterColorGradient, defectColor } from "./wafer-map-colors"

export type DieId = string

export type DieData = {
  id: DieId
  x: number
  y: number
}

export type WaferBounds = {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export type WaferMapData = {
  id: string
  dies: readonly DieData[]
  bounds: WaferBounds
}

export type WaferRenderConfig = {
  width: number
  height: number
  padding: number
  dieScale: number
  background: string
}

export type DieGeometry = {
  id: DieId
  x: number
  y: number
  width: number
  height: number
}

export type WaferLayoutResult = {
  width: number
  height: number
  unitX: number
  unitY: number
  cellWidth: number
  cellHeight: number
  dies: readonly DieGeometry[]
}

export type DieAppearance = {
  fill: string
  stroke?: string
  strokeWidth?: number
  opacity?: number
  visible?: boolean
}

export type DieVisualState = {
  id: DieId
  geometry: DieGeometry
  appearance: DieAppearance
}

export type DieRenderPolicy<
  TDie extends DieData = DieData,
  TContext = unknown,
> = {
  resolve: (die: TDie, context: TContext) => DieAppearance
}

export const DEFAULT_WAFER_RENDER_CONFIG: WaferRenderConfig = {
  width: 720,
  height: 720,
  padding: 48,
  dieScale: 0.82,
  background: "#f5faf9",
}

export const baseDiePolicy: DieRenderPolicy<DieData, void> = {
  resolve() {
    return {
      fill: "#d9e8e4",
      opacity: 1,
      visible: true,
    }
  },
}

export function createDieId(x: number, y: number): DieId {
  return `${x}|${y}`
}

export function calculateWaferBounds(
  dies: readonly DieData[]
): WaferBounds {
  if (dies.length === 0) {
    throw new Error("Cannot calculate bounds for an empty wafer.")
  }

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  for (const die of dies) {
    if (!Number.isFinite(die.x) || !Number.isFinite(die.y)) {
      throw new Error(`Die ${die.id} has invalid coordinates.`)
    }

    minX = Math.min(minX, die.x)
    maxX = Math.max(maxX, die.x)
    minY = Math.min(minY, die.y)
    maxY = Math.max(maxY, die.y)
  }

  return { minX, maxX, minY, maxY }
}

export function createWaferLayout(
  wafer: WaferMapData,
  config: WaferRenderConfig
): WaferLayoutResult {
  const { bounds } = wafer
  const validBounds =
    Number.isFinite(bounds.minX) &&
    Number.isFinite(bounds.maxX) &&
    Number.isFinite(bounds.minY) &&
    Number.isFinite(bounds.maxY) &&
    bounds.minX <= bounds.maxX &&
    bounds.minY <= bounds.maxY
  const plotWidth = config.width - config.padding * 2
  const plotHeight = config.height - config.padding * 2

  if (!validBounds) {
    throw new Error("Wafer bounds must be finite and ordered.")
  }

  if (
    !Number.isFinite(config.width) ||
    !Number.isFinite(config.height) ||
    !Number.isFinite(config.dieScale) ||
    config.width <= 0 ||
    config.height <= 0 ||
    config.dieScale <= 0 ||
    plotWidth <= 0 ||
    plotHeight <= 0
  ) {
    throw new Error("Wafer render config must define a positive plot area.")
  }

  const spanX = bounds.maxX - bounds.minX + 1
  const spanY = bounds.maxY - bounds.minY + 1
  const unit = Math.min(plotWidth / spanX, plotHeight / spanY)
  const unitX = unit
  const unitY = unit
  const cellWidth = Math.max(1, unitX * config.dieScale)
  const cellHeight = Math.max(1, unitY * config.dieScale)
  const centerX = config.width / 2
  const centerY = config.height / 2
  const midX = (bounds.minX + bounds.maxX) / 2
  const midY = (bounds.minY + bounds.maxY) / 2

  return {
    width: config.width,
    height: config.height,
    unitX,
    unitY,
    cellWidth,
    cellHeight,
    dies: wafer.dies.map((die) => ({
      id: die.id,
      x: centerX + (die.x - midX) * unitX - cellWidth / 2,
      y: centerY - (die.y - midY) * unitY - cellHeight / 2,
      width: cellWidth,
      height: cellHeight,
    })),
  }
}

export function createDieVisualStates(
  dies: readonly DieData[],
  geometries: readonly DieGeometry[],
  policy: DieRenderPolicy<DieData, void>
): readonly DieVisualState[] {
  const geometryById = new Map(geometries.map((geometry) => [geometry.id, geometry]))

  return dies.map((die) => {
    const geometry = geometryById.get(die.id)
    if (!geometry) {
      throw new Error(`Missing geometry for die ${die.id}.`)
    }

    return {
      id: die.id,
      geometry,
      appearance: policy.resolve(die, undefined),
    }
  })
}

export type WaferCanvasLayout = {
  width: number
  height: number
  centerX: number
  centerY: number
  radius: number
  cellWidth: number
  cellHeight: number
  dieById: ReadonlyMap<DieId, DieGeometry>
}

export function createWaferCanvasLayout(
  wafer: WaferMapData,
  size: number,
  padding = 8
): WaferCanvasLayout {
  const { bounds } = wafer
  const diameter = Math.max(1, size - padding * 2)
  const spanX = Math.max(1, bounds.maxX - bounds.minX + 1)
  const spanY = Math.max(1, bounds.maxY - bounds.minY + 1)
  const unitX = diameter / spanX
  const unitY = diameter / spanY
  const cellWidth = Math.max(0.8, unitX * 0.9)
  const cellHeight = Math.max(0.8, unitY * 0.9)
  const centerX = size / 2
  const centerY = size / 2
  const midX = (bounds.minX + bounds.maxX) / 2
  const midY = (bounds.minY + bounds.maxY) / 2

  // Canvas has a visual 12-inch circle. CP coordinate spans are not guaranteed
  // to have the same count on X/Y, so normalize each axis only in this visual
  // adapter. The original coordinate data remains untouched for hit testing.
  const dies = wafer.dies.map((die) => ({
    id: die.id,
    x: centerX + (die.x - midX) * unitX - cellWidth / 2,
    y: centerY - (die.y - midY) * unitY - cellHeight / 2,
    width: cellWidth,
    height: cellHeight,
  }))

  return {
    width: size,
    height: size,
    centerX,
    centerY,
    radius: Math.max(0, size / 2 - padding),
    cellWidth,
    cellHeight,
    dieById: new Map(dies.map((die) => [die.id, die])),
  }
}

/** Display geometry only: preserve exact supplied Die facts at every zoom. */
export function boundedWaferZoom(zoom: number) {
  return Math.max(60, Math.min(300, zoom))
}

export function canvasPointFromClient(client: { x: number; y: number }, rect: { left: number; top: number; width: number; height: number }, size: number) {
  return { x: (client.x - rect.left) / rect.width * size, y: (client.y - rect.top) / rect.height * size }
}

export function waferTooltipPosition(pointer: { x: number; y: number }, tooltip: { width: number; height: number }, viewport: { width: number; height: number }) {
  const margin = 16
  const preferredLeft = pointer.x + 12 + tooltip.width + margin <= viewport.width ? pointer.x + 12 : pointer.x - tooltip.width - 12
  return {
    left: Math.max(margin, Math.min(preferredLeft, viewport.width - tooltip.width - margin)),
    top: Math.max(margin, Math.min(pointer.y + 12, viewport.height - tooltip.height - margin)),
  }
}

/** Every supplied matching class occupies an equal-width visual segment. */
export function dieColorSegments(geometry: DieGeometry, colors: readonly string[]) {
  return colors.map((fill, index) => ({ ...geometry, fill, x: geometry.x + geometry.width * index / colors.length, width: geometry.width / colors.length }))
}
