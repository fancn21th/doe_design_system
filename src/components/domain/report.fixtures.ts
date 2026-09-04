import { measurementFixture } from "@/components/domain/measurement.fixtures"
import { waferMapW01Fixture } from "@/components/domain/wafer-map.fixtures"
import type {
  ReportCpDataInput,
  ReportCpInlineInput,
  ReportInlineDataInput,
  ReportOverviewInput,
  ReportParameterMedianInput,
  ReportSplitTableInput,
  ReportWaferMapInput,
  ReportYieldAnalysisInput,
} from "@/schemas/domain-component-inputs"

export const reportOverviewFixture: ReportOverviewInput = {
  title: "Overview",
  subtitle: "DOE report round summary and exception entry points.",
  sourceLabel: "REPORT SNAPSHOT",
  identity: {
    product: "S0269A · Power MOSFET",
    lotId: "AF01112",
    stepCount: "18/18",
    waferCount: "25",
    summary:
      "本次 OXIDE ETCH Power DOE 共拆分 8 个 Split Group、15 个 Variant。3片 Wafer 的良率低于 99.5%，3片 Wafer 存在 CP Parameter OOS。",
  },
  metrics: [
    { label: "Fail Die", value: "8,857", detail: "of 102,475 tested", tone: "watch" },
    { label: "Defect Wafers", value: "25", detail: "3,387 total defects", tone: "watch" },
    { label: "Low Yield", value: "3", detail: "below 99.5%", tone: "bad" },
    { label: "CP OOS", value: "3", detail: "parameters with alerts", tone: "bad" },
  ],
  focusItems: [
    { label: "PW IMP dose", detail: "Current round process focus", tone: "neutral" },
    { label: "CT PH CD", detail: "CD window validation", tone: "neutral" },
    { label: "BS LTO before HDP CMP", detail: "Stack review item", tone: "neutral" },
  ],
  failGroups: [
    { label: "BVDSS", value: "14", detail: "top fail on W01", tone: "watch" },
    { label: "IDSS", value: "6", detail: "top fail on W02", tone: "neutral" },
    { label: "IGSSN1", value: "OOS", detail: "parameter alert", tone: "bad" },
  ],
  lowYieldWafers: [
    { label: "W03", value: "7.78%", detail: "split-2", tone: "bad" },
    { label: "W12", value: "23.69%", detail: "SG1 ET Depth", tone: "bad" },
    { label: "W10", value: "62.43%", detail: "LOX", tone: "watch" },
  ],
  parameterAlerts: [
    { label: "IGSSN1", value: "CPK 1.21", detail: "below review threshold", tone: "bad" },
    { label: "BVDSS", value: "LSL hit", detail: "source provisional", tone: "watch" },
    { label: "IDSS", value: "watch", detail: "distribution changed", tone: "watch" },
  ],
}

export const reportSplitTableFixture: ReportSplitTableInput = {
  title: "Wafer Split Table",
  subtitle: "Read-only report snapshot of wafer split assignment and yield.",
  sourceLabel: "REPORT SNAPSHOT",
  rows: [
    {
      waferId: "W01",
      role: "BSL",
      stage: "Lithography",
      step: "TR_PH CD",
      seq: "seq-num-001",
      recipe: "RCP-LIT-TRPH-01",
      condition: "BSL",
      yield: 99.63,
      topFail: "BVDSS",
      topFailCount: 14,
      tone: "good",
    },
    {
      waferId: "W02",
      role: "split-1",
      stage: "Lithography",
      step: "TR_PH CD",
      seq: "seq-num-002",
      recipe: "RCP-LIT-TRPH-02",
      condition: "0.75um",
      yield: 99.71,
      topFail: "IDSS",
      topFailCount: 6,
      tone: "good",
    },
    {
      waferId: "W03",
      role: "split-2",
      stage: "Lithography",
      step: "TR_PH CD",
      seq: "seq-num-003",
      recipe: "RCP-LIT-TRPH-03",
      condition: "0.83um",
      yield: 7.78,
      topFail: "BVDSS",
      topFailCount: 2148,
      tone: "bad",
    },
    {
      waferId: "W10",
      role: "split-2",
      stage: "Etch",
      step: "LOX",
      seq: "seq-num-010",
      recipe: "RCP-LOX-02",
      condition: "4200A",
      yield: 62.43,
      topFail: "VGSTX",
      topFailCount: 331,
      tone: "watch",
    },
  ],
}

