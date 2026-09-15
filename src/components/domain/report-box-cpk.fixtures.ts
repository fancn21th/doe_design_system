import type { ReportBoxCpkInput } from "@/schemas/domain-component-inputs"

export const reportBoxCpkFixture: ReportBoxCpkInput = {
  status: "ready", title: "Box & Cpk", subtitle: "Backend-owned distribution and evidence.", sourceLabel: "Snapshot evidence",
  selectedParameterId: "BVDSS1", unit: "V",
  baseline: { coverageLabel: "Baseline coverage · 2/2", mean: 90.12, sampleSigma: 0.25, cpk: 1.33, mockSpecLabel: "Mock SPEC · LSL 85 · USL 95" },
  abnormalities: [{ waferId: "AE01590_03", status: "ABNORMAL", reasons: ["OOS"] }],
  yieldImpacts: [{ waferId: "AE01590_03", impactType: "ASSOCIATED", limitation: "Association is not causality." }],
  narrative: { text: "Deterministic evidence is available for review.", limitation: "No causal conclusion is asserted." },
}
