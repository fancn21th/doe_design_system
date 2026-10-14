import type { MeasurementComparisonGroup, MeasurementGroup, MeasurementInput, MeasurementPoint } from "@/schemas/domain-component-inputs"

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

export function measurementWaferIdentity(group: Pick<MeasurementGroup, "id" | "label">): string {
  return group.id === group.label ? group.label : `${group.label} · ${group.id}`
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
    if (line.value < domain.minimum || line.value > domain.maximum) continue
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

/** Group references stay inside their wafer column; values and group identity are preserved. */
export function createMeasurementGroupReferenceLabels(
  input: MeasurementInput,
  domain: MeasurementDomain,
  layout: MeasurementLayout,
) {
  return input.groups.flatMap((group, groupIndex) => {
    const bounds = groupBounds(groupIndex, layout)
    return createMeasurementReferenceLabels(group.referenceLines ?? [], domain, layout)
      .map((label) => ({ ...label, groupIndex, left: bounds.left + 6, right: bounds.right - 6 }))
  })
}

/** Out-of-view references retain exact values and wafer attribution in a visible annotation. */
export function measurementOutsideReferences(input: MeasurementInput, domain: MeasurementDomain) {
  return [
    ...input.referenceLines.map(line => ({ ...line, groupLabel: null as string | null })),
    ...input.groups.flatMap(group => (group.referenceLines ?? []).map(line => ({ ...line, groupLabel: measurementWaferIdentity(group) }))),
  ].filter(line => line.value < domain.minimum || line.value > domain.maximum)
    .map(line => ({ ...line, direction: line.value < domain.minimum ? "below" as const : "above" as const }))
}

export function createMeasurementDomain(input: MeasurementInput): MeasurementDomain | null {
  const values: number[] = []
  if (input.scale?.mode === "fixed" && input.scale.min !== undefined && input.scale.max !== undefined && input.scale.min < input.scale.max) {
    return { minimum: input.scale.min, maximum: input.scale.max }
  }
  for (const group of input.groups) {
    for (const point of group.points) values.push(point.value)
    if (group.summary.mean !== null && group.summary.sampleSigma !== null) {
      values.push(group.summary.mean - 3 * group.summary.sampleSigma, group.summary.mean + 3 * group.summary.sampleSigma)
    }
    for (const value of [group.summary.min, group.summary.max, group.summary.whiskerLow, group.summary.whiskerHigh]) {
      if (value !== null) values.push(value)
    }
  }
  if (input.scale?.mode === "data-and-references" || !input.scale) {
    for (const line of input.referenceLines) values.push(line.value)
    for (const group of input.groups) {
      for (const line of group.referenceLines ?? []) values.push(line.value)
    }
  }
  const requestedMin = input.scale?.min
  const requestedMax = input.scale?.max
  if (requestedMin !== undefined) values.push(requestedMin)
  if (requestedMax !== undefined) values.push(requestedMax)
  if (!values.length) return null
  const minimum = values.reduce((result, value) => Math.min(result, value), Infinity)
  const maximum = values.reduce((result, value) => Math.max(result, value), -Infinity)
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

export type MeasurementPointPresentation = "density" | "individual"

/** Horizontal display offsets only: no measurement values or point identities are changed. */
export function measurementPointOffsets(points: MeasurementPoint[], groupWidth: number, presentation: MeasurementPointPresentation = "density"): number[] {
  if (presentation === "density") return points.map((point, index) => stableJitter(point, index) * Math.min(40, groupWidth * 0.64))
  const halfBand = Math.min(96, groupWidth * 0.64) / 2
  // Leave the center available for mean/median markers, including a one-point sample.
  const centerGap = Math.min(9, halfBand / 2)
  const offsets = new Array<number>(points.length)
  const ordered = points.map((point, index) => ({ index, key: stableJitter(point, index) }))
    .sort((a, b) => a.key - b.key || a.index - b.index)
  ordered.forEach(({ index }, rank) => {
    const position = (rank + 0.5) / points.length - 0.5
    offsets[index] = (position < 0 ? -1 : 1) * (centerGap + Math.abs(position) * 2 * (halfBand - centerGap))
  })
  return offsets
}

export function createMeasurementHitIndex(input: MeasurementInput, domain: MeasurementDomain, layout: MeasurementLayout, presentation: MeasurementPointPresentation = "density"): MeasurementHitIndex {
  const index = new Map<string, PositionedMeasurementPoint[]>()
  input.groups.forEach((group, groupIndex) => {
    const bounds = groupBounds(groupIndex, layout)
    const offsets = measurementPointOffsets(group.points, layout.groupWidth, presentation)
    for (let pointIndex = 0; pointIndex < group.points.length; pointIndex++) {
      const point = group.points[pointIndex]
      if (point.value < domain.minimum || point.value > domain.maximum) continue
      const positioned = { point, x: bounds.center + offsets[pointIndex], y: measurementY(point.value, domain, layout) }
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

/** A shared wafer never chooses the first Step implicitly. */
export function resolveMeasurementComparison(input: MeasurementInput, waferId: string, activeId?: string | null): MeasurementComparisonGroup | null {
  const memberships = (input.comparisonGroups ?? []).filter((group) => group.members.some((member) => member.waferId === waferId))
  return memberships.find((group) => group.id === activeId) ?? (memberships.length === 1 ? memberships[0] : null)
}

/** Canvas coordinates remain local, while inspection stays inside the scrolled viewport. */
export function measurementPopoverBounds(anchorX: number, viewportLeft: number, viewportWidth: number) {
  const width = Math.min(308, Math.max(1, viewportWidth - 16))
  const minimumLeft = viewportLeft + 8
  const maximumLeft = Math.max(minimumLeft, viewportLeft + viewportWidth - width - 8)
  return { left: Math.max(minimumLeft, Math.min(anchorX + 14, maximumLeft)), width }
}
