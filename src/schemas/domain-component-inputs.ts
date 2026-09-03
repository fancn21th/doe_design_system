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
export const runCardReleaseStepSchema = z.object({
  id: z.string(),
  stage: z.string(),
  name: z.string(),
  seq: z.string(),
  detail: z.string(),
})
export const runCardGroupSchema = z.object({
  id: z.string(),
  stepIds: z.array(z.string()),
  collapsed: z.boolean().default(false),
})
export const runCardInputSchema = z.object({
  steps: z.array(runCardReleaseStepSchema).optional(),
  runCards: z.array(runCardGroupSchema).optional(),
  releasedStepIds: z.array(z.string()).optional(),
  selectedStepIds: z.array(z.string()).optional(),
})
export const runCardEventStatusSchema = z.enum([
  "通过",
  "OPEN",
  "已接受",
  "运行中",
  "TIMEOUT",
])
export const runCardEventSchema = z.object({
  runCardId: z.string(),
  time: z.string(),
  step: z.string(),
  status: runCardEventStatusSchema,
  description: z.string(),
  operator: z.string(),
})
export const runCardHistoryInputSchema = z.object({
  events: z.array(runCardEventSchema).optional(),
})
export const stepsInputSchema = z.object({
  rows: z.array(stepRowSchema).optional(),
  candidates: z.array(stepCandidateSchema).optional(),
  waferCount: z.number().int().positive().optional(),
  release: runCardInputSchema.optional(),
  releaseHistory: runCardHistoryInputSchema.optional(),
})
export const waferCapabilitySpecSchema = z.object({
  lsl: z.number(),
  target: z.number(),
  usl: z.number(),
  cpk: z.number(),
})
export const waferCapabilityVariantSchema = z.object({
  id: z.string(),
  role: z.string(),
  waferId: z.string(),
  toolId: z.string(),
  tone: z.enum(["reference", "variant"]).default("variant"),
})
export const waferCapabilityStatSchema = z.object({
  waferId: z.string(),
  cpk: z.number(),
  mean: z.number(),
  sigma: z.number(),
  rawValues: z.array(z.number()).default([]),
})
export const waferCapabilityParameterSchema = z.object({
  id: z.string(),
  observedWaferCount: z.number().int().nonnegative(),
  rawPointCount: z.number().int().nonnegative(),
  sampledThrough: z.string(),
  spec: waferCapabilitySpecSchema,
  variants: z.array(waferCapabilityVariantSchema),
  waferStats: z.array(waferCapabilityStatSchema),
})
export const waferInputSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  sourceLabel: z.string().optional(),
  parameters: z.array(waferCapabilityParameterSchema).optional(),
  selectedParameterId: z.string().optional(),
  readonly: z.boolean().optional(),
})
export const waferMapDieSchema = z.object({
  id: z.string(),
  x: z.number().finite(),
  y: z.number().finite(),
})
export const waferMapBoundsSchema = z.object({
  minX: z.number().finite(),
  maxX: z.number().finite(),
  minY: z.number().finite(),
  maxY: z.number().finite(),
})
export const waferMapDataSchema = z.object({
  id: z.string(),
  dies: z.array(waferMapDieSchema),
  bounds: waferMapBoundsSchema,
})
export const waferDefectSourceKindSchema = z.enum([
  "spc",
  "dms",
  "illustrative",
  "unknown",
])
export const waferDefectEvidenceSchema = z.object({
  id: z.string(),
  type: z.string(),
  typeId: z.string().optional(),
  image: z
    .object({
      src: z.string().optional(),
      alt: z.string(),
      source: waferDefectSourceKindSchema,
    })
    .optional(),
})
export const waferDefectPointSchema = z.object({
  id: z.string(),
  coordinate: z
    .object({
      x: z.number(),
      y: z.number(),
      source: waferDefectSourceKindSchema,
    })
    .optional(),
  mapPosition: z.object({
    x: z.number(),
    y: z.number(),
    source: waferDefectSourceKindSchema,
  }),
  defects: z.array(waferDefectEvidenceSchema),
})
export const waferDefectSummarySchema = z.object({
  waferId: z.string(),
  defectCount: z.number().int().nonnegative(),
  sampledAt: z.string().optional(),
  points: z.array(waferDefectPointSchema),
  source: z.object({
    count: waferDefectSourceKindSchema,
    sampledAt: waferDefectSourceKindSchema,
    position: waferDefectSourceKindSchema,
    image: waferDefectSourceKindSchema,
  }),
})
export const waferDefectInputSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  sourceLabel: z.string().optional(),
  sourceNote: z.string().optional(),
  wafers: z.array(waferDefectSummarySchema).optional(),
  selectedWaferId: z.string().optional(),
  readonly: z.boolean().optional(),
})
export const historyInputSchema = z.object({})

export type ExperimentInput = z.infer<typeof experimentInputSchema>
export type LotInput = z.infer<typeof lotInputSchema>
export type StepAssignment = z.infer<typeof stepAssignmentSchema>
export type StepRow = z.infer<typeof stepRowSchema>
export type StepCandidate = z.infer<typeof stepCandidateSchema>
export type StepsInput = z.infer<typeof stepsInputSchema>
export type RunCardReleaseStep = z.infer<typeof runCardReleaseStepSchema>
export type RunCardGroup = z.infer<typeof runCardGroupSchema>
export type RunCardInput = z.infer<typeof runCardInputSchema>
export type RunCardEventStatus = z.infer<typeof runCardEventStatusSchema>
export type RunCardEvent = z.infer<typeof runCardEventSchema>
export type WaferCapabilitySpec = z.infer<typeof waferCapabilitySpecSchema>
export type WaferCapabilityVariant = z.infer<typeof waferCapabilityVariantSchema>
export type WaferCapabilityStat = z.infer<typeof waferCapabilityStatSchema>
export type WaferCapabilityParameter = z.infer<
  typeof waferCapabilityParameterSchema
>
export type WaferInput = z.infer<typeof waferInputSchema>
export type WaferMapInput = z.infer<typeof waferMapDataSchema>
export type WaferDefectSourceKind = z.infer<typeof waferDefectSourceKindSchema>
export type WaferDefectEvidence = z.infer<typeof waferDefectEvidenceSchema>
export type WaferDefectPoint = z.infer<typeof waferDefectPointSchema>
export type WaferDefectSummary = z.infer<typeof waferDefectSummarySchema>
export type WaferDefectInput = z.infer<typeof waferDefectInputSchema>
export type RunCardHistoryInput = z.infer<typeof runCardHistoryInputSchema>
export type HistoryInput = z.infer<typeof historyInputSchema>
