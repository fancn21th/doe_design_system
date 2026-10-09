import { reportParameterMedianFixture } from "@/components/domain/report.fixtures"
import type { ReportParameterMedianInput } from "@/schemas/domain-component-inputs"

type ReportParameterMedianScenario = {
  name: string
  input: ReportParameterMedianInput
}

export const reportParameterMedianScenarios = {
  normal: { name: "normal", input: reportParameterMedianFixture },
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
