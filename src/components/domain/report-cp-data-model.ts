import type { MeasurementComparisonGroup, MeasurementInput } from "@/schemas/domain-component-inputs"

export { resolveMeasurementComparison } from "@/components/domain/measurement-model"

/** Resolve roster references without duplicating physical measurements or calculating statistics. */
export function comparisonDetailInput(input: MeasurementInput, comparison: MeasurementComparisonGroup): MeasurementInput | null {
  const { detail } = comparison
  if (detail.status !== "ready" || detail.min === null || detail.max === null || detail.min >= detail.max) return null
  const groups = comparison.members.flatMap((member) => {
    const wafer = input.groups.find((group) => group.id === member.waferId)
    return wafer ? [{ ...wafer, role: member.isBaselineVariant ? "baseline" as const : "experiment" as const,
      context: { stage: comparison.stageLabel, step: comparison.stepLabel, sequence: String(comparison.stepSequence), condition: member.condition, roleLabel: member.roleLabel },
      comparison: { cohortId: comparison.id, role: member.isBaselineVariant ? "baseline" as const : "variant" as const },
    }] : []
  })
  return { ...input, title: `${comparison.label} · BSL & Split Detail`, subtitle: undefined, groups, comparisonGroups: [comparison],
    scale: { mode: "fixed", min: detail.min, max: detail.max } }
}

export function clampMeasurementZoom(value: number): number { return Math.max(0.75, Math.min(3, value)) }
