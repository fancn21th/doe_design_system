import type {
  ReportCpInlineFitModel,
  ReportCpInlineFitPanel,
  ReportCpInlineInput,
} from "@/schemas/domain-component-inputs"

export function formatReportCpInlineValue(
  value: number | null | undefined,
  digits: number
) {
  return value == null ? "—" : value.toFixed(digits)
}

export function visibleReportCpInlineModels(
  models: ReportCpInlineFitModel[],
  quadraticEnabled: boolean
) {
  return models.filter(
    (model) =>
      model.status === "available" &&
      (model.kind === "linear" || quadraticEnabled)
  )
}

export function reportCpInlineThresholdValue(
  panel: ReportCpInlineFitPanel,
  spec: ReportCpInlineInput["spec"]
) {
  if (!spec) return null
  return spec[panel.thresholdKind]
}

export function reportCpInlineThresholdLabel(
  panel: ReportCpInlineFitPanel,
  spec: ReportCpInlineInput["spec"]
) {
  const value = reportCpInlineThresholdValue(panel, spec)
  const label = panel.thresholdKind.toUpperCase()
  return value == null ? `未配置 ${label}` : `${panel.thresholdRelation} ${value}`
}
