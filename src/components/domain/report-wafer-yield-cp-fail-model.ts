import type { ReportWaferYieldCpFail } from "@/schemas/domain-component-inputs"

export type WaferYieldCpFailRow = ReportWaferYieldCpFail["wafers"][number]

export function visibleCpFails(
  wafer: WaferYieldCpFailRow,
  thresholdPercent: number
) {
  return wafer.cpFails.filter((fail) => fail.percent > thresholdPercent)
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
