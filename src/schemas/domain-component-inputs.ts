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
/**
 * The authoritative coverage state for one physical wafer in one map identity.
 * It is deliberately separate from the gallery request state above: an empty
 * Defect map is a successful response, while an unavailable map has no
 * coordinates to render.
 */
export const waferMapAvailabilitySchema = z.enum([
  "available",
  "empty",
  "partial",
  "unavailable",
])
export const waferMapMapStateSchema = z.object({
  /** Stable identity, e.g. defect:EOL:W01; never use waferId as a React key. */
  mapId: z.string().min(1),
  waferId: z.string().min(1),
  availability: waferMapAvailabilitySchema,
  reason: z.string().min(1).optional(),
}).superRefine((state, context) => {
  if ((state.availability === "partial" || state.availability === "unavailable") && !state.reason) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["reason"],
      message: `${state.availability} map state requires an authoritative reason.`,
    })
  }
})
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
export const waferMapParameterDieSchema = waferMapDieSchema.extend({
  // Parameter L1 can provide value/validity without CP Final Bin facts.
  finalBin: z.string().optional(),
  pass: z.boolean().optional(),
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
export const waferMapFinalBinInspectionSchema = z.object({
  testedDieCount: z.number().int().nonnegative(),
  totalFailBinCount: z.number().int().nonnegative(),
  totalFailBinRatePercent: z.number().finite().nonnegative(),
  rows: z.array(z.object({
    binCode: z.string(),
    binDescription: z.string(),
    count: z.number().int().nonnegative(),
    ratePercent: z.number().finite().nonnegative(),
  })),
})
export const waferMapParameterInspectionSchema = z.object({
  testedDieCount: z.number().int().nonnegative(),
  rows: z.array(z.object({
    classification: z.enum([
      "cp-fail-defect",
      "cp-pass-defect",
      "cp-pass-no-defect",
      "cp-fail-no-defect",
    ]),
    label: z.string(),
    count: z.number().int().nonnegative(),
    ratePercent: z.number().finite().nonnegative(),
  })),
})
export const waferMapDefectInspectionSchema = z.object({
  byLayer: z.array(z.object({
    layerId: z.string(),
    defectDieCount: z.number().int().nonnegative(),
    defectRecordCount: z.number().int().nonnegative(),
    rows: z.array(z.object({
      typeId: z.string(),
      label: z.string(),
      count: z.number().int().nonnegative(),
      ratePercent: z.number().finite().nonnegative(),
    })),
  })),
})
export const waferMapFinalBinWaferSchema = z.object({
  mapId: z.string().min(1),
  waferId: z.string(),
  geometry: waferMapGeometrySchema,
  dies: z.array(waferMapFinalBinDieSchema),
  /** Optional authoritative wafer totals; never recomputed from the map. */
  summary: waferMapSummarySchema.nullable().optional(),
  summaryUnavailableReason: z.string().min(1).optional(),
  /** Optional BFF-owned statistics; never reconstructed from rendered dies. */
  inspection: waferMapFinalBinInspectionSchema.optional(),
  inspectionUnavailableReason: z.string().min(1).optional(),
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
  mapId: z.string().min(1),
  waferId: z.string(),
  geometry: waferMapGeometrySchema,
  dies: z.array(waferMapParameterDieSchema),
  /** Selected-slice Parameter maps may not carry yield totals. */
  summary: waferMapSummarySchema.nullable().optional(),
  summaryUnavailableReason: z.string().min(1).optional(),
  /** CP × Defect classifications are optional authoritative detail facts. */
  inspection: waferMapParameterInspectionSchema.optional(),
  inspectionUnavailableReason: z.string().min(1).optional(),
})
export const waferMapDefectWaferSchema = z.object({
  mapId: z.string().min(1),
  waferId: z.string(),
  geometry: waferMapGeometrySchema,
  dies: z.array(waferMapDefectDieSchema),
  /** Defect maps retain their own authoritative summary boundary. */
  summary: waferMapSummarySchema.nullable().optional(),
  summaryUnavailableReason: z.string().min(1).optional(),
  /** Type-level inspection remains optional when only point payload is supplied. */
  inspection: waferMapDefectInspectionSchema.optional(),
  inspectionUnavailableReason: z.string().min(1).optional(),
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
    /** Full physical-wafer coverage. `wafers` contains only drawable maps. */
    mapStates: z.array(waferMapMapStateSchema).optional(),
    palette: z.record(z.string(), z.string()).optional(),
  }),
  z.object({
    kind: z.literal("cp-parameter"),
    status: waferMapStatusSchema,
    parameter: waferMapParameterContextSchema,
    wafers: z.array(waferMapParameterWaferSchema),
    mapStates: z.array(waferMapMapStateSchema).optional(),
  }),
  z.object({
    kind: z.literal("defect"),
    status: waferMapStatusSchema,
    layers: z.array(waferMapFilterOptionSchema),
    selectedLayerId: z.string(),
    defectTypes: z.array(waferMapFilterOptionSchema),
    selectedDefectTypeIds: z.array(z.string()),
    wafers: z.array(waferMapDefectWaferSchema),
    mapStates: z.array(waferMapMapStateSchema).optional(),
    /** Provenance for the selected layer's coordinate/layout contract. */
    coordinateContract: z.string().min(1).optional(),
  }),
]).superRefine((input, context) => {
  const seenMapIds = new Set<string>()
  for (const [index, wafer] of input.wafers.entries()) {
    if (seenMapIds.has(wafer.mapId)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["wafers", index, "mapId"], message: "Map identities must be unique within a gallery." })
    }
    seenMapIds.add(wafer.mapId)
  }
  const stateMapIds = new Set<string>()
  for (const [index, state] of (input.mapStates ?? []).entries()) {
    if (stateMapIds.has(state.mapId)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["mapStates", index, "mapId"], message: "Map state identities must be unique within a gallery." })
    }
    stateMapIds.add(state.mapId)
    const payload = input.wafers.find((wafer) => wafer.mapId === state.mapId)
    if ((state.availability === "available" || state.availability === "partial") && !payload) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["mapStates", index], message: "Drawable map states require a wafer payload." })
    }
    if (payload && payload.waferId !== state.waferId) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["mapStates", index, "waferId"], message: "Map state waferId must match its drawable map identity." })
    }
    if ((state.availability === "empty" || state.availability === "unavailable") && payload) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["mapStates", index], message: "Empty or unavailable map states must not carry a drawable payload." })
    }
  }
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
    cpu: z.number().finite().nullable().optional(),
    cpl: z.number().finite().nullable().optional(),
    status: z.string().optional(),
    specSource: z.string().optional(),
    lsl: z.number().finite().nullable().optional(),
    usl: z.number().finite().nullable().optional(),
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
export const reportSplitTableTopFailSchema = z.object({
  parameter: z.string(),
  count: z.number().int().nonnegative(),
})
export const reportSplitTableStepFacetSchema = z.object({
  step: z.string(),
  stepSequence: z.number().int().nonnegative().optional(),
  sourceCount: z.number().int().nonnegative(),
  displayCount: z.number().int().nonnegative(),
})
export const reportSplitTableRowSchema = z.object({
  waferId: z.string(),
  waferOrder: z.number().int().nonnegative().optional(),
  role: z.string(),
  stage: z.string(),
  stageId: z.string().optional(),
  step: z.string(),
  stepId: z.string().optional(),
  seq: z.string(),
  stepSequence: z.union([z.string(), z.number().int()]).optional(),
  variantSequence: z.union([z.string(), z.number().int()]).optional(),
  factor: z.string().optional(),
  recipe: z.string(),
  recipeId: z.string().optional(),
  condition: z.string(),
  plannedCondition: z.string().optional(),
  isBaseline: z.boolean().optional(),
  excluded: z.boolean().optional(),
  coverageStatus: z.string().optional(),
  yield: z.number().nullable(),
  topFail: z.string(),
  topFailCount: z.number().int().nonnegative(),
  topFails: z.array(reportSplitTableTopFailSchema).optional(),
  tone: reportToneSchema.default("neutral"),
})
export const reportSplitTableInputSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  sourceLabel: z.string().optional(),
  stageOptions: z.array(z.string()).optional(),
  stepOptions: z.array(z.string()).optional(),
  // BFF-owned audit and display populations. The component only filters rows.
  stepFacets: z.array(reportSplitTableStepFacetSchema).optional(),
  selectedStages: z.array(z.string()).optional(),
  selectedSteps: z.array(z.string()).optional(),
  rows: z.array(reportSplitTableRowSchema).optional(),
})
export const reportYieldWaferSchema = z.object({
  waferId: z.string(),
  stage: z.string().optional(),
  step: z.string().optional(),
  seq: z.string().optional(),
  yield: z.number().nullable(),
  role: z.string().optional(),
  condition: z.string().optional(),
  tone: reportToneSchema.default("neutral"),
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
  rowId: z.string(),
  groupId: z.string(),
  memberId: z.string(),
  waferId: z.string(),
  role: z.string().optional(),
  stage: z.string(),
  step: z.string(),
  seq: z.string(),
  condition: z.string(),
  baselineWaferId: z.string().nullable(),
  deltaPp: z.number().nullable(),
  yield: z.number().nullable(),
  goodDies: z.number().int().nonnegative().nullable().optional(),
  passDies: z.number().int().nonnegative().nullable(),
  testedDies: z.number().int().nonnegative().nullable(),
  failCounts: z.record(
    z.string(),
    z.number().int().nonnegative().nullable()
  ).default({}),
  failRates: z.record(z.string(), z.number().nullable()).default({}),
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
  rowId: z.string(),
  groupId: z.string(),
  waferIds: z.array(z.string()),
  stage: z.string(),
  step: z.string(),
  seq: z.string(),
  condition: z.string(),
  weightedYield: z.number().nullable(),
  medianYield: z.number().nullable(),
  averageYield: z.number().nullable(),
  minYield: z.number().nullable(),
  maxYield: z.number().nullable(),
  tone: reportToneSchema.default("neutral"),
})
export const reportYieldAnalysisInputSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  sourceLabel: z.string().optional(),
  yieldCpFailAnalysis: z.lazy(() => reportWaferYieldCpFailSchema).optional(),
  stageOptions: z.array(z.string()).optional(),
  stepOptions: z.array(z.string()).optional(),
  selectedStages: z.array(z.string()).optional(),
  selectedSteps: z.array(z.string()).optional(),
  wafers: z.array(reportYieldWaferSchema).optional(),
  detailModeOptions: z.array(reportYieldDetailModeOptionSchema).optional(),
  selectedDetailMode: reportYieldDetailModeSchema.optional(),
  focusedWaferId: z.string().optional(),
  matrixColumns: z.array(z.string()).optional(),
  matrixRows: z.array(reportYieldMatrixRowSchema).optional(),
  lossYieldRows: z.array(reportYieldLossRowSchema).optional(),
  conditionYieldRows: z.array(reportYieldConditionRowSchema).optional(),
})
export const reportWaferYieldCpFailSchema = z.object({
  title: z.string().default("Wafer Yield & CP Fail Analysis"),
  failThresholdPercent: z.number().min(0).max(100).default(2),
  series: z.array(z.object({
    parameter: z.string(),
  })),
  wafers: z.array(z.object({
    waferId: z.string(),
    step: z.string(),
    condition: z.string(),
    yield: z.number().min(0).max(100).nullable(),
    cpFails: z.array(z.object({
      parameter: z.string(),
      failedDies: z.number().int().nonnegative().nullable(),
      percent: z.number().min(0).max(100).nullable(),
    })),
  })),
})
export const reportWaferMapInputSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  sourceLabel: z.string().optional(),
  mapViews: z.array(waferMapGalleryInputSchema).optional(),
  viewStates: z.array(z.object({
    view: z.enum(["cp-final-bin", "cp-parameter", "defect", "overlay"]),
    status: z.enum(["idle", "ready", "loading", "unavailable", "failed"]),
    reason: z.string().optional(),
  })).optional(),
  /** Overlay has no render payload until CP and Defect share a coordinate contract. */
  overlayState: z.object({
    status: z.enum(["loading", "unavailable", "failed"]),
    reason: z.string().min(1),
  }).optional(),
  parameterOptions: z.array(z.object({
    label: z.string(),
    value: z.string(),
    disabled: z.boolean().optional(),
  })).optional(),
})
export const reportParameterMedianCellSchema = z.object({
  waferId: z.string(),
  value: z.number(),
  cpk: z.number().nullable().optional(),
  capability: z.object({
    cpk: z.number().finite().nullable(),
    status: z.string(),
    specSource: z.string(),
    lsl: z.number().finite().nullable(),
    usl: z.number().finite().nullable(),
    mean: z.number().finite().nullable(),
    sampleSigma: z.number().finite().nullable(),
    n: z.number().int().nonnegative().nullable(),
  }).optional(),
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
  parameterOptions: z.array(z.object({
    label: z.string(),
    value: z.string(),
    disabled: z.boolean().optional(),
  })).optional(),
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
const cpInlineProvenanceSchema = z.object({
  classification: z.enum(["real", "redacted-real", "prototype-backed", "derived", "mock"]),
  source: z.string(),
  limitation: z.string().optional(),
})
export const reportCpInlineCandidateLevelSchema = z.enum(["HIGH_TREND", "MEDIUM_TREND", "LOW", "FILTERED"])
export const reportCpInlineCandidateDirectionSchema = z.enum(["POSITIVE", "NEGATIVE", "NONE"])
export const reportCpInlineCandidateSchema = z.object({
  experimentGroupId: z.string(),
  stepLabel: z.string(),
  factorLabel: z.string(),
  cpParameter: z.string(),
  cpUnit: z.string().nullable().optional(),
  inlineParameter: z.string(),
  pairedCount: z.number().int().nonnegative(),
  assignedWaferCount: z.number().int().nonnegative(),
  pairedCoverage: z.number().finite().min(0).max(1),
  direction: reportCpInlineCandidateDirectionSchema,
  spearman: z.number().finite().nullable(),
  rSquared: z.number().finite().nullable(),
  cpResponse: z.number().finite().nullable(),
  cpSpread: z.number().finite().nullable(),
  score: z.number().finite().nullable(),
  level: reportCpInlineCandidateLevelSchema,
  sampleBand: z.string(),
  filterReason: z.string().nullable(),
  calculationEvidence: z.string().nullable().optional(),
  detailAvailable: z.boolean(),
  algorithmVersion: z.string(),
})
export const reportCpInlineCandidateFilterSchema = z.object({
  step: z.string().nullable(),
  cpParameter: z.string().nullable(),
  inlineParameter: z.string().nullable(),
  view: z.enum(["recommended", "filtered", "insufficient"]),
  pairedN: z.number().int().nonnegative().nullable(),
  reason: z.string().nullable(),
})
export const reportCpInlineCandidatesInputSchema = z.object({
  title: z.string().default("Wafer-level Candidate Analysis"),
  subtitle: z.string().optional(),
  stepOptions: z.array(z.string()).default([]),
  cpParameterOptions: z.array(z.string()).default([]),
  inlineParameterOptions: z.array(z.string()).default([]),
  pairedNOptions: z.array(z.number().int().nonnegative()).default([]),
  reasonOptions: z.array(z.string()).default([]),
  filters: reportCpInlineCandidateFilterSchema,
  items: z.array(reportCpInlineCandidateSchema).default([]),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  status: z.enum(["ready", "loading", "error"]),
  errorMessage: z.string().optional(),
  calculationVersion: z.string(),
  scoreDescription: z.string().optional(),
  provenance: cpInlineProvenanceSchema,
})
export const reportCpInlineCoverageStatusSchema = z.enum(["PAIRED", "INLINE_ONLY", "CP_ONLY", "NO_DATA"])
export const reportCpInlineWaferPairSchema = z.object({
  waferId: z.string(),
  role: z.enum(["BSL", "SPLIT"]),
  condition: z.string(),
  inlineMedian: z.number().finite().nullable(),
  cpMedian: z.number().finite().nullable(),
  cpMin: z.number().finite().nullable(),
  cpMax: z.number().finite().nullable(),
  coverageStatus: reportCpInlineCoverageStatusSchema,
})
export const reportCpInlineFitPointSchema = z.object({
  id: z.string(),
  label: z.string(),
  role: z.enum(["BSL", "SPLIT"]),
  grain: z.literal("WAFER"),
  x: z.number().finite(),
  y: z.number().finite(),
  waferId: z.string().optional(),
  inlineWafers: z.array(z.string()),
  cpWafers: z.array(z.string()),
})
export const reportCpInlineSeriesPointSchema = z.object({ x: z.number().finite(), y: z.number().finite() })
export const reportCpInlineFitModelSchema = z.object({
  kind: z.enum(["linear", "quadratic"]),
  label: z.string(),
  status: z.enum(["available", "unavailable"]),
  equation: z.string().nullable(),
  diagnostic: z.string(),
  r2: z.number().finite().nullable().optional(),
  rmse: z.number().finite().nullable().optional(),
  residualN: z.number().int().nonnegative().nullable().optional(),
  residualDf: z.number().int().nullable().optional(),
  unavailableReason: z.string().optional(),
  series: z.array(reportCpInlineSeriesPointSchema).default([]),
})
export const reportCpInlineThresholdKindSchema = z.enum(["target", "lsl", "usl"])
export const reportCpInlineRootSchema = z.object({
  id: z.string(), model: z.enum(["linear", "quadratic"]),
  threshold: reportCpInlineThresholdKindSchema,
  x: z.number().finite(), y: z.number().finite(),
  domainStatus: z.enum(["in-domain", "out-of-domain"]),
})
export const reportCpInlineFitPanelSchema = z.object({
  id: z.enum(["median", "min", "max"]), title: z.string(), metricLabel: z.string(),
  points: z.array(reportCpInlineFitPointSchema).default([]),
  models: z.array(reportCpInlineFitModelSchema).default([]),
  roots: z.array(reportCpInlineRootSchema).default([]),
  pearson: z.number().finite().nullable(), spearman: z.number().finite().nullable(),
  unavailableReason: z.string().optional(), provenance: z.string(),
})
export const reportCpInlineSpecSchema = z.object({
  target: z.number().finite().nullable(), lsl: z.number().finite().nullable(), usl: z.number().finite().nullable(),
  sourceLabel: z.string(), classification: z.enum(["confirmed", "source-provisional", "unavailable"]),
})
export const reportCpInlineFitInputSchema = z.object({
  experimentGroupId: z.string(), cpParameter: z.string(), inlineParameter: z.string(),
  stepLabel: z.string(), factorLabel: z.string(), cpUnit: z.string().nullable().optional(),
  waferPairs: z.array(reportCpInlineWaferPairSchema).default([]),
  fitPanels: z.array(reportCpInlineFitPanelSchema).default([]),
  spec: reportCpInlineSpecSchema.optional(), provenance: cpInlineProvenanceSchema.optional(),
})
export const reportCpInlineInputSchema = z.object({
  candidates: reportCpInlineCandidatesInputSchema,
  fit: reportCpInlineFitInputSchema.nullable(),
  fitStatus: z.enum(["ready", "loading", "error"]),
  fitError: z.string().optional(),
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
export type WaferMapAvailability = z.infer<typeof waferMapAvailabilitySchema>
export type WaferMapMapState = z.infer<typeof waferMapMapStateSchema>
export type WaferMapGeometryInput = z.infer<typeof waferMapGeometrySchema>
export type WaferMapFinalBinWaferInput = z.infer<
  typeof waferMapFinalBinWaferSchema
>
export type WaferMapParameterContext = z.infer<
  typeof waferMapParameterContextSchema
>
export type WaferMapFinalBinInspection = z.infer<
  typeof waferMapFinalBinInspectionSchema
>
export type WaferMapParameterInspection = z.infer<
  typeof waferMapParameterInspectionSchema
>
export type WaferMapDefectInspection = z.infer<
  typeof waferMapDefectInspectionSchema
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
export type ReportSplitTableTopFail = z.infer<
  typeof reportSplitTableTopFailSchema
>
export type ReportSplitTableStepFacet = z.infer<
  typeof reportSplitTableStepFacetSchema
>
export type ReportSplitTableRow = z.infer<typeof reportSplitTableRowSchema>
export type ReportSplitTableInput = z.infer<typeof reportSplitTableInputSchema>
export type ReportYieldWafer = z.infer<typeof reportYieldWaferSchema>
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
export type ReportWaferYieldCpFail = z.infer<
  typeof reportWaferYieldCpFailSchema
>
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
export type ReportCpInlineCandidateLevel = z.infer<typeof reportCpInlineCandidateLevelSchema>
export type ReportCpInlineCandidateDirection = z.infer<typeof reportCpInlineCandidateDirectionSchema>
export type ReportCpInlineCandidate = z.infer<typeof reportCpInlineCandidateSchema>
export type ReportCpInlineCandidateFilter = z.infer<typeof reportCpInlineCandidateFilterSchema>
export type ReportCpInlineCandidatesInput = z.infer<typeof reportCpInlineCandidatesInputSchema>
export type ReportCpInlineCoverageStatus = z.infer<typeof reportCpInlineCoverageStatusSchema>
export type ReportCpInlineWaferPair = z.infer<typeof reportCpInlineWaferPairSchema>
export type ReportCpInlineFitPoint = z.infer<typeof reportCpInlineFitPointSchema>
export type ReportCpInlineFitModel = z.infer<typeof reportCpInlineFitModelSchema>
export type ReportCpInlineFitPanel = z.infer<typeof reportCpInlineFitPanelSchema>
export type ReportCpInlineFitInput = z.infer<typeof reportCpInlineFitInputSchema>
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
