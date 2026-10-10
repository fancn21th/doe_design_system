import type {
  ReportCpInlineFitInput,
  ReportCpInlineFitModel,
  ReportCpInlineFitPoint,
} from "@/schemas/domain-component-inputs"

export function formatReportCpInlineValue(
  value: number | null | undefined,
  digits = 4
) {
  if (value == null || !Number.isFinite(value)) return "—"
  const magnitude = Math.abs(value)
  if (magnitude > 0 && (magnitude < Math.max(0.0001, 10 ** -digits) || magnitude >= 1e7)) {
    return value.toExponential(digits).replace("e+", "e")
  }
  return value.toFixed(digits)
}

export function formatReportCpInlineMeasurementValue(value: number | null | undefined) {
  const magnitude = Math.abs(value ?? 0)
  if (value != null && Number.isFinite(value) && magnitude >= 0.0001 && magnitude < 0.001) return value.toExponential(7)
  return formatReportCpInlineValue(value, magnitude >= 0.0001 && magnitude < 1 ? 6 : 4)
}

export type ReportCpInlineModelVisibility = Record<
  ReportCpInlineFitModel["kind"],
  boolean
>

export function visibleReportCpInlineModels(
  models: ReportCpInlineFitModel[],
  visibility: ReportCpInlineModelVisibility
) {
  return models.filter(
    (model) => model.status === "available" && visibility[model.kind]
  )
}

export function reportCpInlineSpecEntries(spec: ReportCpInlineFitInput["spec"]) {
  return (["target", "lsl", "usl"] as const).flatMap((kind) => {
    const value = spec?.[kind]
    return value == null ? [] : [{ kind, value }]
  })
}


// Display extent only: supplied observations and visible model series remain unchanged.
// Specifications never expand the measured-scale axis.
export function reportCpInlineYDomain(
  points: Pick<ReportCpInlineFitPoint, "y">[],
  models: Pick<ReportCpInlineFitModel, "series">[]
): [number, number] {
  const values = [...points.map((point) => point.y), ...models.flatMap((model) => model.series.map((point) => point.y))].filter(Number.isFinite)
  if (values.length === 0) return [0, 1]
  const low = Math.min(...values), high = Math.max(...values)
  const padding = high > low ? (high - low) * 0.08 : Math.abs(low) * 0.05 || 1
  return [low - padding, high + padding]
}
