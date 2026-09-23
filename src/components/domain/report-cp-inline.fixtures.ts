import type {
  ReportCpInlineFitPanel,
  ReportCpInlineFitPoint,
  ReportCpInlineInput,
  ReportCpInlineRow,
} from "@/schemas/domain-component-inputs"

const FIT_DOMAIN = { min: 0.74, max: 0.84 }

const medianPoints: ReportCpInlineFitPoint[] = [
  {
    id: "median-bsl",
    label: "BSL pooled",
    role: "BSL",
    grain: "CONDITION",
    x: 0.783511,
    y: 90.0434,
    inlineWafers: ["W01"],
    cpWafers: ["W01", "W11", "W25"],
  },
  {
    id: "median-split-075",
    label: "0.75um",
    role: "SPLIT",
    grain: "CONDITION",
    x: 0.745308,
    y: 91.0559,
    inlineWafers: ["W02"],
    cpWafers: ["W02"],
  },
  {
    id: "median-split-083",
    label: "0.83um",
    role: "SPLIT",
    grain: "CONDITION",
    x: 0.832165,
    y: 87.7626,
    inlineWafers: ["W03"],
    cpWafers: ["W03"],
  },
]

const minPoints: ReportCpInlineFitPoint[] = medianPoints.map((point, index) => ({
  ...point,
  id: point.id.replace("median", "min"),
  y: [0.0147921, 0.0115498, 0.0091561][index],
}))

const maxPoints: ReportCpInlineFitPoint[] = medianPoints.map((point, index) => ({
  ...point,
  id: point.id.replace("median", "max"),
  y: [91.1515, 92.1722, 89.2885][index],
}))

const medianLinearSeries = [
  { x: 0.74, y: 91.421012 }, { x: 0.75, y: 91.03785 },
  { x: 0.76, y: 90.654688 }, { x: 0.77, y: 90.271526 },
  { x: 0.78, y: 89.888364 }, { x: 0.79, y: 89.505202 },
  { x: 0.8, y: 89.12204 }, { x: 0.81, y: 88.738878 },
  { x: 0.82, y: 88.355716 }, { x: 0.83, y: 87.972554 },
  { x: 0.84, y: 87.589392 },
]
const medianQuadraticSeries = [
  { x: 0.74, y: 91.142451 }, { x: 0.75, y: 90.9685 },
  { x: 0.76, y: 90.747631 }, { x: 0.77, y: 90.479845 },
  { x: 0.78, y: 90.165141 }, { x: 0.79, y: 89.803519 },
  { x: 0.8, y: 89.39498 }, { x: 0.81, y: 88.939523 },
  { x: 0.82, y: 88.437149 }, { x: 0.83, y: 87.887857 },
  { x: 0.84, y: 87.291647 },
]
const minLinearSeries = [
  { x: 0.74, y: 0.013313342 }, { x: 0.75, y: 0.012998275 },
  { x: 0.76, y: 0.012683208 }, { x: 0.77, y: 0.012368141 },
  { x: 0.78, y: 0.012053074 }, { x: 0.79, y: 0.011738007 },
  { x: 0.8, y: 0.01142294 }, { x: 0.81, y: 0.011107873 },
  { x: 0.82, y: 0.010792806 }, { x: 0.83, y: 0.010477739 },
  { x: 0.84, y: 0.010162672 },
]
const minQuadraticSeries = [
  { x: 0.74, y: 0.010571148 }, { x: 0.75, y: 0.012316875 },
  { x: 0.76, y: 0.013600448 }, { x: 0.77, y: 0.014421867 },
  { x: 0.78, y: 0.014781132 }, { x: 0.79, y: 0.014678243 },
  { x: 0.8, y: 0.0141132 }, { x: 0.81, y: 0.013086003 },
  { x: 0.82, y: 0.011596652 }, { x: 0.83, y: 0.009645147 },
  { x: 0.84, y: 0.007231488 },
]
const maxLinearSeries = [
  { x: 0.74, y: 92.441502 }, { x: 0.75, y: 92.107225 },
  { x: 0.76, y: 91.772948 }, { x: 0.77, y: 91.438671 },
  { x: 0.78, y: 91.104394 }, { x: 0.79, y: 90.770117 },
  { x: 0.8, y: 90.43584 }, { x: 0.81, y: 90.101563 },
  { x: 0.82, y: 89.767286 }, { x: 0.83, y: 89.433009 },
  { x: 0.84, y: 89.098732 },
]
const maxQuadraticSeries = [
  { x: 0.74, y: 92.282819 }, { x: 0.75, y: 92.067375 },
  { x: 0.76, y: 91.825279 }, { x: 0.77, y: 91.556532 },
  { x: 0.78, y: 91.261133 }, { x: 0.79, y: 90.939082 },
  { x: 0.8, y: 90.59038 }, { x: 0.81, y: 90.215026 },
  { x: 0.82, y: 89.813021 }, { x: 0.83, y: 89.384364 },
  { x: 0.84, y: 88.929055 },
]