export const reportYieldAnalysisFixture: ReportYieldAnalysisInput = {
  title: "Yield Analysis",
  subtitle: "Wafer yield ranking and first-level report detail entry.",
  sourceLabel: "REPORT SNAPSHOT",
  wafers: [
    { waferId: "W03", yield: 7.78, role: "split-2", condition: "0.83um", tone: "bad" },
    { waferId: "W12", yield: 23.69, role: "split-1", condition: "1.08um", tone: "bad" },
    { waferId: "W10", yield: 62.43, role: "split-2", condition: "4200A", tone: "watch" },
    { waferId: "W25", yield: 97.15, role: "split", condition: "Screen OX", tone: "watch" },
    { waferId: "W05", yield: 99.32, role: "split", condition: "5.5um", tone: "watch" },
    { waferId: "W01", yield: 99.63, role: "BSL", condition: "baseline", tone: "good" },
    { waferId: "W02", yield: 99.71, role: "split-1", condition: "0.75um", tone: "good" },
    { waferId: "W24", yield: 99.9, role: "split", condition: "Split", tone: "good" },
  ],
  detailItems: [
    { label: "Wafer x CP Matrix", detail: "detail mode placeholder", tone: "neutral" },
    { label: "Loss Yield", detail: "loss table placeholder", tone: "watch" },
    { label: "Condition Yield Comparison", detail: "condition aggregation placeholder", tone: "neutral" },
  ],
}

function mapFor(waferId: string) {
  return {
    ...waferMapW01Fixture,
    id: waferId,
    dies: [...waferMapW01Fixture.dies],
  }
}

export const reportWaferMapFixture: ReportWaferMapInput = {
  title: "Wafer Map",
  subtitle: "Report-level wafer grid. Wafer visualization composes shared WaferMap.",
  sourceLabel: "REPORT SNAPSHOT",
  mode: "CP Map",
  layer: "Final Bin",
  wafers: [
    { waferId: "W01", role: "BSL", pass: 4084, fail: 15, defect: 68, tone: "good", map: mapFor("W01") },
    { waferId: "W02", role: "split-1", pass: 4087, fail: 12, defect: 73, tone: "good", map: mapFor("W02") },
    { waferId: "W03", role: "split-2", pass: 319, fail: 3780, defect: 225, tone: "bad", map: mapFor("W03") },
    { waferId: "W10", role: "split-2", pass: 2559, fail: 1540, defect: 148, tone: "watch", map: mapFor("W10") },
  ],
}

export const reportParameterMedianFixture: ReportParameterMedianInput = {
  title: "Parameter Median",
  subtitle: "CP parameter median and CPK matrix by wafer.",
  sourceLabel: "REPORT SNAPSHOT",
  selectedParameterId: "IGSSN1",
  rows: [
    {
      parameter: "IGSSN1",
      unit: "A",
      lsl: -1.71378e-7,
      usl: 1.8671e-7,
      wafers: [
        { waferId: "W01", value: 7.69277e-9, cpk: 2.49, lowYield: false, tone: "good" },
        { waferId: "W02", value: 7.41614e-9, cpk: 2.49, lowYield: false, tone: "good" },
        { waferId: "W03", value: 7.45975e-9, cpk: 1.21, lowYield: true, tone: "bad" },
        { waferId: "W10", value: 8.2242e-9, cpk: 1.44, lowYield: false, tone: "watch" },
        { waferId: "W12", value: 7.9921e-9, cpk: 1.18, lowYield: true, tone: "bad" },
      ],
    },
    {
      parameter: "BVDSS",
      unit: "V",
      lsl: 52.41,
      usl: 127.67,
      wafers: [
        { waferId: "W01", value: 89.59, cpk: 2.37, lowYield: false, tone: "good" },
        { waferId: "W02", value: 91.06, cpk: 2.58, lowYield: false, tone: "good" },
        { waferId: "W03", value: 87.76, cpk: 1.02, lowYield: true, tone: "bad" },
        { waferId: "W10", value: 93.26, cpk: 0.44, lowYield: false, tone: "bad" },
        { waferId: "W12", value: 90.03, cpk: 1.39, lowYield: true, tone: "watch" },
      ],
    },
  ],
}

