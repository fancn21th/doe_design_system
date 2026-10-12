import type { SplitMatrixDraft, SplitMatrixLot } from "@/schemas/split-matrix-inputs"

export const splitMatrixLotFixture: SplitMatrixLot = {
  wafers: [13, 14, 15, 16].map((slot) => ({ waferId: `AE00285#${slot}`, waferNo: String(slot) })),
  steps: [{ id: "flow-1", stageId: "WAFER-START", stage: "WAFER-START", stepId: "S-WFST-N-01", step: "S-WFST-N-01", stepSequence: 1, stepSeq: "000100.1.000100", recipeIds: ["RCP-01"] }],
}

export const splitMatrixDraftFixture: SplitMatrixDraft = {
  versionNo: 1,
  rowVersion: 1,
  steps: [{
    stageId: "WAFER-START", stageName: "WAFER-START", stepId: "S-WFST-N-01", stepName: "S-WFST-N-01",
    flowOrder: 1, stepSeq: "000100.1.000100",
    variants: [
      { variantSequence: 1, variantType: "BASELINE", conditionLabel: "Baseline", recipeId: "RCP-01", waferIds: ["AE00285#13"] },
      { variantSequence: 2, variantType: "VARIANT", conditionLabel: "Low power", recipeId: "RCP-01", waferIds: ["AE00285#14"] },
    ],
  }],
}