const factorReviewGate = {
  mode: "FACTOR_REVIEW" as const,
  conditionLevelCount: 3,
  linearAllowed: true,
  quadraticAllowed: true,
  reason: "3 Condition 点：线性与二次插值并列给 RD；二次残差 df=0",
}

function fitPanel(
  id: ReportCpInlineFitPanel["id"],
  title: string,
  metricLabel: string,
  thresholdKind: ReportCpInlineFitPanel["thresholdKind"],
  thresholdRelation: ReportCpInlineFitPanel["thresholdRelation"],
  points: ReportCpInlineFitPoint[],
  linear: { equation: string; diagnostic: string; r2: number; rmse: number; series: Array<{ x: number; y: number }> },
  quadratic: { equation: string; diagnostic: string; series: Array<{ x: number; y: number }> }
): ReportCpInlineFitPanel {
  return {
    id,
    title,
    metricLabel,
    thresholdKind,
    thresholdRelation,
    points,
    models: [
      {
        kind: "linear",
        label: "Linear",
        status: "available",
        equation: linear.equation,
        diagnostic: linear.diagnostic,
        r2: linear.r2,
        rmse: linear.rmse,
        residualDf: 1,
        series: linear.series,
      },
      {
        kind: "quadratic",
        label: "Quadratic",
        status: "available",
        equation: quadratic.equation,
        diagnostic: quadratic.diagnostic,
        residualDf: 0,
        series: quadratic.series,
      },
    ],
    roots: [],
    gate: factorReviewGate,
    provenance: "DOE Workbench prototype · Condition aggregation · BVDSS",
  }
}

const prototypeFitPanels: ReportCpInlineFitPanel[] = [
  fitPanel(
    "median",
    "CP Median",
    "BVDSS · CP Median",
    "target",
    ">=",
    medianPoints,
    {
      equation: "ŷ = -38.3162x + 119.775",
      diagnostic: "R² 0.9778 · RMSE 0.35517 · 残差 df 1",
      r2: 0.9778,
      rmse: 0.35517,
      series: medianLinearSeries,
    },
    {
      equation: "ŷ = -234.588x² + 332.141x − 26.1815",
      diagnostic: "残差 df 0 · R² 不作模型验证",
      series: medianQuadraticSeries,
    }
  ),
  fitPanel(
    "min",
    "CP 典型 Min",
    "BVDSS · CP 典型 Min",
    "lsl",
    ">=",
    minPoints,
    {
      equation: "ŷ = -0.0315067x + 0.0366283",
      diagnostic: "R² 0.2351 · RMSE 0.0034985 · 残差 df 1",
      r2: 0.2351,
      rmse: 0.0034985,
      series: minLinearSeries,
    },
    {
      equation: "ŷ = -2.31077x² + 3.61762x − 1.40109",
      diagnostic: "残差 df 0 · R² 不作模型验证",
      series: minQuadraticSeries,
    }
  ),
  fitPanel(
    "max",
    "CP 典型 Max",
    "BVDSS · CP 典型 Max",
    "usl",
    "<=",
    maxPoints,
    {
      equation: "ŷ = -33.4277x + 117.178",
      diagnostic: "R² 0.9905 · RMSE 0.20175 · 残差 df 1",
      r2: 0.9905,
      rmse: 0.20175,
      series: maxLinearSeries,
    },
    {
      equation: "ŷ = -133.258x² + 177.01x + 34.2675",
      diagnostic: "残差 df 0 · R² 不作模型验证",
      series: maxQuadraticSeries,
    }
  ),
]