export const reportCpDataFixture: ReportCpDataInput = {
  title: "CP Data",
  subtitle: "Parent report tab that adapts CP die measurement data into Measurement.",
  sourceLabel: "CP REPORT",
  selectedParameterId: "BVDSS",
  parameterOptions: ["BVDSS", "IGSSN1", "IDSS"],
  measurement: {
    ...measurementFixture,
    title: "Die Measurement Distribution",
    subtitle: "Measurement placeholder composed by Report CP Data.",
    sourceLabel: "MEASUREMENT",
  },
}

export const reportInlineDataFixture: ReportInlineDataInput = {
  title: "Inline Data",
  subtitle: "Parent report tab that adapts inline/SPC data into Measurement.",
  sourceLabel: "INLINE REPORT",
  selectedParameterId: "AMC-SN080724-HDP-NCMP-GOF-69",
  parameterOptions: [
    "AMC-SN080724-HDP-NCMP-GOF-69",
    "AMC-SN080724-HDP-NCMP-TNK-69",
    "AMC-SN080724-PICM-OX-GOF-69",
    "AMC-SN080724-FOX-DEF-BOW-43",
  ],
  measurement: {
    ...measurementFixture,
    title: "Wafer x Inline Parameter",
    subtitle: "Measurement placeholder composed by Report Inline Data.",
    sourceLabel: "MEASUREMENT",
    yAxisLabel: "Inline Parameter Value",
    referenceLines: [
      { label: "USL", value: 0.9, tone: "watch" },
      { label: "Target", value: 0.8, tone: "neutral" },
      { label: "LSL", value: 0.6, tone: "watch" },
    ],
    groups: (measurementFixture.groups ?? []).slice(0, 5).map((group, index) => ({
      ...group,
      values: group.values.map((value) => value / 100),
      mean: group.mean / 100,
      median: group.median / 100,
      low: group.low / 100,
      high: group.high / 100,
      label: ["W01", "W02", "W11", "W18", "W24"][index] ?? group.label,
    })),
  },
}

export const reportCpInlineFixture: ReportCpInlineInput = {
  title: "CP x Inline",
  subtitle: "Condition aggregation and fit-readiness evidence.",
  sourceLabel: "REPORT SNAPSHOT",
  step: "TR CD · BSL + 2 Condition",
  inlineParameter: "AML-SN080724-TR-PH-ADI-69",
  cpParameter: "BVDSS",
  baselineWafers: ["W01", "W11", "W25"],
  splitWafers: ["W02", "W03"],
  rows: [
    {
      stage: "Etch",
      condition: "BSL pooled",
      role: "BSL",
      inlineWafers: "W01 / W11 / W25",
      cpWafers: "W01 / W11 / W25",
      meanInline: 0.782822,
      medianInline: 0.783511,
      meanCp: 89.2337,
      medianCp: 90.0434,
    },
    {
      stage: "Etch",
      condition: "0.75um",
      role: "split-1",
      inlineWafers: "W02",
      cpWafers: "W02",
      meanInline: 0.745379,
      medianInline: 0.745306,
      meanCp: 80.8915,
      medianCp: 91.0559,
    },
    {
      stage: "Etch",
      condition: "0.83um",
      role: "split-2",
      inlineWafers: "W03",
      cpWafers: "W03",
      meanInline: 0.833782,
      medianInline: 0.832165,
      meanCp: 87.5814,
      medianCp: 87.7626,
    },
  ],
}
