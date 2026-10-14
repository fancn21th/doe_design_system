import { describe, expect, it } from "vitest"

import {
  createMeasurementDomain,
  createMeasurementGroupReferenceLabels,
  createMeasurementHitIndex,
  createMeasurementLayout,
  createMeasurementReferenceLabels,
  groupBounds,
  hasCompletePointCloud,
  measurementY,
  measurementChartWidth,
  measurementGroupLabel,
  measurementWaferIdentity,
  measurementPopoverBounds,
  nearestMeasurementPoint,
  stableJitter,
} from "@/components/domain/measurement-model"
import { measurementFixture, measurementLabelBoundaryFixture, measurementMixedSpecFixture, measurementSmallFixture } from "@/components/domain/measurement.fixtures"
import { measurementInputSchema } from "@/schemas/domain-component-inputs"

describe("Measurement rendering model", () => {
  it("keeps whole-wafer inspection within visible scroll bounds for right-edge, scrolled and narrow columns", () => {
    for (const [anchor, scrollLeft, viewport] of [[900, 0, 936], [1500, 500, 936], [450, 500, 936], [230, 0, 260]]) {
      const popover = measurementPopoverBounds(anchor, scrollLeft, viewport)
      expect(popover.left).toBeGreaterThanOrEqual(scrollLeft + 8)
      expect(popover.left + popover.width).toBeLessThanOrEqual(scrollLeft + viewport - 8)
      expect(popover.width).toBeLessThanOrEqual(308)
    }
  })
  it("includes full mean ±3σ endpoints in overview while respecting supplied focused bounds", () => {
    const input = { ...measurementSmallFixture, groups: [{ ...measurementSmallFixture.groups[0], summary: { ...measurementSmallFixture.groups[0].summary, mean: 81.2, sampleSigma: 31.25 } }] }
    const overview = createMeasurementDomain(input)!
    expect(overview.minimum).toBeLessThanOrEqual(-12.55)
    expect(overview.maximum).toBeGreaterThanOrEqual(174.95)
    const focused = createMeasurementDomain({ ...input, scale: { mode: "fixed", min: 88, max: 92 } })
    expect(focused).toEqual({ minimum: 88, maximum: 92 })
    const layout = createMeasurementLayout(800, 560, 1)
    const point = input.groups[0].points.find((point) => point.value < 88)!
    const index = createMeasurementHitIndex({ ...input, scale: { mode: "fixed", min: 88, max: 92 } }, focused!, layout)
    expect([...index.values()].flat().some((positioned) => positioned.point.id === point.id)).toBe(false)
  })
  it("keeps the full 25 × 4,099 die fixture intact", () => {
    const parsed = measurementInputSchema.parse(measurementFixture)

    expect(parsed.groups).toHaveLength(25)
    expect(parsed.groups.every(hasCompletePointCloud)).toBe(true)
    expect(parsed.groups.reduce((total, group) => total + group.points.length, 0)).toBe(102_475)
  })

  it("includes reference lines in the default plotting domain", () => {
    const domain = createMeasurementDomain(measurementSmallFixture)

    expect(domain).not.toBeNull()
    expect(domain!.minimum).toBeLessThanOrEqual(52.41)
    expect(domain!.maximum).toBeGreaterThanOrEqual(127.67)
  })

  it("expresses baseline and variant hover relationships in the input contract", () => {
    const [baseline, ...variants] = measurementFixture.groups.filter(
      (group) => group.comparison?.cohortId === "bsl-clean-01",
    )

    expect(baseline.comparison?.role).toBe("baseline")
    expect(variants.map((group) => group.comparison?.role)).toEqual(["variant", "variant"])
  })

  it("retrieves a hovered die from its precomputed group bucket index", () => {
    const domain = createMeasurementDomain(measurementSmallFixture)!
    const layout = createMeasurementLayout(800, 560, measurementSmallFixture.groups.length)
    const group = measurementSmallFixture.groups[0]
    const point = group.points[0]
    const bounds = groupBounds(0, layout)
    const x = bounds.center + stableJitter(point, 0) * Math.min(40, layout.groupWidth * 0.64)
    const y = measurementY(point.value, domain, layout)
    const index = createMeasurementHitIndex(measurementSmallFixture, domain, layout)

    expect(nearestMeasurementPoint(index, 0, x, y)?.point.id).toBe(point.id)
  })

  it("keeps 25 wafer columns readable at narrow report widths without squeezing their geometry", () => {
    for (const viewport of [680, 936, 1070]) {
      const width = measurementChartWidth(viewport, 25)
      const layout = createMeasurementLayout(width, 560, 25)
      expect(width).toBeGreaterThan(viewport)
      expect(layout.groupWidth).toBeGreaterThanOrEqual(68)
      expect(groupBounds(24, layout).right).toBeLessThanOrEqual(width - layout.right)
    }
    const width = measurementChartWidth(936, 4)
    expect(width).toBe(936)
  })

  it("keeps full physical identity visible when two Lots share a short wafer label", () => {
    expect(measurementWaferIdentity({ id: "LOT_A_01", label: "W01" })).toBe("W01 · LOT_A_01")
    expect(measurementWaferIdentity({ id: "LOT_B_01", label: "W01" })).toBe("W01 · LOT_B_01")
    expect(measurementWaferIdentity({ id: "W01", label: "W01" })).toBe("W01")
  })

  it("compacts source wafer suffixes while retaining arbitrary group labels and supplied identities", () => {
    const group = measurementLabelBoundaryFixture.groups[0]
    expect(measurementGroupLabel(group.label)).toBe("W01")
    expect(group.id).toBe("SOURCE_LOT_01")
    expect(group.label).toBe("SOURCE_LOT_01")
    expect(measurementGroupLabel("W24")).toBe("W24")
    expect(measurementGroupLabel("REFERENCE GROUP")).toBe("REFERENCE GROUP")
  })

  it("combines equal-valued reference annotations and separates nearby labels without moving evidence lines", () => {
    const input = measurementLabelBoundaryFixture
    const originalLines = structuredClone(input.referenceLines)
    const domain = createMeasurementDomain(input)!
    const layout = createMeasurementLayout(936, 560, 3)
    const labels = createMeasurementReferenceLabels(input.referenceLines, domain, layout)
    expect(labels).toHaveLength(2)
    expect(labels.find((label) => label.value === 90)?.lines.map((line) => line.label)).toEqual(["LSL", "Target"])
    expect(labels[1].labelY - labels[0].labelY).toBeGreaterThanOrEqual(18)
    for (const label of labels) {
      expect(label.anchorY).toBe(measurementY(label.value, domain, layout))
      expect(label.labelY).toBeGreaterThanOrEqual(layout.top)
      expect(label.labelY).toBeLessThan(layout.top + layout.plotHeight)
    }
    expect(input.referenceLines).toEqual(originalLines)
  })

  it("keeps clustered annotations inside the plot at both vertical edges", () => {
    const domain = { minimum: 0, maximum: 1 }
    const layout = createMeasurementLayout(936, 560, 4)
    for (const values of [[0, 0.001, 0.002], [0.998, 0.999, 1]]) {
      const lines = values.map((value, index) => ({ id: String(index), label: String(index), value, kind: "guide" as const }))
      const labels = createMeasurementReferenceLabels(lines, domain, layout)
      expect(labels[0].labelY).toBeGreaterThanOrEqual(layout.top + 14)
      expect(labels.at(-1)!.labelY).toBeLessThanOrEqual(layout.top + layout.plotHeight - 8)
      expect(labels[1].labelY - labels[0].labelY).toBeGreaterThanOrEqual(18)
      expect(labels[2].labelY - labels[1].labelY).toBeGreaterThanOrEqual(18)
    }
  })
  it("preserves per-wafer effective references and includes them in the plotting domain", () => {
    const input = measurementInputSchema.parse(measurementMixedSpecFixture)
    const original = structuredClone(input.groups.map((group) => group.referenceLines))
    const domain = createMeasurementDomain(input)!
    const layout = createMeasurementLayout(680, 560, input.groups.length)
    const labels = createMeasurementGroupReferenceLabels(input, domain, layout)
    expect(domain.minimum).toBeLessThan(0.5)
    expect(domain.maximum).toBeGreaterThan(1)
    expect(input.referenceLines).toEqual([])
    expect(labels).toHaveLength(9)
    expect(labels.filter((label) => label.groupIndex === 1).map((label) => label.value).sort()).toEqual([0.7, 0.79, 0.88])
    for (const label of labels) {
      const bounds = groupBounds(label.groupIndex, layout)
      expect(label.left).toBeGreaterThan(bounds.left)
      expect(label.right).toBeLessThan(bounds.right)
      expect(label.anchorY).toBe(measurementY(label.value, domain, layout))
    }
    expect(input.groups.map((group) => group.referenceLines)).toEqual(original)
  })

  it("keeps absent group references backward compatible and honours explicit data-only scale", () => {
    const parsed = measurementInputSchema.parse(measurementSmallFixture)
    expect(parsed.groups.every((group) => group.referenceLines === undefined)).toBe(true)
    const dataOnly = { ...measurementMixedSpecFixture, scale: { mode: "fixed" as const } }
    const domain = createMeasurementDomain(dataOnly)!
    expect(domain.minimum).toBeGreaterThan(0.7)
    expect(domain.maximum).toBeLessThan(0.88)
    expect(createMeasurementGroupReferenceLabels(parsed, createMeasurementDomain(parsed)!, createMeasurementLayout(680, 560, 3))).toEqual([])
  })

})
