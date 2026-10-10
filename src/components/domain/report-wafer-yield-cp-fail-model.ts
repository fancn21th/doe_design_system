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

export function groupConsecutiveWaferSteps(
  wafers: WaferYieldCpFailRow[]
) {
  return wafers.reduce<
    Array<{ step: string; startIndex: number; count: number }>
  >((groups, wafer, index) => {
    const previous = groups.at(-1)
    if (previous?.step === wafer.step) {
      previous.count += 1
      return groups
    }

    groups.push({ step: wafer.step, startIndex: index, count: 1 })
    return groups
  }, [])
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
