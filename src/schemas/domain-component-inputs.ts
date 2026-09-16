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
export const waferMapStatusSchema = z.enum(["pending", "ready", "unavailable"])
export const waferMapCoordinateSystemSchema = z.enum([
  "CP_DIE_GRID_V1",
  "DEFECT_INDEX_V1",
])
export const waferMapGeometrySchema = z.object({
  coordinateSystem: waferMapCoordinateSystemSchema,
  dies: z.array(waferMapDieSchema),
  bounds: waferMapBoundsSchema,
})
export const waferMapFinalBinDieSchema = waferMapDieSchema.extend({
  finalBin: z.string(),
  pass: z.boolean(),
})
export const waferMapParameterDieSchema = waferMapFinalBinDieSchema.extend({
  value: z.number().finite().nullable(),
  status: z.enum(["VALID", "MISSING", "NON_FINITE", "FAIL_SATURATION"]),
  clipped: z.enum(["low", "high"]).optional(),
})
export const waferMapDefectSchema = z.object({
  id: z.string(),
  layerId: z.string(),
  typeId: z.string(),
  typeLabel: z.string(),
})
export const waferMapDefectDieSchema = waferMapDieSchema.extend({
  defects: z.array(waferMapDefectSchema),
})
export const waferMapSummarySchema = z.object({
  pass: z.number().int().nonnegative(),
  fail: z.number().int().nonnegative(),
})
export const waferMapFinalBinWaferSchema = z.object({
  waferId: z.string(),
  geometry: waferMapGeometrySchema,
  dies: z.array(waferMapFinalBinDieSchema),
  summary: waferMapSummarySchema,
})
export const waferMapParameterContextSchema = z.object({
  parameterCode: z.string(),
  label: z.string(),
  unit: z.string().nullable().optional(),
  scale: z.object({
    domainMin: z.number().finite(),
    median: z.number().finite(),
    domainMax: z.number().finite(),
  }),
})
export const waferMapParameterWaferSchema = z.object({
  waferId: z.string(),
  geometry: waferMapGeometrySchema,
  dies: z.array(waferMapParameterDieSchema),
  summary: waferMapSummarySchema,
})
export const waferMapDefectWaferSchema = z.object({
  waferId: z.string(),
  geometry: waferMapGeometrySchema,
  dies: z.array(waferMapDefectDieSchema),
  summary: waferMapSummarySchema,
})
export const waferMapFilterOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
})
export const waferMapGalleryInputSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("cp-final-bin"),
    status: waferMapStatusSchema,
    wafers: z.array(waferMapFinalBinWaferSchema),
    palette: z.record(z.string(), z.string()).optional(),
  }),
  z.object({
    kind: z.literal("cp-parameter"),
    status: waferMapStatusSchema,
    parameter: waferMapParameterContextSchema,
    wafers: z.array(waferMapParameterWaferSchema),
  }),
  z.object({
    kind: z.literal("defect"),
    status: waferMapStatusSchema,
    layers: z.array(waferMapFilterOptionSchema),
    selectedLayerId: z.string(),
    defectTypes: z.array(waferMapFilterOptionSchema),
    selectedDefectTypeIds: z.array(z.string()),
    wafers: z.array(waferMapDefectWaferSchema),
  }),
])
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
export const measurementPointStatusSchema = z.enum([
  "PHYSICAL_VALID",
  "FAIL_SATURATION",
  "MISSING",
  "UNKNOWN",
])
export const measurementPointSchema = z.object({
  id: z.string(),
  x: z.number().finite(),
  y: z.number().finite(),
  value: z.number().finite(),
  sourceStatus: measurementPointStatusSchema.default("PHYSICAL_VALID"),
  finalBin: z.string().nullable().optional(),
  result: z.enum(["PASS", "FAIL", "UNKNOWN"]).optional(),
})
export const measurementSummarySchema = z.object({
  count: z.number().int().nonnegative(),
  min: z.number().finite().nullable(),
  q1: z.number().finite().nullable(),
  median: z.number().finite().nullable(),
  q3: z.number().finite().nullable(),
  max: z.number().finite().nullable(),
  whiskerLow: z.number().finite().nullable(),
  whiskerHigh: z.number().finite().nullable(),
  mean: z.number().finite().nullable(),
  sampleSigma: z.number().finite().nullable(),
})
export const measurementGroupSchema = z.object({
  id: z.string(),
  label: z.string(),
  role: z.enum(["baseline", "experiment", "neutral"]).default("neutral"),
  comparison: z.object({
    /** Groups in the same cohort highlight together while any one of them is hovered. */
    cohortId: z.string(),
    role: z.enum(["baseline", "variant"]),
  }).optional(),
  context: z.object({
    stage: z.string().nullable().optional(),
    step: z.string().nullable().optional(),
    sequence: z.string().nullable().optional(),
    condition: z.string().nullable().optional(),
  }).optional(),
  capability: z.object({
    cpk: z.number().finite().nullable(),
    cpu: z.number().finite().nullable(),
    cpl: z.number().finite().nullable(),
  }).optional(),
  summary: measurementSummarySchema,
  points: z.array(measurementPointSchema),
}).superRefine((group, context) => {
  if (group.summary.count !== group.points.length) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Measurement summary.count must equal the full point-cloud length.",
      path: ["summary", "count"],
    })
  }
})
export const measurementReferenceLineSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.number().finite(),
  kind: z.enum(["formal-spec", "mock-spec", "target", "guide"]),
})
export const measurementInputSchema = z.object({
  status: z.enum(["ready", "pending", "unavailable"]),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  sourceLabel: z.string().optional(),
  metric: z.object({
    id: z.string(),
    label: z.string(),
    unit: z.string().nullable().optional(),
  }),
  groups: z.array(measurementGroupSchema),
  referenceLines: z.array(measurementReferenceLineSchema).default([]),
  scale: z.object({
    mode: z.enum(["data-and-references", "fixed"]).default("data-and-references"),
    min: z.number().finite().optional(),
    max: z.number().finite().optional(),
  }).optional(),
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
  anomalyRows: z.array(z.object({
    splitGroup: z.string(),
    variant: z.string().optional(),
    waferId: z.string(),
    yield: z.number().finite(),
    baselineDelta: z.string().optional(),
    cpSummary: z.string().optional(),
    tone: reportToneSchema.default("neutral"),
  })).optional(),
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
  cpk: z.number().nullable().optional(),
  oos: z.boolean().optional(),
  lowYield: z.boolean().optional(),
  failLinked: z.boolean().optional(),
  tone: reportToneSchema.default("neutral"),
})
export const reportParameterMedianRowSchema = z.object({
  parameter: z.string(),
  unit: z.string().nullable().optional(),
  lsl: z.number().nullable(),
  usl: z.number().nullable(),
  specKind: z.string().optional(),
  oosCount: z.number().int().nonnegative().optional(),
  wafers: z.array(reportParameterMedianCellSchema),
})
export const reportParameterMedianInputSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  sourceLabel: z.string().optional(),
  parameterOptions: z.array(z.string()).optional(),
  parameterQuery: z.string().optional(),
  selectedParameterId: z.string().optional(),
  showOosOnly: z.boolean().optional(),
  oosResultCount: z.number().int().nonnegative().optional(),
  waferIds: z.array(z.string()).optional(),
  stickyHeader: z.boolean().default(true).optional(),
  stickyFirstColumn: z.boolean().default(true).optional(),
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
  status: z.enum(["ready", "partial", "no-data", "unavailable"]).default("ready"),
  defaultViewMode: z.enum(["distribution", "matrix"]).optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  sourceLabel: z.string().optional(),
  selectedParameterId: z.string().optional(),
  selectedWaferId: z.string().optional(),
  parameterOptions: z.array(z.string()).optional(),
  measurement: measurementInputSchema.optional(),
  summary: z.object({
    parameterCount: z.number().int().nonnegative().optional(),
    sampleRowCount: z.number().int().nonnegative().optional(),
    rawRowCount: z.number().int().nonnegative().optional(),
    cpkEvaluableCount: z.number().int().nonnegative().optional(),
    limitation: z.string().nullable().optional(),
  }).optional(),
  coverage: z.array(z.object({ waferId: z.string(), measured: z.boolean() })).default([]),
  stickyMatrixHeader: z.boolean().default(true).optional(),
  stickyMatrixFirstColumn: z.boolean().default(true).optional(),
  matrix: z.array(z.object({
    parameterId: z.string(),
    coverageLabel: z.string().optional(),
    cells: z.array(z.object({ waferId: z.string(), median: z.number().finite().nullable(), sampleSize: z.number().int().nonnegative().nullable(), cpk: z.number().finite().nullable(), status: z.string().nullable().optional() })).default([]),
  })).default([]),
  rawDetail: z.object({
    parameterId: z.string(),
    rawPointCount: z.number().int().nonnegative(),
    sampleIds: z.array(z.string()).default([]),
    status: z.enum(["ready", "partial", "unavailable"]),
    reason: z.string().nullable().optional(),
  }).optional(),
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
export const layoutSidebarShellNavGroupSchema = z.object({
  id: z.string(),
  label: z.string(),
  items: z.array(layoutShellNavItemSchema),
})
export const layoutSidebarShellBreadcrumbSchema = z.object({
  id: z.string(),
  label: z.string(),
  href: z.string().optional(),
  current: z.boolean().default(false),
})
export const layoutSidebarShellInputSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  sidebarTitle: z.string().optional(),
  sidebarSubtitle: z.string().optional(),
  searchPlaceholder: z.string().optional(),
  collapsed: z.boolean().optional(),
  versions: z.array(z.string()).optional(),
  selectedVersion: z.string().optional(),
  navGroups: z.array(layoutSidebarShellNavGroupSchema).optional(),
  breadcrumbs: z.array(layoutSidebarShellBreadcrumbSchema).optional(),
  topLinks: z.array(layoutShellNavItemSchema).optional(),
})

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
export type WaferMapStatus = z.infer<typeof waferMapStatusSchema>
export type WaferMapGeometryInput = z.infer<typeof waferMapGeometrySchema>
export type WaferMapFinalBinWaferInput = z.infer<
  typeof waferMapFinalBinWaferSchema
>
export type WaferMapParameterContext = z.infer<
  typeof waferMapParameterContextSchema
>
export type WaferMapParameterWaferInput = z.infer<
  typeof waferMapParameterWaferSchema
>
export type WaferMapDefectWaferInput = z.infer<
  typeof waferMapDefectWaferSchema
>
export type WaferMapGalleryInput = z.infer<typeof waferMapGalleryInputSchema>
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
export type MeasurementPoint = z.infer<typeof measurementPointSchema>
export type MeasurementSummary = z.infer<typeof measurementSummarySchema>
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
export type LayoutSidebarShellNavGroup = z.infer<
  typeof layoutSidebarShellNavGroupSchema
>
export type LayoutSidebarShellBreadcrumb = z.infer<
  typeof layoutSidebarShellBreadcrumbSchema
>
export type LayoutSidebarShellInput = z.infer<
  typeof layoutSidebarShellInputSchema
>
export type RunCardHistoryInput = z.infer<typeof runCardHistoryInputSchema>
