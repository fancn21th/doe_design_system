import {
  reportSplitTableFixture,
  reportWaferYieldCpFailFixture,
} from "@/components/domain/report.fixtures"
import type { ReportSplitTableInput } from "@/schemas/domain-component-inputs"

type ReportSplitTableScenario = { name: string; input: ReportSplitTableInput }

const rows = reportSplitTableFixture.rows ?? []

export const reportSplitTableScenarios = {
  normal: {
    name: "normal",
    input: {
      ...reportSplitTableFixture,
      yieldCpFailAnalysis: reportWaferYieldCpFailFixture,
    },
  },
  baselineAfterSplits: {
    name: "baseline-after-splits",
    input: {
      ...reportSplitTableFixture,
      yieldCpFailAnalysis: reportWaferYieldCpFailFixture,
      rows:
        rows.length >= 3
          ? [rows[1], rows[2], rows[0], ...rows.slice(3)]
          : rows,
    },
  },
  empty: { name: "empty", input: { rows: [] } },
} satisfies Record<string, ReportSplitTableScenario>
