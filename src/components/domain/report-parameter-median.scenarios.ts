import { reportParameterMedianFixture } from "@/components/domain/report.fixtures"
import type { ReportParameterMedianInput } from "@/schemas/domain-component-inputs"

type ReportParameterMedianScenario = {
  name: string
  input: ReportParameterMedianInput
}

export const reportParameterMedianScenarios = {
  normal: { name: "normal", input: reportParameterMedianFixture },
  cpkThresholds: {
    name: "cpkThresholds",
    input: {
      ...reportParameterMedianFixture,
      waferIds: ["W01", "W02", "W03", "W04", "W05", "W06"],
      rows: [{
        ...reportParameterMedianFixture.rows![0],
        oosCount: 1, evaluableCount: 6, notEvaluableCount: 0,
        wafers: [-0.2, 1.3299999, 1.33, 1.6699999, 1.67, null].map((cpk, index) => ({
          waferId: `W0${index + 1}`, value: 1, cpk, tone: "neutral",
          oos: index === 0, oosStatus: index === 0 ? "OUT_OF_SPEC" : "IN_SPEC", failLinked: index === 4,
        })),
      }],
    },
  },
  unavailable: {
    name: "unavailable",
    input: { ...reportParameterMedianFixture, oosResultCount: 0, rows: [reportParameterMedianFixture.rows![2]] },
  },
  sourceCapability: {
    name: "sourceCapability",
    input: {
      ...reportParameterMedianFixture,
      rows: (reportParameterMedianFixture.rows ?? []).map((row) => ({
        ...row,
        wafers: row.wafers.map((cell, index) => ({
          ...cell,
          capability: { cpk: index === 0 ? null : 1.42, status: index === 0 ? "ZERO_SIGMA" : "AVAILABLE", specSource: "SOURCE", lsl: null, usl: 9e-8, mean: 6e-8, sampleSigma: index === 0 ? 0 : 7e-9, n: 4099 },
        })),
      })),
    },
  },
  empty: { name: "empty", input: { rows: [] } },
} satisfies Record<string, ReportParameterMedianScenario>
