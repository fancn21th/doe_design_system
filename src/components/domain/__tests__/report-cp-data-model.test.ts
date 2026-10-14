import { describe, expect, it } from "vitest"
import { clampMeasurementZoom, comparisonDetailInput, resolveMeasurementComparison } from "@/components/domain/report-cp-data-model"
import { reportCpDataSharedBaselineFixture, reportCpDataMissingCapabilityFixture, reportCpDataUnavailableDetailFixture } from "@/components/domain/report-cp-data.fixtures"
import { createMeasurementDomain } from "@/components/domain/measurement-model"
import { measurementInputSchema } from "@/schemas/domain-component-inputs"

const input = measurementInputSchema.parse(reportCpDataSharedBaselineFixture.measurement)
describe("CP Data local group inspection", () => {
  it("requires explicit context for shared baseline and uses stable Step sequence identities", () => {
    expect(resolveMeasurementComparison(input, "LOT_A_1")).toBeNull()
    expect(resolveMeasurementComparison(input, "LOT_A_1", "stage:step:2")?.stepSequence).toBe(2)
    expect(resolveMeasurementComparison(input, "LOT_A_2", "stage:step:2")?.stepSequence).toBe(1)
    expect(resolveMeasurementComparison(input, "unknown")).toBeNull()
  })
  it("resolves member refs without duplicating physical cloud and preserves every point and statistic", () => {
    const detail = comparisonDetailInput(input, input.comparisonGroups![1])!
    expect(input.groups).toHaveLength(3)
    expect(detail.groups.map((group) => group.id)).toEqual(["LOT_A_1", "LOT_A_3"])
    expect(detail.groups[0].points).toBe(input.groups[0].points)
    expect(detail.groups[0].summary).toBe(input.groups[0].summary)
    expect(detail.groups.map((group) => group.role)).toEqual(["baseline", "experiment"])
    expect(detail.groups[1].context?.sequence).toBe("2")
    expect(createMeasurementDomain(detail)).toEqual({ minimum: 86, maximum: 95 })
    expect(detail.comparisonGroups![0].detail.offscreenPointCount).toBe(2)
  })
  it("retains missing capabilities and leaves unavailable detail honest", () => {
    const missing = measurementInputSchema.parse(reportCpDataMissingCapabilityFixture.measurement)
    expect(missing.groups[0].capability).toMatchObject({ cpk: null, cpu: null, cpl: null, status: "NO_SPEC" })
    expect(missing.groups[0].points[0].finalBin).toBeUndefined()
    const unavailable = measurementInputSchema.parse(reportCpDataUnavailableDetailFixture.measurement)
    expect(comparisonDetailInput(unavailable, unavailable.comparisonGroups![0])).toBeNull()
  })
  it("keeps backend roster members without measurements and ignores labels as identity", () => {
    const group = { ...input.comparisonGroups![0], members: [...input.comparisonGroups![0].members, { ...input.comparisonGroups![0].members[1], waferId: "MISSING_CP" }] }
    const detail = comparisonDetailInput(input, group)!
    expect(detail.groups).toHaveLength(2)
    expect(detail.comparisonGroups![0].members).toHaveLength(3)
  })
  it("clamps canvas dimensions to prototype bounds", () => {
    expect(clampMeasurementZoom(0)).toBe(0.75)
    expect(clampMeasurementZoom(4)).toBe(3)
    expect(clampMeasurementZoom(1)).toBe(1)
  })
})
