import { z } from "zod"

export const splitMatrixWaferSchema = z.object({
  waferId: z.string(),
  waferNo: z.string().optional(),
})

export const splitMatrixFlowStepSchema = z.object({
  id: z.string(),
  stageId: z.string(),
  stage: z.string(),
  stepId: z.string(),
  step: z.string(),
  stepSequence: z.number(),
  stepSeq: z.string(),
  recipeIds: z.array(z.string()).optional(),
})

export const splitMatrixLotSchema = z.object({
  wafers: z.array(splitMatrixWaferSchema),
  steps: z.array(splitMatrixFlowStepSchema),
})

export const splitMatrixVariantSchema = z.object({
  variantId: z.string().optional(),
  variantSequence: z.number().int(),
  variantType: z.enum(["BASELINE", "VARIANT"]),
  conditionLabel: z.string().optional(),
  recipeId: z.string().optional(),
  recipeName: z.string().optional(),
  waferIds: z.array(z.string()),
})

export const splitMatrixStepSchema = z.object({
  splitStepId: z.string().optional(),
  stageId: z.string(),
  stageName: z.string(),
  stepId: z.string(),
  stepName: z.string(),
  flowOrder: z.number(),
  stepSeq: z.string(),
  qtime: z.object({ value: z.number(), unit: z.enum(["MINUTES", "HOURS"]) }).nullable().optional(),
  edcSpecEnabled: z.boolean().optional(),
  variants: z.array(splitMatrixVariantSchema),
})

export const splitMatrixDraftSchema = z.object({
  splitVersionId: z.string().optional(),
  versionNo: z.number(),
  rowVersion: z.number(),
  splitStatus: z.enum(["DRAFT", "FROZEN"]).optional(),
  readOnly: z.boolean().optional(),
  steps: z.array(splitMatrixStepSchema),
})

export type SplitMatrixLot = z.infer<typeof splitMatrixLotSchema>
export type SplitMatrixDraft = z.infer<typeof splitMatrixDraftSchema>
export type SplitMatrixStep = z.infer<typeof splitMatrixStepSchema>
