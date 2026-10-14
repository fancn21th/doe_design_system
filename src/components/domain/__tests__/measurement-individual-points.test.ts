import { describe, expect, it } from "vitest"
import { createMeasurementDomain, measurementOutsideReferences, createMeasurementHitIndex, createMeasurementLayout, groupBounds, measurementPointOffsets, measurementY, nearestMeasurementPoint, stableJitter } from "@/components/domain/measurement-model"
import { measurementSmallFixture } from "@/components/domain/measurement.fixtures"

const points = Array.from({ length: 13 }, (_, index) => ({ id: `sample-${index}`, x: index, y: 0.9916, value: 0.9916, sourceStatus: "PHYSICAL_VALID" as const }))

describe("individual measurement point presentation", () => {
  it("spreads equal measurements deterministically without moving their values or losing hover identity", () => {
    const input = { ...measurementSmallFixture, groups: [{ ...measurementSmallFixture.groups[0], points }] }
    const snapshot = JSON.stringify(input)
    const domain = { minimum: 0.98, maximum: 1.01 }
    const layout = createMeasurementLayout(800, 560, 1)
    const hitIndex = createMeasurementHitIndex(input, domain, layout, "individual")
    const positioned = [...hitIndex.values()].flat()
    expect(positioned).toHaveLength(13)
    expect(new Set(positioned.map(({ x }) => x)).size).toBe(13)
    for (const item of positioned) {
      expect(item.y).toBe(measurementY(item.point.value, domain, layout))
      expect(nearestMeasurementPoint(hitIndex, 0, item.x, item.y)?.point).toBe(item.point)
    }
    expect(measurementPointOffsets(points, 676, "individual")).toEqual(measurementPointOffsets(points, 676, "individual"))
    expect(JSON.stringify(input)).toBe(snapshot)
  })
  it("keeps sparse, outlying, negative and zero values intact and inside their wafer column at narrow widths", () => {
    const input = { ...measurementSmallFixture, groups: [{ ...measurementSmallFixture.groups[0], points: points.map((point, index) => ({ ...point, value: index === 0 ? -350 : index === 1 ? 350 : 0 })) }] }
    const layout = createMeasurementLayout(192, 560, 1)
    const bounds = groupBounds(0, layout)
    const positioned = [...createMeasurementHitIndex(input, { minimum: -400, maximum: 400 }, layout, "individual").values()].flat()
    expect(positioned.map(({ point }) => point.value).sort((a, b) => a - b)).toEqual(input.groups[0].points.map(point => point.value).sort((a, b) => a - b))
    for (const { x } of positioned) { expect(x - 4).toBeGreaterThan(bounds.left); expect(x + 4).toBeLessThan(bounds.right) }
  })
  it("keeps a single raw point separate from the center summary marker, and handles empty samples", () => {
    expect(Math.abs(measurementPointOffsets(points.slice(0, 1), 68, "individual")[0])).toBeGreaterThanOrEqual(9)
    expect(measurementPointOffsets([], 68, "individual")).toEqual([])
  })
  it("preserves the default CP density layout exactly", () => {
    expect(measurementPointOffsets(points, 200)).toEqual(points.map((point, index) => stableJitter(point, index) * 40))
    expect(measurementPointOffsets(points, 30)).toEqual(points.map((point, index) => stableJitter(point, index) * (30 * 0.64)))
  })
  it("uses the same fixed-domain clipping for paint and hover", () => {
    const input = { ...measurementSmallFixture, groups: [{ ...measurementSmallFixture.groups[0], points: [points[0], { ...points[1], value: 5 }] }] }
    const visible = [...createMeasurementHitIndex(input, { minimum: 0, maximum: 1 }, createMeasurementLayout(800, 560, 1), "individual").values()].flat()
    expect(visible).toHaveLength(1)
    expect(visible[0].point).toBe(points[0])
  })
})


describe("Inline focused range", () => {
  it("keeps every measurement and sigma endpoint in range while exposing distant shared and wafer specifications", () => {
    const reference = measurementSmallFixture.referenceLines[0]
    const input = { ...measurementSmallFixture, scale: { mode: "data-only" as const },
      referenceLines: [{ ...reference, id: "upper", label: "USL", value: 50000 }],
      groups: [{ ...measurementSmallFixture.groups[0], points,
        summary: { ...measurementSmallFixture.groups[0].summary, mean: 0.99, sampleSigma: 0.01, min: 0.98, max: 1, whiskerLow: 0.98, whiskerHigh: 1 },
        referenceLines: [{ ...reference, id: "lower", label: "LSL", value: -1000 }] }] }
    const domain = createMeasurementDomain(input)!
    expect(domain.minimum).toBeLessThan(0.96)
    expect(domain.maximum).toBeGreaterThan(1.02)
    expect(domain.minimum).toBeGreaterThan(0)
    expect(domain.maximum).toBeLessThan(2)
    expect([...createMeasurementHitIndex(input, domain, createMeasurementLayout(800, 560, 1), "individual").values()].flat()).toHaveLength(13)
    const outside = measurementOutsideReferences(input, domain)
    expect(outside.map(line => [line.label, line.value, line.direction])).toEqual([["USL", 50000, "above"], ["LSL", -1000, "below"]])
    expect(outside[1].groupLabel).toContain(input.groups[0].label)
  })
})
