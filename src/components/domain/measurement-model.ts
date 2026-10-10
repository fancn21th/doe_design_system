import type { MeasurementGroup, MeasurementInput, MeasurementPoint } from "@/schemas/domain-component-inputs"

export type MeasurementDomain = { minimum: number; maximum: number }
export type MeasurementLayout = {
  width: number
  height: number
  left: number
  right: number
  top: number
  bottom: number
  plotWidth: number
  plotHeight: number
  groupWidth: number
}
export type PositionedMeasurementPoint = { point: MeasurementPoint; x: number; y: number }
export type MeasurementHitIndex = ReadonlyMap<string, readonly PositionedMeasurementPoint[]>

// A readable column stays fixed when a report contains more wafers than fit on screen.
export const MEASUREMENT_MIN_GROUP_WIDTH = 68
export const MEASUREMENT_AXIS_WIDTH = 124

export function measurementChartWidth(viewportWidth: number, groupCount: number): number {
  return Math.max(viewportWidth, groupCount * MEASUREMENT_MIN_GROUP_WIDTH + MEASUREMENT_AXIS_WIDTH)
}

/** Compact only a supplied wafer-number suffix; full identity stays in the hover/click contract. */
export function measurementGroupLabel(label: string): string {
  const waferNumber = label.match(/(?:^W|[_-]W?)(\d{1,3})$/i)?.[1]
  return waferNumber ? `W${waferNumber.padStart(2, "0")}` : label
}

export function createMeasurementReferenceLabels(
  lines: MeasurementInput["referenceLines"],
  domain: MeasurementDomain,
  layout: MeasurementLayout,
) {
  const byValue = new Map<number, MeasurementInput["referenceLines"]>()
  for (const line of lines) {
    const sameValue = byValue.get(line.value) ?? []
    sameValue.push(line)
    byValue.set(line.value, sameValue)
  }
  const labels = [...byValue.entries()].map(([value, groupedLines]) => ({
    value,
    lines: groupedLines,
    anchorY: measurementY(value, domain, layout),
    labelY: 0,
  })).sort((left, right) => left.anchorY - right.anchorY)
  const minimumY = layout.top + 14
  const maximumY = layout.top + layout.plotHeight - 8
  const gap = 18
  // Pack labels independently of their evidence lines; equal values share one annotation.
  labels.forEach((label, index) => {
    label.labelY = Math.max(minimumY, label.anchorY - 6, index ? labels[index - 1].labelY + gap : minimumY)
  })
  if (labels.length && labels.at(-1)!.labelY > maximumY) {
    labels.at(-1)!.labelY = maximumY
    for (let index = labels.length - 2; index >= 0; index--) {
      labels[index].labelY = Math.min(labels[index].labelY, labels[index + 1].labelY - gap)
    }
  }
  return labels
}

export function createMeasurementDomain(input: MeasurementInput): MeasurementDomain | null {
  const values: number[] = []
  for (const group of input.groups) {
    for (const point of group.points) values.push(point.value)
    for (const value of [group.summary.min, group.summary.max, group.summary.whiskerLow, group.summary.whiskerHigh]) {
      if (value !== null) values.push(value)
    }
  }
  if (input.scale?.mode === "data-and-references" || !input.scale) {
    for (const line of input.referenceLines) values.push(line.value)
  }
  const requestedMin = input.scale?.min
  const requestedMax = input.scale?.max
  if (requestedMin !== undefined) values.push(requestedMin)
  if (requestedMax !== undefined) values.push(requestedMax)
  if (!values.length) return null
  const minimum = Math.min(...values)
  const maximum = Math.max(...values)
  if (minimum === maximum) return { minimum: minimum - 0.5, maximum: maximum + 0.5 }
  const padding = (maximum - minimum) * 0.06
  return { minimum: requestedMin ?? minimum - padding, maximum: requestedMax ?? maximum + padding }
}

export function createMeasurementLayout(width: number, height: number, groupCount: number): MeasurementLayout {
  const left = 104
  const right = 20
  const top = 38
  const bottom = 52
  const plotWidth = Math.max(1, width - left - right)
  return { width, height, left, right, top, bottom, plotWidth, plotHeight: Math.max(1, height - top - bottom), groupWidth: plotWidth / Math.max(groupCount, 1) }
}

export function measurementY(value: number, domain: MeasurementDomain, layout: MeasurementLayout): number {
  return layout.top + ((domain.maximum - value) / (domain.maximum - domain.minimum)) * layout.plotHeight
}

export function groupBounds(index: number, layout: MeasurementLayout) {
  const left = layout.left + index * layout.groupWidth
  return { left, right: left + layout.groupWidth, center: left + layout.groupWidth / 2 }
}

export function stableJitter(point: MeasurementPoint, index: number): number {
  let hash = index + 2166136261
  for (const text of [point.id, String(point.x), String(point.y)]) {
    for (let character = 0; character < text.length; character++) hash = Math.imul(hash ^ text.charCodeAt(character), 16777619)
  }
  return ((hash >>> 0) / 4294967295) - 0.5
}

export function createMeasurementHitIndex(input: MeasurementInput, domain: MeasurementDomain, layout: MeasurementLayout): MeasurementHitIndex {
  const index = new Map<string, PositionedMeasurementPoint[]>()
  input.groups.forEach((group, groupIndex) => {
    const bounds = groupBounds(groupIndex, layout)
    const jitterWidth = Math.min(40, layout.groupWidth * 0.64)
    for (let pointIndex = 0; pointIndex < group.points.length; pointIndex++) {
      const point = group.points[pointIndex]
      const positioned = { point, x: bounds.center + stableJitter(point, pointIndex) * jitterWidth, y: measurementY(point.value, domain, layout) }
      const bucket = `${groupIndex}:${Math.floor(positioned.y / 14)}`
      const points = index.get(bucket) ?? []
      points.push(positioned)
      index.set(bucket, points)
    }
  })
  return index
}

export function nearestMeasurementPoint(index: MeasurementHitIndex, groupIndex: number, x: number, y: number): PositionedMeasurementPoint | null {
  let nearest: PositionedMeasurementPoint | null = null
  let distance = 100
  const row = Math.floor(y / 14)
  for (let candidateRow = row - 1; candidateRow <= row + 1; candidateRow++) {
    for (const point of index.get(`${groupIndex}:${candidateRow}`) ?? []) {
      const nextDistance = (point.x - x) ** 2 + (point.y - y) ** 2
      if (nextDistance < distance) { nearest = point; distance = nextDistance }
    }
  }
  return nearest
}

export function groupIndexAt(x: number, layout: MeasurementLayout, groupCount: number): number | null {
  const index = Math.floor((x - layout.left) / layout.groupWidth)
  return index >= 0 && index < groupCount ? index : null
}

export function hasCompletePointCloud(group: MeasurementGroup): boolean {
  return group.summary.count === group.points.length
}
