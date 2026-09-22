import { describe, expect, it } from "vitest"

import {
  groupConsecutiveWaferSteps,
  visibleCpFailParameters,
  visibleCpFails,
} from "@/components/domain/report-wafer-yield-cp-fail-model"
import type { ReportWaferYieldCpFail } from "@/schemas/domain-component-inputs"

const input: ReportWaferYieldCpFail = {
  title: "Wafer Yield & CP Fail Analysis",
  failThresholdPercent: 2,
  series: [
    { parameter: "VGSTX1" },
    { parameter: "IGSSP1" },
    { parameter: "IGSSPSC" },
  ],
  wafers: [
    {
      waferId: "W01",
      step: "BSL",
      condition: "BSL",
      yield: 99.63,
      cpFails: [
        { parameter: "VGSTX1", failedDies: 82, percent: 2 },
      ],
    },
    {
      waferId: "W10",
      step: "LOX",
      condition: "4200A",
      yield: 62.43,
      cpFails: [
        { parameter: "VGSTX1", failedDies: 1005, percent: 24.52 },
      ],
    },
    {
      waferId: "W12",
      step: "LOX",
      condition: "1.08um",
      yield: 23.69,
      cpFails: [
        { parameter: "IGSSP1", failedDies: 2996, percent: 73.09 },
        { parameter: "IGSSPSC", failedDies: 97, percent: 2.37 },
      ],
    },
  ],
}

describe("report wafer yield and CP fail model", () => {
  it("uses a strict greater-than threshold", () => {
    expect(visibleCpFails(input.wafers[0], 2)).toEqual([])
    expect(visibleCpFails(input.wafers[1], 2)).toHaveLength(1)
  })

  it("keeps visible parameter legend order from the input series", () => {
    expect(visibleCpFailParameters(input)).toEqual([
      "VGSTX1",
      "IGSSP1",
      "IGSSPSC",
    ])
  })

  it("groups only consecutive wafers with the same step", () => {
    expect(groupConsecutiveWaferSteps(input.wafers)).toEqual([
      { step: "BSL", startIndex: 0, count: 1 },
      { step: "LOX", startIndex: 1, count: 2 },
    ])
  })
})
