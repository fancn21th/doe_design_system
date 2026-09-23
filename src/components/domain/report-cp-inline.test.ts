import { describe, expect, it } from "vitest"

import {
  formatReportCpInlineValue,
  reportCpInlineThresholdValue,
  visibleReportCpInlineModels,
} from "@/components/domain/report-cp-inline-model"
import { reportCpInlineScenarios } from "@/components/domain/report-cp-inline.scenarios"
import { reportCpInlineInputSchema } from "@/schemas/domain-component-inputs"

describe("ReportCpInline contract", () => {
  it("keeps every documented scenario schema-valid", () => {
    for (const scenario of Object.values(reportCpInlineScenarios)) {
      expect(() => reportCpInlineInputSchema.parse(scenario.input)).not.toThrow()
    }
  })

  it("preserves prototype precision and the baseline coverage mismatch", () => {
    const input = reportCpInlineScenarios.normal.input
    const baseline = input.rows[0]
    const split = input.rows[1]

    expect(baseline.inlineWafers).toEqual(["W01"])
    expect(baseline.cpWafers).toEqual(["W01", "W11", "W25"])
    expect(formatReportCpInlineValue(split.medianInline, 6)).toBe("0.745308")
    expect(formatReportCpInlineValue(split.meanCp, 4)).toBe("90.8915")
  })

  it("retains all four coverage statuses in the mismatch scenario", () => {
    const input = reportCpInlineScenarios.coverageMismatch.input
    const statuses = [
      ...input.baselineWaferOptions,
      ...input.splitWaferOptions,
    ].map((option) => option.coverageStatus)

    expect(new Set(statuses)).toEqual(
      new Set(["PAIRED", "INLINE_ONLY", "CP_ONLY", "NO_DATA"])
    )
  })

  it("uses the explicit gate and never promotes quadratic when disabled", () => {
    const normalPanel = reportCpInlineScenarios.normal.input.fitPanels[0]
    const gatedPanel = reportCpInlineScenarios.insufficientLevels.input.fitPanels[0]

    expect(visibleReportCpInlineModels(normalPanel.models, false).map((model) => model.kind)).toEqual(["linear"])
    expect(gatedPanel.gate).toMatchObject({
      mode: "REPEATABILITY",
      linearAllowed: false,
      quadraticAllowed: false,
    })
    expect(visibleReportCpInlineModels(gatedPanel.models, true)).toEqual([])
  })

  it("reads configured thresholds and roots as supplied evidence", () => {
    const input = reportCpInlineScenarios.configuredSpec.input
    const medianPanel = input.fitPanels.find((panel) => panel.id === "median")

    expect(medianPanel).toBeDefined()
    expect(reportCpInlineThresholdValue(medianPanel!, input.spec)).toBe(89.5)
    expect(medianPanel?.roots[0]).toMatchObject({
      model: "linear",
      threshold: "target",
      x: 0.790136,
      domainStatus: "in-domain",
    })
    expect(input.controlWindows[0].intervals[0]).toEqual({
      min: 0.768165,
      max: 0.790136,
    })
  })
})