const prototypeRows: ReportCpInlineRow[] = [
  {
    id: "bsl-pooled",
    stage: "Etch",
    condition: "BSL pooled",
    role: "BSL",
    requestedWafers: ["W01", "W11", "W25"],
    inlineWafers: ["W01"],
    cpWafers: ["W01", "W11", "W25"],
    meanInline: 0.782822,
    medianInline: 0.783511,
    meanCp: 89.2337,
    medianCp: 90.0434,
  },
  {
    id: "split-075",
    stage: "Etch",
    condition: "0.75um",
    role: "split-1",
    requestedWafers: ["W02"],
    inlineWafers: ["W02"],
    cpWafers: ["W02"],
    meanInline: 0.745379,
    medianInline: 0.745308,
    meanCp: 90.8915,
    medianCp: 91.0559,
  },
  {
    id: "split-083",
    stage: "Etch",
    condition: "0.83um",
    role: "split-2",
    requestedWafers: ["W03"],
    inlineWafers: ["W03"],
    cpWafers: ["W03"],
    meanInline: 0.833782,
    medianInline: 0.832165,
    meanCp: 87.5814,
    medianCp: 87.7626,
  },
]

export const reportCpInlineFixture: ReportCpInlineInput = {
  title: "CP x Inline 拟合",
  subtitle: "Condition 聚合与 Fit Candidate 证据。",
  sourceLabel: "PROTOTYPE-BACKED · DOE WORKBENCH",
  stepOptions: [
    { value: "tr-cd", label: "TR CD · BSL + 2 个 Condition" },
    { value: "oxide-etch", label: "OXIDE ETCH · BSL + 3 个 Condition" },
  ],
  step: "tr-cd",
  inlineParameterOptions: [
    { value: "AML-SN080T24-TR-PH-ADI-69", label: "AML-SN080T24-TR-PH-ADI-69" },
    { value: "AML-SN080T24-TR-PH-ADI-71", label: "AML-SN080T24-TR-PH-ADI-71" },
  ],
  inlineParameter: "AML-SN080T24-TR-PH-ADI-69",
  cpParameterOptions: [
    { value: "BVDSS", label: "BVDSS" },
    { value: "VGSTX2", label: "VGSTX2" },
  ],
  cpParameter: "BVDSS",
  baselineWaferOptions: [
    { value: "W01", label: "W01", coverageStatus: "PAIRED", coverageLabel: "同片配对" },
    { value: "W11", label: "W11", coverageStatus: "CP_ONLY", coverageLabel: "仅 CP" },
    { value: "W25", label: "W25", coverageStatus: "CP_ONLY", coverageLabel: "仅 CP" },
  ],
  baselineWafers: ["W01", "W11", "W25"],
  splitWaferOptions: [
    { value: "W02", label: "W02", coverageStatus: "PAIRED", coverageLabel: "同片配对" },
    { value: "W03", label: "W03", coverageStatus: "PAIRED", coverageLabel: "同片配对" },
  ],
  splitWafers: ["W02", "W03"],
  fitGrainOptions: [
    { value: "condition", label: "condition拟合" },
    { value: "wafer", label: "Wafer 级合并拟合" },
  ],
  fitGrain: "condition",
  inlineMetricOptions: [
    { value: "median", label: "Sample median" },
    { value: "mean", label: "Sample mean" },
  ],
  inlineMetric: "median",
  cpAggregationOptions: [
    { value: "median", label: "CP Parameter Median" },
    { value: "mean", label: "CP Parameter Mean" },
  ],
  cpAggregation: "median",
  extremePolicyOptions: [
    { value: "typical", label: "Wafer Min/Max 的中位数" },
    { value: "worst", label: "Min 取最小 / Max 取最大" },
  ],
  extremePolicy: "typical",
  quadraticEnabled: true,
  spec: {
    target: null,
    lsl: null,
    usl: null,
    sourceLabel: "BVDSS · 未配置参数阈值",
    classification: "unavailable",
  },
  rows: prototypeRows,
  fitPanels: prototypeFitPanels,
  controlWindows: [
    {
      model: "linear",
      status: "unavailable",
      domain: FIT_DOMAIN,
      intervals: [],
      basis: [],
      reason: "Target / LSL / USL 未完整配置，不能形成 Inline Control Window。",
      provenance: "DOE Workbench prototype",
    },
    {
      model: "quadratic",
      status: "unavailable",
      domain: FIT_DOMAIN,
      intervals: [],
      basis: [],
      reason: "Target / LSL / USL 未完整配置，不能形成 Inline Control Window。",
      provenance: "DOE Workbench prototype",
    },
  ],
  provenance: {
    classification: "prototype-backed",
    source: "DOE Workbench 单文件版 · CP x Inline",
    limitation: "BVDSS 阈值未配置；候选模型用于 RD 比较，不自动选择主模型。",
  },
}

