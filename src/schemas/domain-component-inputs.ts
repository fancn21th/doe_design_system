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

export const reportToneSchema = z.enum(["good", "watch", "bad", "neutral"])
export const reportMetricSchema = z.object({
  label: z.string(),
  value: z.string(),
  detail: z.string().optional(),
  tone: reportToneSchema.default("neutral"),
})
export const reportListItemSchema = z.object({
  label: z.string(),
  value: z.string().optional(),
  detail: z.string().optional(),
  tone: reportToneSchema.default("neutral"),
})
export const measurementReferenceLineSchema = z.object({
  label: z.string(),
  value: z.number(),
  tone: reportToneSchema.default("neutral"),
})
export const measurementGroupSchema = z.object({
  id: z.string(),
  label: z.string(),
  subtitle: z.string().optional(),
  values: z.array(z.number()).default([]),
  mean: z.number(),
  median: z.number(),
  low: z.number(),
  high: z.number(),
  n: z.number().int().nonnegative(),
  tone: reportToneSchema.default("neutral"),
})
export const measurementInputSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  sourceLabel: z.string().optional(),
  yAxisLabel: z.string().optional(),
  groups: z.array(measurementGroupSchema).optional(),
  referenceLines: z.array(measurementReferenceLineSchema).optional(),
})
export const reportOverviewInputSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  sourceLabel: z.string().optional(),
  identity: z
    .object({
      product: z.string(),
      lotId: z.string(),
      stepCount: z.string(),
      waferCount: z.string(),
      summary: z.string(),
    })
    .optional(),
  metrics: z.array(reportMetricSchema).optional(),
  focusItems: z.array(reportListItemSchema).optional(),
  failGroups: z.array(reportListItemSchema).optional(),
  lowYieldWafers: z.array(reportListItemSchema).optional(),
  parameterAlerts: z.array(reportListItemSchema).optional(),
})
export const reportSplitTableRowSchema = z.object({
  waferId: z.string(),
  role: z.string(),
  stage: z.string(),
  step: z.string(),
  seq: z.string(),
  recipe: z.string(),
  condition: z.string(),
  yield: z.number(),
  topFail: z.string(),
  topFailCount: z.number().int().nonnegative(),
  tone: reportToneSchema.default("neutral"),
})
export const reportSplitTableInputSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  sourceLabel: z.string().optional(),
  stageOptions: z.array(z.string()).optional(),
  stepOptions: z.array(z.string()).optional(),
  selectedStages: z.array(z.string()).optional(),
  selectedSteps: z.array(z.string()).optional(),
  rows: z.array(reportSplitTableRowSchema).optional(),
})
export const reportYieldWaferSchema = z.object({
  waferId: z.string(),
  stage: z.string().optional(),
  step: z.string().optional(),
  seq: z.string().optional(),
  yield: z.number(),
  role: z.string().optional(),
  condition: z.string().optional(),
  tone: reportToneSchema.default("neutral"),
})
export const reportYieldThresholdsSchema = z.object({
  good: z.number().default(99.5),
  watch: z.number().default(90),
})
export const reportYieldDetailModeSchema = z.enum([
  "wafer-cp-matrix",
  "loss-yield",
  "condition-yield-comparison",
])
export const reportYieldDetailModeOptionSchema = z.object({
  id: reportYieldDetailModeSchema,
  label: z.string(),
})
export const reportYieldMatrixRowSchema = z.object({
  waferId: z.string(),
  role: z.string().optional(),
  stage: z.string(),
  step: z.string(),
  seq: z.string(),
  condition: z.string(),
  yield: z.number(),
  passDies: z.number().int().nonnegative(),
  testedDies: z.number().int().nonnegative(),
  failCounts: z.record(z.string(), z.number().int().nonnegative()).default({}),
  tone: reportToneSchema.default("neutral"),
})
export const reportYieldLossRowSchema = z.object({
  rank: z.number().int().positive(),
  parameter: z.string(),
  failedDieCount: z.number().int().nonnegative(),
  pareto: z.number(),
  yieldLoss: z.number(),
  cumulativeYieldLoss: z.number(),
  tone: reportToneSchema.default("neutral"),
})
export const reportYieldConditionRowSchema = z.object({
  waferIds: z.array(z.string()),
  stage: z.string(),
  step: z.string(),
  seq: z.string(),
  condition: z.string(),
  weightedYield: z.number(),
  medianYield: z.number(),
  averageYield: z.number(),
  minYield: z.number(),
  maxYield: z.number(),
  tone: reportToneSchema.default("neutral"),
})
export const reportYieldAnalysisInputSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  sourceLabel: z.string().optional(),
  stageOptions: z.array(z.string()).optional(),
  stepOptions: z.array(z.string()).optional(),
  selectedStages: z.array(z.string()).optional(),
  selectedSteps: z.array(z.string()).optional(),
  thresholds: reportYieldThresholdsSchema.optional(),
  wafers: z.array(reportYieldWaferSchema).optional(),
  detailModeOptions: z.array(reportYieldDetailModeOptionSchema).optional(),
  selectedDetailMode: reportYieldDetailModeSchema.optional(),
  matrixColumns: z.array(z.string()).optional(),
  matrixRows: z.array(reportYieldMatrixRowSchema).optional(),
  lossYieldRows: z.array(reportYieldLossRowSchema).optional(),
  conditionYieldRows: z.array(reportYieldConditionRowSchema).optional(),
})
export const reportWaferMapCardSchema = z.object({
  waferId: z.string(),
  role: z.string().optional(),
  pass: z.number().int().nonnegative(),
  fail: z.number().int().nonnegative(),
  defect: z.number().int().nonnegative(),
  tone: reportToneSchema.default("neutral"),
  map: waferMapDataSchema,
})
export const reportWaferMapInputSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  sourceLabel: z.string().optional(),
  mode: z.string().optional(),
  layer: z.string().optional(),
  wafers: z.array(reportWaferMapCardSchema).optional(),
})
export const reportParameterMedianCellSchema = z.object({
  waferId: z.string(),
  value: z.number(),
  cpk: z.number(),
  lowYield: z.boolean().default(false),
  tone: reportToneSchema.default("neutral"),
})
export const reportParameterMedianRowSchema = z.object({
  parameter: z.string(),
  unit: z.string(),
  lsl: z.number(),
  usl: z.number(),
  wafers: z.array(reportParameterMedianCellSchema),
})
export const reportParameterMedianInputSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  sourceLabel: z.string().optional(),
  selectedParameterId: z.string().optional(),
  showOosOnly: z.boolean().optional(),
  rows: z.array(reportParameterMedianRowSchema).optional(),
})
export const reportCpDataInputSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  sourceLabel: z.string().optional(),
  selectedParameterId: z.string().optional(),
  parameterOptions: z.array(z.string()).optional(),
  measurement: measurementInputSchema.optional(),
})
export const reportInlineDataInputSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  sourceLabel: z.string().optional(),
  selectedParameterId: z.string().optional(),
  parameterOptions: z.array(z.string()).optional(),
  measurement: measurementInputSchema.optional(),
})
export const reportCpInlineRowSchema = z.object({
  stage: z.string(),
  condition: z.string(),
  role: z.string(),
  inlineWafers: z.string(),
  cpWafers: z.string(),
  meanInline: z.number(),
  medianInline: z.number(),
  meanCp: z.number(),
  medianCp: z.number(),
})
export const reportCpInlineInputSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  sourceLabel: z.string().optional(),
  step: z.string().optional(),
  inlineParameter: z.string().optional(),
  cpParameter: z.string().optional(),
  baselineWafers: z.array(z.string()).optional(),
  splitWafers: z.array(z.string()).optional(),
  rows: z.array(reportCpInlineRowSchema).optional(),
})
export const layoutShellNavItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  active: z.boolean().default(false),
  href: z.string().optional(),
  disabled: z.boolean().optional(),
})
export const layoutShellInputSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  sidebarTitle: z.string().optional(),
  collapsed: z.boolean().optional(),
  navItems: z.array(layoutShellNavItemSchema).optional(),
  topLinks: z.array(layoutShellNavItemSchema).optional(),
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
export type ReportTone = z.infer<typeof reportToneSchema>
export type ReportMetric = z.infer<typeof reportMetricSchema>
export type ReportListItem = z.infer<typeof reportListItemSchema>
export type MeasurementReferenceLine = z.infer<
  typeof measurementReferenceLineSchema
