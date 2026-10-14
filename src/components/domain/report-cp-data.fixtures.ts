import { measurementSmallFixture } from "@/components/domain/measurement.fixtures"
import type { MeasurementComparisonGroup, ReportCpDataInput } from "@/schemas/domain-component-inputs"

/** Synthetic fixture for stable identity/multi-membership; not production evidence. */
const groups = measurementSmallFixture.groups.map((group, index) => ({ ...group, id: `LOT_A_${index + 1}`, label: `W0${index + 1}`, role: "neutral" as const, comparison: undefined, context: undefined }))
const member = (index: number, variant: string, baseline: boolean) => ({ waferId: groups[index].id, variantRowId: variant, variantSequence: baseline ? 1 : 2, roleLabel: baseline ? "BSL" : "Split 1", isBaselineVariant: baseline, condition: baseline ? "Reference" : "Observed split" })
const comparison = (sequence: number, split: number): MeasurementComparisonGroup => ({ id: `stage:step:${sequence}`, stepKey: `stage:step:${sequence}`, stageId: "stage", stepId: "step", stepSequence: sequence, stageLabel: "Stage A", stepLabel: "Repeated Step", label: `Stage A / Repeated Step / ${sequence}`, members: [member(0, `${sequence}:baseline`, true), member(split, `${sequence}:split`, false)], detail: { status: "ready", min: 86, max: 95, offscreenPointCount: 2, totalPointCount: 160 } })
export const reportCpDataSharedBaselineFixture: ReportCpDataInput = {
  parameterOptions: [{ label: "BVDSS", value: "BVDSS" }], selectedParameterId: "BVDSS",
  measurement: { ...measurementSmallFixture, groups, comparisonGroups: [comparison(1, 1), comparison(2, 2)] },
}
export const reportCpDataMissingCapabilityFixture: ReportCpDataInput = {
  ...reportCpDataSharedBaselineFixture,
  measurement: { ...reportCpDataSharedBaselineFixture.measurement!, groups: groups.map((group) => ({ ...group, capability: { cpk: null, cpu: null, cpl: null, status: "NO_SPEC", specSource: "SOURCE" }, points: group.points.map((point) => ({ id: point.id, x: point.x, y: point.y, value: point.value, sourceStatus: point.sourceStatus })) })) },
}
export const reportCpDataUnavailableDetailFixture: ReportCpDataInput = {
  ...reportCpDataSharedBaselineFixture,
  measurement: { ...reportCpDataSharedBaselineFixture.measurement!, comparisonGroups: [
    { ...comparison(1, 1), detail: { status: "unavailable", min: null, max: null, offscreenPointCount: 0, totalPointCount: 160, reason: "明细范围未提供" } },
  ] },
}
