import { z } from "zod"

export const experimentInputSchema = z.object({})
export const lotInputSchema = z.object({})
export const stepsInputSchema = z.object({})
export const runCardInputSchema = z.object({})
export const waferInputSchema = z.object({})
export const waferDefectInputSchema = z.object({})
export const runCardHistoryInputSchema = z.object({})
export const historyInputSchema = z.object({})

export type ExperimentInput = z.infer<typeof experimentInputSchema>
export type LotInput = z.infer<typeof lotInputSchema>
export type StepsInput = z.infer<typeof stepsInputSchema>
export type RunCardInput = z.infer<typeof runCardInputSchema>
export type WaferInput = z.infer<typeof waferInputSchema>
export type WaferDefectInput = z.infer<typeof waferDefectInputSchema>
export type RunCardHistoryInput = z.infer<typeof runCardHistoryInputSchema>
export type HistoryInput = z.infer<typeof historyInputSchema>
