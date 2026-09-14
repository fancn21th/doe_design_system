import { describe, expect, it } from "vitest"

import {
  createMeasurementDomain,
  createMeasurementHitIndex,
  createMeasurementLayout,
  groupBounds,
  hasCompletePointCloud,
  measurementY,
  nearestMeasurementPoint,
  stableJitter,
} from "@/components/domain/measurement-model"
import { measurementFixture, measurementSmallFixture } from "@/components/domain/measurement.fixtures"
import { measurementInputSchema } from "@/schemas/domain-component-inputs"

describe("Measurement rendering model", () => {
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
})
