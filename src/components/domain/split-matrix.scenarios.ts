import { splitMatrixDraftFixture, splitMatrixLotFixture } from "@/components/domain/split-matrix.fixtures"

export const splitMatrixScenarios = {
  lotDraft: { name: "Lot draft", lot: splitMatrixLotFixture, draft: splitMatrixDraftFixture },
  empty: { name: "Empty", lot: splitMatrixLotFixture, draft: { ...splitMatrixDraftFixture, steps: [] } },
  templateReadonly: {
    name: "Template readonly",
    lot: { ...splitMatrixLotFixture, wafers: [] },
    draft: splitMatrixDraftFixture,
    templateSlots: [[[1, 13], [25]]],
    readOnly: true,
  },
  released: {
    name: "Released step",
    lot: splitMatrixLotFixture,
    draft: { ...splitMatrixDraftFixture, steps: splitMatrixDraftFixture.steps.map((step) => ({ ...step, splitStepId: "split-1" })) },
    lockedStepIds: ["split-1"],
  },
}