export const reportCpInlineConfiguredSpecFixture: ReportCpInlineInput = {
  ...reportCpInlineFixture,
  sourceLabel: "PROTOTYPE-BACKED · DERIVED SPEC SCENARIO",
  spec: {
    target: 89.5,
    lsl: 0.01,
    usl: 91.5,
    sourceLabel: "SOURCE PROVISIONAL · REVIEW SPEC",
    classification: "source-provisional",
  },
  fitPanels: prototypeFitPanels.map((panel) => ({
    ...panel,
    roots: panel.id === "median"
      ? [{ id: "median-linear-target", model: "linear", threshold: "target", x: 0.790136, y: 89.5, domainStatus: "in-domain" }]
      : panel.id === "min"
        ? [{ id: "min-linear-lsl", model: "linear", threshold: "lsl", x: 0.845163, y: 0.01, domainStatus: "out-of-domain" }]
        : [{ id: "max-linear-usl", model: "linear", threshold: "usl", x: 0.768165, y: 91.5, domainStatus: "in-domain" }],
  })),
  controlWindows: [
    {
      model: "linear",
      status: "available",
      domain: FIT_DOMAIN,
      intervals: [{ min: 0.768165, max: 0.790136 }],
      basis: ["CP Median ≥ 89.5", "CP Min ≥ 0.01", "CP Max ≤ 91.5"],
      provenance: "Derived fixture from source-provided Linear evidence",
    },
    {
      model: "quadratic",
      status: "unavailable",
      domain: FIT_DOMAIN,
      intervals: [],
      basis: ["CP Median ≥ 89.5", "CP Min ≥ 0.01", "CP Max ≤ 91.5"],
      reason: "该场景未提供完整 Quadratic 根选择证据。",
      provenance: "Source provisional",
    },
  ],
  provenance: {
    classification: "derived",
    source: "Prototype-backed BVDSS fits with a deterministic review-spec scenario",
    limitation: "Inline Control Window 为 Source Provisional，只读且不是 Recipe setpoint。",
  },
}

