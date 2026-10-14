import type { ReportWaferYieldCpFail } from "@/schemas/domain-component-inputs"

export type WaferYieldCpFailRow = ReportWaferYieldCpFail["wafers"][number]
type VisibleCpFail = WaferYieldCpFailRow["cpFails"][number] & { percent: number }

export function visibleCpFails(
  wafer: WaferYieldCpFailRow,
  thresholdPercent: number
) {
  return wafer.cpFails.filter(
    (fail): fail is VisibleCpFail =>
      fail.percent !== null && fail.percent > thresholdPercent
  )
}

export function visibleCpFailParameters(input: ReportWaferYieldCpFail) {
  const visibleParameters = new Set(
    input.wafers.flatMap((wafer) =>
      visibleCpFails(wafer, input.failThresholdPercent).map(
        (fail) => fail.parameter
      )
    )
  )

  return input.series
    .map((series) => series.parameter)
    .filter((parameter) => visibleParameters.has(parameter))
}

/** Membership identity owns grouping; labels are display-only. */
function waferStepGroup(wafer: WaferYieldCpFailRow) {
  const memberships = wafer.memberships ?? []
  if (memberships.length === 0) {
    return { key: JSON.stringify(["legacy", wafer.step]), step: wafer.step }
  }
  if (memberships.every((member) => member.isBaselineVariant === true)) {
    return { key: JSON.stringify(["baseline"]), step: "BSL" }
  }
  const stepKeys = [...new Set(memberships.map((member) => member.stepKey))].sort()
  return {
    key: JSON.stringify(["steps", stepKeys]),
    step: stepKeys.length === 1 ? memberships[0].step : "多 Step",
  }
}

export function groupConsecutiveWaferSteps(wafers: WaferYieldCpFailRow[]) {
  let previousKey: string | undefined
  return wafers.reduce<Array<{ step: string; startIndex: number; count: number }>>(
    (groups, wafer, index) => {
      const { key, step } = waferStepGroup(wafer)
      const previous = groups.at(-1)
      if (previous && previousKey === key) {
        previous.count += 1
      } else {
        groups.push({ step, startIndex: index, count: 1 })
      }
      previousKey = key
      return groups
    },
    []
  )
}

/** One shared layout for SVG, column labels and hit targets. */
export function waferYieldPlotGeometry(availableWidth: number, waferCount: number, compactViewport: boolean) {
  const count = Math.max(1, waferCount)
  const measured = Number.isFinite(availableWidth) && availableWidth > 0
  const width = measured
    ? compactViewport ? Math.max(availableWidth, count * 44) : availableWidth
    : Math.max(1100, count * 44)
  const columnWidth = width / count
  return { width, columnWidth, barWidth: Math.min(24, columnWidth * 0.6) }
}
