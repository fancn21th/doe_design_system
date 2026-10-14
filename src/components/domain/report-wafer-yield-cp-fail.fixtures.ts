import type { ReportWaferYieldCpFail } from "@/schemas/domain-component-inputs"

// Synthetic display fixture: a baseline shared by two Steps, one point per wafer.
const member = (stepKey: string, step: string, baseline: boolean) => ({
  stepKey, step, stageId: "demo-stage", stepId: stepKey, stepSequence: 1,
  stage: "Demo", seq: "1", variantRowId: `${stepKey}-${baseline ? "bsl" : "split"}`,
  variantSequence: baseline ? 0 : 1, roleLabel: baseline ? "BSL" : "split-1",
  isBaselineVariant: baseline,
})
export const reportWaferYieldDynamicFixture: ReportWaferYieldCpFail = {
  title: "Wafer Yield & CP Fail Analysis", failThresholdPercent: 2, series: [],
  wafers: [
    { waferId: "W01", step: "TR CD", condition: "BASELINE", yield: 99.63, cpFails: [],
      memberships: [member("step-a", "TR CD", true), member("step-b", "TR Depth", true)] },
    { waferId: "W02", step: "TR CD", condition: "0.75um", yield: 99.71, cpFails: [],
      memberships: [member("step-a", "TR CD", false)] },
    { waferId: "W04", step: "TR Depth", condition: "4.5um", yield: 99.90, cpFails: [],
      memberships: [member("step-b", "TR Depth", false)] },
  ],
}