>
export type MeasurementGroup = z.infer<typeof measurementGroupSchema>
export type MeasurementInput = z.infer<typeof measurementInputSchema>
export type ReportOverviewInput = z.infer<typeof reportOverviewInputSchema>
export type ReportSplitTableRow = z.infer<typeof reportSplitTableRowSchema>
export type ReportSplitTableInput = z.infer<typeof reportSplitTableInputSchema>
export type ReportYieldWafer = z.infer<typeof reportYieldWaferSchema>
export type ReportYieldThresholds = z.infer<
  typeof reportYieldThresholdsSchema
>
export type ReportYieldDetailMode = z.infer<
  typeof reportYieldDetailModeSchema
>
export type ReportYieldDetailModeOption = z.infer<
  typeof reportYieldDetailModeOptionSchema
>
export type ReportYieldMatrixRow = z.infer<typeof reportYieldMatrixRowSchema>
export type ReportYieldLossRow = z.infer<typeof reportYieldLossRowSchema>
export type ReportYieldConditionRow = z.infer<
  typeof reportYieldConditionRowSchema
>
export type ReportYieldAnalysisInput = z.infer<
  typeof reportYieldAnalysisInputSchema
>
export type ReportWaferMapCard = z.infer<typeof reportWaferMapCardSchema>
export type ReportWaferMapInput = z.infer<typeof reportWaferMapInputSchema>
export type ReportParameterMedianCell = z.infer<
  typeof reportParameterMedianCellSchema
>
export type ReportParameterMedianRow = z.infer<
  typeof reportParameterMedianRowSchema
>
export type ReportParameterMedianInput = z.infer<
  typeof reportParameterMedianInputSchema
>
export type ReportCpDataInput = z.infer<typeof reportCpDataInputSchema>
export type ReportInlineDataInput = z.infer<typeof reportInlineDataInputSchema>
export type ReportCpInlineRow = z.infer<typeof reportCpInlineRowSchema>
export type ReportCpInlineInput = z.infer<typeof reportCpInlineInputSchema>
export type LayoutShellNavItem = z.infer<typeof layoutShellNavItemSchema>
export type LayoutShellInput = z.infer<typeof layoutShellInputSchema>
export type RunCardHistoryInput = z.infer<typeof runCardHistoryInputSchema>
export type HistoryInput = z.infer<typeof historyInputSchema>