export const reportCpInlineCoverageMismatchFixture: ReportCpInlineInput = {
  ...reportCpInlineFixture,
  splitWaferOptions: [
    ...(reportCpInlineFixture.splitWaferOptions ?? []),
    { value: "W04", label: "W04", coverageStatus: "INLINE_ONLY", coverageLabel: "仅 Inline" },
    { value: "W05", label: "W05", coverageStatus: "NO_DATA", coverageLabel: "无可用数据", disabled: true },
  ],
  splitWafers: ["W02", "W03", "W04"],
  rows: [
    ...prototypeRows,
    {
      id: "split-inline-only",
      stage: "Etch",
      condition: "0.79um",
      role: "split-3",
      requestedWafers: ["W04", "W05"],
      inlineWafers: ["W04"],
      cpWafers: [],
      meanInline: 0.790142,
      medianInline: 0.790108,
      meanCp: null,
      medianCp: null,
    },
  ],
  provenance: {
    classification: "mock",
    source: "Coverage boundary scenario",
    limitation: "W04 / W05 are scenario-only wafers used to expose INLINE_ONLY and NO_DATA states.",
  },
}

function unavailablePanel(
  panel: ReportCpInlineFitPanel,
  mode: "NO_DATA" | "REPEATABILITY",
  points: ReportCpInlineFitPoint[],
  reason: string
): ReportCpInlineFitPanel {
  return {
    ...panel,
    points,
    roots: [],
    models: panel.models.map((model) => ({
      ...model,
      status: "unavailable",
      equation: null,
      diagnostic: reason,
      unavailableReason: reason,
      series: [],
    })),
    gate: {
      mode,
      conditionLevelCount: mode === "NO_DATA" ? 0 : 1,
      linearAllowed: false,
      quadraticAllowed: false,
      reason,
    },
    unavailableReason: reason,
  }
}

export const reportCpInlineInsufficientLevelsFixture: ReportCpInlineInput = {
  ...reportCpInlineFixture,
  rows: prototypeRows.slice(0, 1),
  fitPanels: prototypeFitPanels.map((panel) =>
    unavailablePanel(
      panel,
      "REPEATABILITY",
      panel.points.slice(0, 1),
      "仅 1 个 Condition level：只看组内重复性，不生成跨 level 拟合或 Factor 边界。"
    )
  ),
  controlWindows: [],
  provenance: {
    classification: "derived",
    source: "Single-condition gate scenario",
    limitation: "Explicitly demonstrates the business gate rather than a mathematical point-count inference.",
  },
}

export const reportCpInlinePartialFixture: ReportCpInlineInput = {
  ...reportCpInlineFixture,
  fitPanels: prototypeFitPanels.map((panel) =>
    panel.id === "min"
      ? unavailablePanel(panel, "NO_DATA", [], "CP Min source evidence is unavailable for the selected population.")
      : panel
  ),
  provenance: {
    classification: "derived",
    source: "Partial upstream evidence scenario",
    limitation: "CP Median and CP Max remain available while CP Min is unavailable.",
  },
}

export const reportCpInlineEmptyFixture: ReportCpInlineInput = {
  ...reportCpInlineFixture,
  rows: [],
  fitPanels: prototypeFitPanels.map((panel) =>
    unavailablePanel(panel, "NO_DATA", [], "当前选择没有可用的 CP × Inline 证据。")
  ),
  controlWindows: [],
  provenance: {
    classification: "mock",
    source: "Empty-state scenario",
    limitation: "No observations are present.",
  },
}

export const reportCpInlineDenseFixture: ReportCpInlineInput = {
  ...reportCpInlineFixture,
  rows: Array.from({ length: 4 }, (_, groupIndex) =>
    prototypeRows.map((row, rowIndex) => ({
      ...row,
      id: `${row.id}-dense-${groupIndex}`,
      condition: groupIndex === 0 ? row.condition : `${row.condition} · R${groupIndex + 1}`,
      role: row.role === "BSL" ? "BSL" : `split-${groupIndex * 2 + rowIndex}`,
    }))
  ).flat(),
  provenance: {
    classification: "mock",
    source: "Dense-layout scenario derived from the prototype-backed rows",
    limitation: "Repeated rows test local table overflow only; they are not additional measurements.",
  },
}
