import type { SplitMatrixDraft } from "@/schemas/split-matrix-inputs"

/** Remove one configuration row without changing its siblings or their assignments. */
export function removeSplitRow(draft: SplitMatrixDraft, stepIndex: number, variantIndex: number): SplitMatrixDraft {
  const selectedStep = draft.steps[stepIndex]
  if (!selectedStep?.variants[variantIndex]) return draft
  const variants = selectedStep.variants.filter((_, index) => index !== variantIndex)
  return {
    ...draft,
    steps: draft.steps.flatMap((step, index) => index !== stepIndex ? [step] : variants.length ? [{ ...step, variants }] : []),
  }
}
