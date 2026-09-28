import { describe, expect, it } from "vitest"

import { reportCpInlineCandidatesScenarios } from "@/components/domain/report-cp-inline-candidates.scenarios"
import { reportCpInlineCandidatesInputSchema } from "@/schemas/domain-component-inputs"

describe("ReportCpInlineCandidates contract", () => {
  it("keeps every scenario schema-valid", () => {
    for (const scenario of Object.values(reportCpInlineCandidatesScenarios)) {
      expect(() => reportCpInlineCandidatesInputSchema.parse(scenario.input)).not.toThrow()
    }
  })

  it("preserves the supplied Backend candidate order", () => {
    expect(
      reportCpInlineCandidatesScenarios.normal.input.items.map((item) => item.cpParameter)
    ).toEqual(["kelvinS", "VGSTX3", "VGSTX2"])
  })

  it("keeps missing metrics missing instead of coercing them to zero", () => {
    expect(reportCpInlineCandidatesScenarios.normal.input.items[1].cpResponse).toBeNull()
  })
})
