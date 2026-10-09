import type {
  ReportCpInlineFitInput,
  ReportCpInlineFitModel,
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
