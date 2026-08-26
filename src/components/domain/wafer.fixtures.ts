import type {
  WaferCapabilityParameter,
  WaferInput,
} from "@/schemas/domain-component-inputs"

function rawValues(mean: number, sigma: number) {
  return Array.from({ length: 9 }, (_, index) => {
    const offset = (((index * 7) % 9) - 4) * sigma / 8
    return Number((mean + offset).toFixed(3))
  })
}

export const waferCapabilityParametersFixture: WaferCapabilityParameter[] = [
  {
    id: "AML-SN080T24-TR-PH-ADI-69",
    observedWaferCount: 2,
    rawPointCount: 18,
    sampledThrough: "2026-04-19 21:11:53",
    spec: {
      lsl: 3.6,
      target: 4.0,
      usl: 4.4,
      cpk: 10.422,
    },
    variants: [
      {
        id: "S007-V01",
        role: "Reference Candidate · Baseline",
        waferId: "W24",
        toolId: "ALILI01",
        tone: "reference",
      },
      {
        id: "S007-V02",
        role: "Variant Candidate",
        waferId: "W01",
        toolId: "ALILI01",
        tone: "variant",
      },
    ],
    waferStats: [
      {
        waferId: "W01",
        cpk: 10.422,
        mean: 4.01,
        sigma: 0.035,
        rawValues: rawValues(4.01, 0.035),
      },
      {
        waferId: "W24",
        cpk: 11.722,
        mean: 4.0,
        sigma: 0.031,
        rawValues: rawValues(4.0, 0.031),
      },
    ],
  },
  {
    id: "AML-SN080T24-SG1-PH-OLX-69",
    observedWaferCount: 2,
    rawPointCount: 18,
    sampledThrough: "2026-04-19 21:11:53",
    spec: {
      lsl: 3.6,
      target: 4.0,
      usl: 4.4,
      cpk: 8.906,
    },
    variants: [
      {
        id: "S007-V01",
        role: "Reference Candidate · Baseline",
        waferId: "W24",
        toolId: "ALILI01",
        tone: "reference",
      },
      {
        id: "S007-V02",
        role: "Variant Candidate",
        waferId: "W01",
        toolId: "ALILI01",
        tone: "variant",
      },
    ],
    waferStats: [
      {
        waferId: "W01",
        cpk: 8.906,
        mean: 3.96,
        sigma: 0.042,
        rawValues: rawValues(3.96, 0.042),
      },
      {
        waferId: "W24",
        cpk: 10.206,
        mean: 4.04,
        sigma: 0.038,
        rawValues: rawValues(4.04, 0.038),
      },
    ],
  },
  {
    id: "AML-SN080T24-SG1-PH-OLY-69",
    observedWaferCount: 2,
    rawPointCount: 18,
    sampledThrough: "2026-04-19 21:11:53",
    spec: {
      lsl: 3.6,
      target: 4.0,
      usl: 4.4,
      cpk: 7.884,
    },
    variants: [
      {
        id: "S007-V01",
        role: "Reference Candidate · Baseline",
        waferId: "W24",
        toolId: "ALILI01",
        tone: "reference",
      },
      {
        id: "S007-V02",
        role: "Variant Candidate",
        waferId: "W01",
        toolId: "ALILI01",
        tone: "variant",
      },
    ],
    waferStats: [
      {
        waferId: "W01",
        cpk: 7.884,
        mean: 4.03,
        sigma: 0.048,
        rawValues: rawValues(4.03, 0.048),
      },
      {
        waferId: "W24",
        cpk: 9.184,
        mean: 3.98,
        sigma: 0.041,
        rawValues: rawValues(3.98, 0.041),
      },
    ],
  },
  {
    id: "AML-SN080T24-SG1-PH-RVX-69",
    observedWaferCount: 2,
    rawPointCount: 72,
    sampledThrough: "2026-04-19 21:11:53",
    spec: {
      lsl: 3.6,
      target: 4.0,
      usl: 4.4,
      cpk: 5.216,
    },
    variants: [
      {
        id: "S007-V01",
        role: "Reference Candidate · Baseline",
        waferId: "W24",
        toolId: "ALILI01",
        tone: "reference",
      },
      {
        id: "S007-V02",
        role: "Variant Candidate",
        waferId: "W01",
        toolId: "ALILI01",
        tone: "variant",
      },
    ],
    waferStats: [
      {
        waferId: "W01",
        cpk: 5.216,
        mean: 3.92,
        sigma: 0.061,
        rawValues: rawValues(3.92, 0.061),
      },
      {
        waferId: "W24",
        cpk: 6.516,
        mean: 4.08,
        sigma: 0.057,
        rawValues: rawValues(4.08, 0.057),
      },
    ],
  },
  {
    id: "AML-SN080T24-SG1-PH-RVY-69",
    observedWaferCount: 2,
    rawPointCount: 72,
    sampledThrough: "2026-04-19 21:11:53",
    spec: {
      lsl: 3.6,
      target: 4.0,
      usl: 4.4,
      cpk: 6.731,
    },
    variants: [
      {
        id: "S007-V01",
        role: "Reference Candidate · Baseline",
        waferId: "W24",
        toolId: "ALILI01",
        tone: "reference",
      },
      {
        id: "S007-V02",
        role: "Variant Candidate",
        waferId: "W01",
        toolId: "ALILI01",
        tone: "variant",
      },
    ],
    waferStats: [
      {
        waferId: "W01",
        cpk: 6.731,
        mean: 4.06,
        sigma: 0.052,
        rawValues: rawValues(4.06, 0.052),
      },
      {
        waferId: "W24",
        cpk: 8.031,
        mean: 3.95,
        sigma: 0.049,
        rawValues: rawValues(3.95, 0.049),
      },
    ],
  },
]

export const waferFixture: Required<WaferInput> = {
  title: "Process Capability by Wafer",
  subtitle: "按Wafer比较原始测量值、Mean ± 3σ、规格窗口与Cpk",
  sourceLabel: "SPC PARAMETER",
  parameters: waferCapabilityParametersFixture,
  selectedParameterId: "AML-SN080T24-TR-PH-ADI-69",
  readonly: true,
}

export const waferLargeDataFixture: Required<WaferInput> = {
  ...waferFixture,
  parameters: [
    ...waferCapabilityParametersFixture,
    ...Array.from({ length: 10 }, (_, index) => ({
      ...waferCapabilityParametersFixture[index % waferCapabilityParametersFixture.length],
      id: `AML-SN080T24-LARGE-${String(index + 1).padStart(2, "0")}`,
    })),
  ],
}

export const waferEmptyFixture: Required<WaferInput> = {
  ...waferFixture,
  parameters: [],
  selectedParameterId: "",
}
