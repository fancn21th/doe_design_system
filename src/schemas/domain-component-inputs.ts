import { z } from "zod"

export const experimentInputSchema = z.object({})
export const lotInputSchema = z.object({})
export const stepAssignmentSchema = z.enum(["B", "V", "↔", "E"])
export const stepRowSchema = z.object({
  id: z.string(),
  stage: z.string(),
  step: z.string(),
  seq: z.string(),
  baseline: z.boolean(),
  condition: z.string(),
  factor: z.string(),
  recipe: z.string(),
  recipeOptions: z.array(z.string()).default([]),
  assignments: z.array(stepAssignmentSchema),
  editable: z.boolean().default(false),
})
export const stepCandidateSchema = z.object({
  id: z.string(),
  stage: z.string(),
  step: z.string(),
  seq: z.string(),
  recipeOptions: z.array(z.string()),
})
export const stepsInputSchema = z.object({
  rows: z.array(stepRowSchema).optional(),
  candidates: z.array(stepCandidateSchema).optional(),
  waferCount: z.number().int().positive().optional(),
})
export const runCardInputSchema = z.object({})
export const waferInputSchema = z.object({})
export const waferDefectInputSchema = z.object({})
export const runCardHistoryInputSchema = z.object({})
export const historyInputSchema = z.object({})

export type ExperimentInput = z.infer<typeof experimentInputSchema>
export type LotInput = z.infer<typeof lotInputSchema>
export type StepAssignment = z.infer<typeof stepAssignmentSchema>
export type StepRow = z.infer<typeof stepRowSchema>
export type StepCandidate = z.infer<typeof stepCandidateSchema>
export type StepsInput = z.infer<typeof stepsInputSchema>
export type RunCardInput = z.infer<typeof runCardInputSchema>
export type WaferInput = z.infer<typeof waferInputSchema>
export type WaferDefectInput = z.infer<typeof waferDefectInputSchema>
export type RunCardHistoryInput = z.infer<typeof runCardHistoryInputSchema>
export type HistoryInput = z.infer<typeof historyInputSchema>
