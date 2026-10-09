import { measurementFixture } from "@/components/domain/measurement.fixtures"
import {
  waferMapDefectOverviewFixture,
  waferMapFinalBinOverviewFixture,
  waferMapParameterBvdssOverviewFixture,
  waferMapParameterOverviewFixture,
  availableMapStates,
} from "@/components/domain/wafer-map.fixtures"
import type {
  ReportCpDataInput,
  ReportInlineDataInput,
  ReportOverviewInput,
  ReportParameterMedianInput,
  ReportSplitTableInput,
  ReportWaferMapInput,
  ReportWaferYieldCpFail,
  ReportYieldAnalysisInput,
  ReportYieldConditionRow,
  ReportYieldMatrixRow,
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
  anomalyRows: [
    { splitGroup: "TR CD", variant: "0.83um", waferId: "W03", yield: 7.78, cpSummary: "VGSTX1 · 3,769 dies", tone: "bad" },
    { splitGroup: "LOX", variant: "4200A", waferId: "W10", yield: 62.43, cpSummary: "VGSTX1 · 1,005 dies", tone: "bad" },
    { splitGroup: "SG1 ET Depth", variant: "1.08um", waferId: "W12", yield: 85.12, cpSummary: "Default · 610 dies", tone: "watch" },
  ],
}

export const reportSplitTableFixture: ReportSplitTableInput = {
  title: "Wafer Split Table",
  subtitle: "Read-only report snapshot of wafer split assignment and yield.",
  sourceLabel: "REPORT SNAPSHOT",
  stageOptions: [
    "Lithography",
    "Etch",
    "Clean",
    "Oxidation",
    "Backside Process",
    "Wet Clean",
    "Baseline",
  ],
  stepOptions: [
    "TR CD",
    "TR Depth",
    "Pre clean",
    "LOX",
    "SG1 ET Depth",
    "LOX PB",
    "IPO_ET",
    "Warpage",
    "P2_ET",
    "Mesa OX Wet Dip",
    "Screen OX",
    "Post-run BSL",
  ],
  selectedStages: [],
  selectedSteps: [],
  rows: [
    {
      waferId: "W01",
      role: "BSL",
      stage: "Lithography",
      step: "TR CD",
      seq: "seq-num-001",
      recipe: "0.79um",
      condition: "0.79um",
      yield: 99.63,
      topFail: "Default",
      topFailCount: 14,
      tone: "good",
    },
    {
      waferId: "W02",
      role: "split-1",
      stage: "Lithography",
      step: "TR CD",
      seq: "seq-num-001",
      recipe: "0.75um",
      condition: "0.75um",
      yield: 99.71,
      topFail: "Default",
      topFailCount: 6,
      tone: "good",
    },
    {
      waferId: "W03",
      role: "split-2",
      stage: "Lithography",
      step: "TR CD",
      seq: "seq-num-001",
      recipe: "0.83um",
      condition: "0.83um",
      yield: 7.78,
      topFail: "VGSTX1",
      topFailCount: 3769,
      tone: "bad",
    },
    {
      waferId: "W01",
      role: "BSL",
      stage: "Etch",
      step: "TR Depth",
      seq: "seq-num-001",
      recipe: "5um",
      condition: "5um",
      yield: 99.63,
      topFail: "Default",
      topFailCount: 14,
      tone: "good",
    },
    {
      waferId: "W04",
      role: "split-1",
      stage: "Etch",
      step: "TR Depth",
      seq: "seq-num-001",
      recipe: "4.5um",
      condition: "4.5um",
      yield: 99.9,
      topFail: "Default",
      topFailCount: 2,
      tone: "good",
    },
    {
      waferId: "W05",
      role: "split-2",
      stage: "Etch",
      step: "TR Depth",
      seq: "seq-num-001",
      recipe: "5.5um",
      condition: "5.5um",
      yield: 99.32,
      topFail: "Default",
      topFailCount: 23,
      tone: "watch",
    },
    {
      waferId: "W01",
      role: "BSL",
      stage: "Etch",
      step: "TR Depth",
      seq: "seq-num-002",
      recipe: "5um",
      condition: "5um",
      yield: 99.63,
      topFail: "Default",
      topFailCount: 14,
      tone: "good",
    },
    {
      waferId: "W06",
      role: "split-1",
      stage: "Etch",
      step: "TR Depth",
      seq: "seq-num-002",
      recipe: "4.75um",
      condition: "4.75um",
      yield: 99.73,
      topFail: "Default",
      topFailCount: 9,
      tone: "good",
    },
    {
      waferId: "W07",
      role: "split-2",
      stage: "Etch",
      step: "TR Depth",
      seq: "seq-num-002",
      recipe: "5.25um",
      condition: "5.25um",
      yield: 99.63,
      topFail: "Default",
      topFailCount: 11,
      tone: "good",
    },
    {
      waferId: "W01",
      role: "BSL",
      stage: "Clean",
      step: "Pre clean",
      seq: "seq-num-001",
      recipe: "BOE 30A",
      condition: "BOE 30A",
      yield: 99.63,
      topFail: "Default",
      topFailCount: 14,
      tone: "good",
    },
    {
      waferId: "W08",
      role: "split-1",
      stage: "Clean",
      step: "Pre clean",
      seq: "seq-num-001",
      recipe: "HF 30A",
      condition: "HF 30A",
      yield: 99.66,
      topFail: "Default",
      topFailCount: 14,
      tone: "good",
    },
    {
      waferId: "W01",
      role: "BSL",
      stage: "Oxidation",
      step: "LOX",
      seq: "seq-num-001",
      recipe: "3900A",
      condition: "3900A",
      yield: 99.63,
      topFail: "Default",
      topFailCount: 14,
      tone: "good",
    },
    {
      waferId: "W09",
      role: "split-1",
      stage: "Oxidation",
      step: "LOX",
      seq: "seq-num-001",
      recipe: "3600A",
      condition: "3600A",
      yield: 99.73,
      topFail: "Default",
      topFailCount: 9,
      tone: "good",
    },
    {
      waferId: "W10",
      role: "split-2",
      stage: "Oxidation",
      step: "LOX",
      seq: "seq-num-001",
      recipe: "4200A",
      condition: "4200A",
      yield: 62.43,
      topFail: "VGSTX1",
      topFailCount: 1005,
      tone: "bad",
    },
    {
      waferId: "W11",
      role: "BSL",
      stage: "Etch",
      step: "SG1 ET Depth",
      seq: "seq-num-001",
      recipe: "1.18um",
      condition: "1.18um",
      yield: 99.51,
      topFail: "Default",
      topFailCount: 14,
      tone: "good",
    },
    {
      waferId: "W12",
      role: "split-1",
      stage: "Etch",
      step: "SG1 ET Depth",
      seq: "seq-num-001",
      recipe: "1.08um",
      condition: "1.08um",
      yield: 23.69,
      topFail: "IGSSP1",
      topFailCount: 2996,
      topFails: [
        { parameter: "IGSSP1", count: 2996 },
        { parameter: "IGSSPSC", count: 97 },
      ],
      tone: "bad",
    },
    {
      waferId: "W13",
      role: "split-2",
      stage: "Etch",
      step: "SG1 ET Depth",
      seq: "seq-num-001",
      recipe: "1.28um",
      condition: "1.28um",
      yield: 99.68,
      topFail: "Default",
      topFailCount: 11,
      tone: "good",
    },
    {
      waferId: "W11",
      role: "BSL",
      stage: "Etch",
      step: "LOX PB",
      seq: "seq-num-001",
      recipe: "1500A",
      condition: "1500A",
      yield: 99.51,
      topFail: "Default",
      topFailCount: 14,
      tone: "good",
    },
    {
      waferId: "W14",
      role: "split-1",
      stage: "Etch",
      step: "LOX PB",
      seq: "seq-num-001",
      recipe: "1200A",
      condition: "1200A",
      yield: 99.51,
      topFail: "Default",
      topFailCount: 19,
      tone: "good",
    },
    {
      waferId: "W15",
      role: "split-2",
      stage: "Etch",
      step: "LOX PB",
      seq: "seq-num-001",
      recipe: "1000A",
      condition: "1000A",
      yield: 99.68,
      topFail: "Default",
      topFailCount: 9,
      tone: "good",
    },
    {
      waferId: "W11",
      role: "BSL",
      stage: "Etch",
      step: "IPO_ET",
      seq: "seq-num-001",
      recipe: "IPO Remain~2800A",
      condition: "IPO Remain~2800A",
      yield: 99.51,
      topFail: "Default",
      topFailCount: 14,
      tone: "good",
    },
    {
      waferId: "W16",
      role: "split-1",
      stage: "Etch",
      step: "IPO_ET",
      seq: "seq-num-001",
      recipe: "IPO Remain~2500A",
      condition: "IPO Remain~2500A",
      yield: 99.68,
      topFail: "Default",
      topFailCount: 12,
      tone: "good",
    },
    {
      waferId: "W17",
      role: "split-2",
      stage: "Etch",
      step: "IPO_ET",
      seq: "seq-num-001",
      recipe: "IPO Remain~3100A",
      condition: "IPO Remain~3100A",
      yield: 99.63,
      topFail: "Default",
      topFailCount: 13,
      tone: "good",
    },
    {
      waferId: "W11",
      role: "BSL",
      stage: "Backside Process",
      step: "Warpage",
      seq: "seq-num-001",
      recipe: "5K + SPM 5min + SC1 5min",
      condition: "5K + SPM 5min + SC1 5min",
      yield: 99.51,
      topFail: "Default",
      topFailCount: 14,
      tone: "good",
    },
    {
      waferId: "W18",
      role: "split-1",
      stage: "Backside Process",
      step: "Warpage",
      seq: "seq-num-001",
      recipe: "1K+Skip clean",
      condition: "1K+Skip clean",
      yield: 99.83,
      topFail: "Default",
      topFailCount: 7,
      tone: "good",
    },
    {
      waferId: "W19",
      role: "split-1",
      stage: "Backside Process",
      step: "Warpage",
      seq: "seq-num-001",
      recipe: "1K+Skip clean",
      condition: "1K+Skip clean",
      yield: 99.56,
      topFail: "Default",
      topFailCount: 14,
      tone: "good",
    },
    {
      waferId: "W11",
      role: "BSL",
      stage: "Etch",
      step: "P2_ET",
      seq: "seq-num-001",
      recipe: "660A",
      condition: "660A",
      yield: 99.51,
      topFail: "Default",
      topFailCount: 14,
      tone: "good",
    },
    {
      waferId: "W20",
      role: "split-1",
      stage: "Etch",
      step: "P2_ET",
      seq: "seq-num-001",
      recipe: "BSL-10%",
      condition: "BSL-10%",
      yield: 99.83,
      topFail: "Default",
      topFailCount: 5,
      tone: "good",
    },
    {
      waferId: "W21",
      role: "split-2",
      stage: "Etch",
      step: "P2_ET",
      seq: "seq-num-001",
      recipe: "BSL+10%",
      condition: "BSL+10%",
      yield: 99.71,
      topFail: "Default",
      topFailCount: 7,
      tone: "good",
    },
    {
      waferId: "W11",
      role: "BSL",
      stage: "Wet Clean",
      step: "Mesa OX Wet Dip",
      seq: "seq-num-001",
      recipe: "600A",
      condition: "600A",
      yield: 99.51,
      topFail: "Default",
      topFailCount: 14,
      tone: "good",
    },
    {
      waferId: "W22",
      role: "split-1",
      stage: "Wet Clean",
      step: "Mesa OX Wet Dip",
      seq: "seq-num-001",
      recipe: "400A",
      condition: "400A",
      yield: 99.61,
      topFail: "Default",
      topFailCount: 14,
      tone: "good",
    },
    {
      waferId: "W23",
      role: "split-2",
      stage: "Wet Clean",
      step: "Mesa OX Wet Dip",
      seq: "seq-num-001",
      recipe: "500A",
      condition: "500A",
      yield: 99.76,
      topFail: "Default",
      topFailCount: 10,
      tone: "good",
    },
    {
      waferId: "W11",
      role: "BSL",
      stage: "Oxidation",
      step: "Screen OX",
      seq: "seq-num-001",
      recipe: "1000C 550A",
      condition: "1000C 550A",
      yield: 99.51,
      topFail: "Default",
      topFailCount: 14,
      tone: "good",
    },
    {
      waferId: "W24",
      role: "split-1",
      stage: "Oxidation",
      step: "Screen OX",
      seq: "seq-num-001",
      recipe: "1050C 550A",
      condition: "1050C 550A",
      yield: 99.56,
      topFail: "Default",
      topFailCount: 17,
      tone: "good",
    },
    {
      waferId: "W25",
      role: "BSL",
      stage: "Baseline",
      step: "Post-run BSL",
      seq: "seq-num-001",
      recipe: "BSL",
      condition: "BSL",
      yield: 97.15,
      topFail: "Default",
      topFailCount: 71,
      tone: "watch",
    },
  ],
}

export const reportYieldAnalysisFixture: ReportYieldAnalysisInput = {
  title: "Yield Analysis",
  subtitle: "Wafer yield and CP fail analysis with condition-level detail.",
  sourceLabel: "REPORT SNAPSHOT",
  stageOptions: [
    "Lithography",
    "Etch",
    "Clean",
    "Oxidation",
    "Backside Process",
    "Wet Clean",
    "Baseline",
  ],
  stepOptions: [
    "BSL",
    "TR CD",
    "TR Depth",
    "Pre clean",
    "LOX",
    "SG1 ET Depth",
    "LOX PB",
    "IPO_ET",
    "Warpage",
    "P2_ET",
    "Mesa OX Wet Dip",
    "Screen OX",
  ],
  selectedStages: [],
  selectedSteps: [],
  wafers: [
    { waferId: "W03", stage: "Lithography", step: "TR CD", seq: "seq-num-002", yield: 7.78, role: "split-2", condition: "0.83um", tone: "bad" },
    { waferId: "W12", stage: "Etch", step: "SG1 ET Depth", seq: "seq-num-001", yield: 23.69, role: "split-1", condition: "1.08um", tone: "bad" },
    { waferId: "W10", stage: "Oxidation", step: "LOX", seq: "seq-num-001", yield: 62.43, role: "split-2", condition: "4200A", tone: "bad" },
    { waferId: "W25", stage: "Baseline", step: "BSL", seq: "seq-num-001", yield: 97.15, role: "BSL", condition: "BSL", tone: "watch" },
    { waferId: "W05", stage: "Etch", step: "TR Depth", seq: "seq-num-001", yield: 99.32, role: "split-2", condition: "5.5um", tone: "watch" },
    { waferId: "W11", stage: "Baseline", step: "BSL", seq: "seq-num-001", yield: 99.51, role: "BSL", condition: "BSL", tone: "good" },
    { waferId: "W14", stage: "Etch", step: "LOX PB", seq: "seq-num-001", yield: 99.51, role: "split-1", condition: "1200A", tone: "good" },
    { waferId: "W19", stage: "Backside Process", step: "Warpage", seq: "seq-num-001", yield: 99.56, role: "split-1", condition: "1K+Skip clean", tone: "good" },
    { waferId: "W24", stage: "Oxidation", step: "Screen OX", seq: "seq-num-001", yield: 99.56, role: "split-1", condition: "1050C 550A", tone: "good" },
    { waferId: "W22", stage: "Wet Clean", step: "Mesa OX Wet Dip", seq: "seq-num-001", yield: 99.61, role: "split-1", condition: "400A", tone: "good" },
    { waferId: "W01", stage: "Baseline", step: "BSL", seq: "seq-num-001", yield: 99.63, role: "BSL", condition: "BSL", tone: "good" },
    { waferId: "W07", stage: "Etch", step: "TR Depth", seq: "seq-num-001", yield: 99.63, role: "split-2", condition: "5.25um", tone: "good" },
    { waferId: "W17", stage: "Etch", step: "IPO_ET", seq: "seq-num-001", yield: 99.63, role: "split-2", condition: "IPO Remain~3100A", tone: "good" },
    { waferId: "W08", stage: "Clean", step: "Pre clean", seq: "seq-num-001", yield: 99.66, role: "split-1", condition: "HF 30A", tone: "good" },
    { waferId: "W13", stage: "Etch", step: "SG1 ET Depth", seq: "seq-num-001", yield: 99.68, role: "split-2", condition: "1.28um", tone: "good" },
    { waferId: "W15", stage: "Etch", step: "LOX PB", seq: "seq-num-001", yield: 99.68, role: "split-2", condition: "1000A", tone: "good" },
    { waferId: "W16", stage: "Etch", step: "IPO_ET", seq: "seq-num-001", yield: 99.68, role: "split-1", condition: "IPO Remain~2500A", tone: "good" },
    { waferId: "W02", stage: "Lithography", step: "TR CD", seq: "seq-num-002", yield: 99.71, role: "split-1", condition: "0.75um", tone: "good" },
    { waferId: "W21", stage: "Etch", step: "P2_ET", seq: "seq-num-001", yield: 99.71, role: "split-2", condition: "BSL+10%", tone: "good" },
    { waferId: "W06", stage: "Etch", step: "TR Depth", seq: "seq-num-001", yield: 99.73, role: "split-1", condition: "4.75um", tone: "good" },
    { waferId: "W09", stage: "Oxidation", step: "LOX", seq: "seq-num-001", yield: 99.73, role: "split-1", condition: "3600A", tone: "good" },
    { waferId: "W23", stage: "Wet Clean", step: "Mesa OX Wet Dip", seq: "seq-num-001", yield: 99.76, role: "split-2", condition: "500A", tone: "good" },
    { waferId: "W18", stage: "Backside Process", step: "Warpage", seq: "seq-num-001", yield: 99.83, role: "split-1", condition: "1K+Skip clean", tone: "good" },
    { waferId: "W20", stage: "Etch", step: "P2_ET", seq: "seq-num-001", yield: 99.83, role: "split-1", condition: "BSL-10%", tone: "good" },
    { waferId: "W04", stage: "Etch", step: "TR Depth", seq: "seq-num-001", yield: 99.9, role: "split-1", condition: "4.5um", tone: "good" },
  ],
  detailModeOptions: [
    { id: "wafer-cp-matrix", label: "Wafer x CP Matrix" },
    { id: "loss-yield", label: "Loss Yield" },
    { id: "condition-yield-comparison", label: "Condition Yield Comparison" },
  ],
  selectedDetailMode: "wafer-cp-matrix",
  matrixColumns: [
    "BVDSS",
    "IDSS",
    "IDSS_80P",
    "IDSS_100P",
    "IGSS",
    "IGSSP1",
    "IGSSN1",
    "IGSSPSC",
    "IGSSNSC",
    "VTH",
    "VGSTX1",
    "VGSTX2",
    "RDS(on)",
    "RDS_ON_4V5",
    "RDS_ON_10V",
    "VF",
    "VSD",
    "BVDS",
    "BVGSS",
    "VGS(th)",
    "gm",
    "Ciss",
    "Coss",
    "Crss",
    "Qg",
    "Qgd",
    "Qgs",
    "Td(on)",
    "Tr",
    "Td(off)",
    "Tf",
    "EAS",
    "EAR",
    "UIS",
    "Ron_sp",
    "Leak_D",
    "Leak_G",
    "VBR",
    "I_BD",
    "VDS_sat",
    "VSD_F",
    "VSD_R",
    "I_Gate_Pos",
    "I_Gate_Neg",
    "Gate_Short",
    "Drain_Short",
    "Source_Short",
    "SHORT",
    "OPEN",
    "dVGSTX",
    "dVTH",
    "dRDS",
    "dBVDSS",
    "CP_MARGIN",
    "FINAL_BIN",
  ],
  matrixRows: [
    { waferId: "W01", role: "BSL", stage: "Baseline", step: "BSL", seq: "seq-num-001", condition: "BSL", yield: 99.63, goodDies: 4084, passDies: 4084, testedDies: 4099, failCounts: { SHORT: 1 }, tone: "good" },
    { waferId: "W02", role: "split-1", stage: "Lithography", step: "TR CD", seq: "seq-num-002", condition: "0.75um", yield: 99.71, goodDies: 4087, passDies: 4087, testedDies: 4099, failCounts: { BVDSS: 4, IGSSP1: 1, VGSTX1: 1 }, tone: "good" },
    { waferId: "W03", role: "split-2", stage: "Lithography", step: "TR CD", seq: "seq-num-002", condition: "0.83um", yield: 7.78, goodDies: 319, passDies: 319, testedDies: 4099, failCounts: { IGSSP1: 2, VGSTX1: 3769 }, tone: "bad" },
    { waferId: "W04", role: "split-1", stage: "Etch", step: "TR Depth", seq: "seq-num-001", condition: "4.5um", yield: 99.9, goodDies: 4095, passDies: 4095, testedDies: 4099, failCounts: { IDSS_80P: 1, Gate_Short: 1 }, tone: "good" },
    { waferId: "W05", role: "split-2", stage: "Etch", step: "TR Depth", seq: "seq-num-001", condition: "5.5um", yield: 99.32, goodDies: 4071, passDies: 4071, testedDies: 4099, failCounts: { BVDSS: 2, IDSS_80P: 1, IGSSP1: 1, Gate_Short: 1 }, tone: "watch" },
    { waferId: "W06", role: "split-1", stage: "Etch", step: "TR Depth", seq: "seq-num-001", condition: "4.75um", yield: 99.73, goodDies: 4088, passDies: 4088, testedDies: 4099, failCounts: { BVDSS: 2 }, tone: "good" },
    { waferId: "W07", role: "split-2", stage: "Etch", step: "TR Depth", seq: "seq-num-001", condition: "5.25um", yield: 99.63, goodDies: 4084, passDies: 4084, testedDies: 4099, failCounts: { BVDSS: 3, Gate_Short: 1 }, tone: "good" },
    { waferId: "W08", role: "split-1", stage: "Clean", step: "Pre clean", seq: "seq-num-001", condition: "HF 30A", yield: 99.66, goodDies: 4085, passDies: 4085, testedDies: 4099, failCounts: {}, tone: "good" },
    { waferId: "W09", role: "split-1", stage: "Oxidation", step: "LOX", seq: "seq-num-001", condition: "3600A", yield: 99.73, goodDies: 4088, passDies: 4088, testedDies: 4099, failCounts: { BVDSS: 2 }, tone: "good" },
    { waferId: "W10", role: "split-2", stage: "Oxidation", step: "LOX", seq: "seq-num-001", condition: "4200A", yield: 62.43, goodDies: 2559, passDies: 2559, testedDies: 4099, failCounts: { BVDSS: 2, VGSTX1: 1005 }, tone: "bad" },
    { waferId: "W11", role: "BSL", stage: "Baseline", step: "BSL", seq: "seq-num-001", condition: "BSL", yield: 99.51, goodDies: 4079, passDies: 4079, testedDies: 4099, failCounts: { BVDSS: 4, IDSS_80P: 1, SHORT: 1 }, tone: "good" },
    { waferId: "W12", role: "split-1", stage: "Etch", step: "SG1 ET Depth", seq: "seq-num-001", condition: "1.08um", yield: 23.69, goodDies: 971, passDies: 971, testedDies: 4099, failCounts: { BVDSS: 3, IGSSP1: 2996, IGSSN1: 1, IGSSPSC: 97, IGSSNSC: 1, SHORT: 2 }, tone: "bad" },
    { waferId: "W13", role: "split-2", stage: "Etch", step: "SG1 ET Depth", seq: "seq-num-001", condition: "1.28um", yield: 99.68, goodDies: 4086, passDies: 4086, testedDies: 4099, failCounts: { IDSS_80P: 2 }, tone: "good" },
    { waferId: "W14", role: "split-1", stage: "Etch", step: "LOX PB", seq: "seq-num-001", condition: "1200A", yield: 99.51, goodDies: 4079, passDies: 4079, testedDies: 4099, failCounts: { IDSS_100P: 1 }, tone: "good" },
    { waferId: "W15", role: "split-2", stage: "Etch", step: "LOX PB", seq: "seq-num-001", condition: "1000A", yield: 99.68, goodDies: 4086, passDies: 4086, testedDies: 4099, failCounts: { BVDSS: 2, IGSSP1: 1, Gate_Short: 1 }, tone: "good" },
    { waferId: "W16", role: "split-1", stage: "Etch", step: "IPO_ET", seq: "seq-num-001", condition: "IPO Remain~2500A", yield: 99.68, goodDies: 4086, passDies: 4086, testedDies: 4099, failCounts: { IGSSP1: 1 }, tone: "good" },
    { waferId: "W17", role: "split-2", stage: "Etch", step: "IPO_ET", seq: "seq-num-001", condition: "IPO Remain~3100A", yield: 99.63, goodDies: 4084, passDies: 4084, testedDies: 4099, failCounts: { BVDSS: 2 }, tone: "good" },
    { waferId: "W18", role: "split-1", stage: "Backside Process", step: "Warpage", seq: "seq-num-001", condition: "1K+Skip clean", yield: 99.83, goodDies: 4092, passDies: 4092, testedDies: 4099, failCounts: {}, tone: "good" },
    { waferId: "W19", role: "split-1", stage: "Backside Process", step: "Warpage", seq: "seq-num-001", condition: "1K+Skip clean", yield: 99.56, goodDies: 4081, passDies: 4081, testedDies: 4099, failCounts: { BVDSS: 1, IGSSP1: 2, SHORT: 1 }, tone: "good" },
    { waferId: "W20", role: "split-1", stage: "Etch", step: "P2_ET", seq: "seq-num-001", condition: "BSL-10%", yield: 99.83, goodDies: 4092, passDies: 4092, testedDies: 4099, failCounts: { BVDSS: 1, IDSS_80P: 1 }, tone: "good" },
    { waferId: "W21", role: "split-2", stage: "Etch", step: "P2_ET", seq: "seq-num-001", condition: "BSL+10%", yield: 99.71, goodDies: 4087, passDies: 4087, testedDies: 4099, failCounts: { BVDSS: 2, IGSSP1: 1, SHORT: 2 }, tone: "good" },
    { waferId: "W22", role: "split-1", stage: "Wet Clean", step: "Mesa OX Wet Dip", seq: "seq-num-001", condition: "400A", yield: 99.61, goodDies: 4083, passDies: 4083, testedDies: 4099, failCounts: { IGSSP1: 2 }, tone: "good" },
    { waferId: "W23", role: "split-2", stage: "Wet Clean", step: "Mesa OX Wet Dip", seq: "seq-num-001", condition: "500A", yield: 99.76, goodDies: 4089, passDies: 4089, testedDies: 4099, failCounts: {}, tone: "good" },
    { waferId: "W24", role: "split-1", stage: "Oxidation", step: "Screen OX", seq: "seq-num-001", condition: "1050C 550A", yield: 99.56, goodDies: 4081, passDies: 4081, testedDies: 4099, failCounts: { IGSSP1: 1 }, tone: "good" },
    { waferId: "W25", role: "BSL", stage: "Baseline", step: "BSL", seq: "seq-num-001", condition: "BSL", yield: 97.15, goodDies: 3982, passDies: 3982, testedDies: 4099, failCounts: { BVDSS: 1, IGSSP1: 42, Gate_Short: 3 }, tone: "watch" },
  ].map((row, index): ReportYieldMatrixRow => ({
    ...row,
    rowId: `fixture-row-${index + 1}`,
    groupId: `fixture-group-${row.step}-${row.seq}`,
    memberId: `fixture-member-${index + 1}`,
    baselineWaferId: row.role === "BSL" ? row.waferId : "W01",
    deltaPp: row.role === "BSL" ? null : row.yield - 99.63,
    failCounts: row.failCounts as Record<string, number>,
    failRates: Object.fromEntries(
      Object.entries(row.failCounts as Record<string, number>).map(([parameter, count]) => [
        parameter,
        (count / row.testedDies) * 100,
      ])
    ),
    tone: row.tone as ReportYieldMatrixRow["tone"],
  })),
  lossYieldRows: [
    { rank: 1, parameter: "VGSTX1", failedDieCount: 4775, pareto: 59.87, yieldLoss: 4.66, cumulativeYieldLoss: 4.66, tone: "bad" },
    { rank: 2, parameter: "IGSSP1", failedDieCount: 3050, pareto: 38.24, yieldLoss: 2.98, cumulativeYieldLoss: 7.64, tone: "bad" },
    { rank: 3, parameter: "IGSSPSC", failedDieCount: 97, pareto: 1.22, yieldLoss: 0.09, cumulativeYieldLoss: 7.73, tone: "watch" },
    { rank: 4, parameter: "BVDSS", failedDieCount: 31, pareto: 0.39, yieldLoss: 0.03, cumulativeYieldLoss: 7.76, tone: "neutral" },
    { rank: 5, parameter: "SHORT", failedDieCount: 13, pareto: 0.16, yieldLoss: 0.01, cumulativeYieldLoss: 7.77, tone: "neutral" },
    { rank: 6, parameter: "IDSS_80P", failedDieCount: 6, pareto: 0.08, yieldLoss: 0.01, cumulativeYieldLoss: 7.78, tone: "neutral" },
    { rank: 7, parameter: "IDSS_100P", failedDieCount: 1, pareto: 0.01, yieldLoss: 0, cumulativeYieldLoss: 7.78, tone: "neutral" },
    { rank: 8, parameter: "IGSSN1", failedDieCount: 1, pareto: 0.01, yieldLoss: 0, cumulativeYieldLoss: 7.78, tone: "neutral" },
    { rank: 9, parameter: "IGSSNSC", failedDieCount: 1, pareto: 0.01, yieldLoss: 0, cumulativeYieldLoss: 7.78, tone: "neutral" },
    { rank: 10, parameter: "dVGSTX", failedDieCount: 1, pareto: 0.01, yieldLoss: 0, cumulativeYieldLoss: 7.78, tone: "neutral" },
  ],
  conditionYieldRows: [
    { waferIds: ["W01", "W11", "W25"], stage: "Baseline", step: "BSL", seq: "seq-num-001", condition: "BSL", weightedYield: 98.76, medianYield: 99.51, averageYield: 98.76, minYield: 97.15, maxYield: 99.63, tone: "watch" },
    { waferIds: ["W18", "W19"], stage: "Backside Process", step: "Warpage", seq: "seq-num-001", condition: "1K+Skip clean", weightedYield: 99.7, medianYield: 99.7, averageYield: 99.7, minYield: 99.56, maxYield: 99.83, tone: "good" },
    { waferIds: ["W02"], stage: "Lithography", step: "TR CD", seq: "seq-num-002", condition: "0.75um", weightedYield: 99.71, medianYield: 99.71, averageYield: 99.71, minYield: 99.71, maxYield: 99.71, tone: "good" },
    { waferIds: ["W03"], stage: "Lithography", step: "TR CD", seq: "seq-num-002", condition: "0.83um", weightedYield: 7.78, medianYield: 7.78, averageYield: 7.78, minYield: 7.78, maxYield: 7.78, tone: "bad" },
    { waferIds: ["W04"], stage: "Etch", step: "TR Depth", seq: "seq-num-001", condition: "4.5um", weightedYield: 99.9, medianYield: 99.9, averageYield: 99.9, minYield: 99.9, maxYield: 99.9, tone: "good" },
    { waferIds: ["W05"], stage: "Etch", step: "TR Depth", seq: "seq-num-001", condition: "5.5um", weightedYield: 99.32, medianYield: 99.32, averageYield: 99.32, minYield: 99.32, maxYield: 99.32, tone: "watch" },
    { waferIds: ["W06"], stage: "Etch", step: "TR Depth", seq: "seq-num-001", condition: "4.75um", weightedYield: 99.73, medianYield: 99.73, averageYield: 99.73, minYield: 99.73, maxYield: 99.73, tone: "good" },
    { waferIds: ["W07"], stage: "Etch", step: "TR Depth", seq: "seq-num-001", condition: "5.25um", weightedYield: 99.63, medianYield: 99.63, averageYield: 99.63, minYield: 99.63, maxYield: 99.63, tone: "good" },
    { waferIds: ["W08"], stage: "Clean", step: "Pre clean", seq: "seq-num-001", condition: "HF 30A", weightedYield: 99.66, medianYield: 99.66, averageYield: 99.66, minYield: 99.66, maxYield: 99.66, tone: "good" },
    { waferIds: ["W09"], stage: "Oxidation", step: "LOX", seq: "seq-num-001", condition: "3600A", weightedYield: 99.73, medianYield: 99.73, averageYield: 99.73, minYield: 99.73, maxYield: 99.73, tone: "good" },
  ].map((row, index): ReportYieldConditionRow => ({
    ...row,
    rowId: `fixture-condition-${index + 1}`,
    groupId: `fixture-group-${row.step}-${row.seq}`,
    tone: row.tone as ReportYieldConditionRow["tone"],
  })),
}

const yieldComparisonFixtureGroups = [
  { groupId: "Lithography-TR CD-seq-num-001", stage: "Lithography", step: "TR CD", seq: "seq-num-001", baselineWaferId: "W01", members: [["W01", "BSL", "0.79um"], ["W02", "split-1", "0.75um"], ["W03", "split-2", "0.83um"]] },
  { groupId: "Etch-TR Depth-seq-num-001", stage: "Etch", step: "TR Depth", seq: "seq-num-001", baselineWaferId: "W01", members: [["W01", "BSL", "5um"], ["W04", "split-1", "4.5um"], ["W05", "split-2", "5.5um"]] },
  { groupId: "Etch-TR Depth-seq-num-002", stage: "Etch", step: "TR Depth", seq: "seq-num-002", baselineWaferId: "W01", members: [["W01", "BSL", "5um"], ["W06", "split-1", "4.75um"], ["W07", "split-2", "5.25um"]] },
  { groupId: "Clean-Pre clean-seq-num-001", stage: "Clean", step: "Pre clean", seq: "seq-num-001", baselineWaferId: "W01", members: [["W01", "BSL", "BOE 30A"], ["W08", "split-1", "HF 30A"]] },
  { groupId: "Oxidation-LOX-seq-num-001", stage: "Oxidation", step: "LOX", seq: "seq-num-001", baselineWaferId: "W01", members: [["W01", "BSL", "3900A"], ["W09", "split-1", "3600A"], ["W10", "split-2", "4200A"]] },
  { groupId: "Etch-SG1 ET Depth-seq-num-001", stage: "Etch", step: "SG1 ET Depth", seq: "seq-num-001", baselineWaferId: "W11", members: [["W11", "BSL", "1.18um"], ["W12", "split-1", "1.08um"], ["W13", "split-2", "1.28um"]] },
  { groupId: "Etch-LOX PB-seq-num-001", stage: "Etch", step: "LOX PB", seq: "seq-num-001", baselineWaferId: "W11", members: [["W11", "BSL", "1500A"], ["W14", "split-1", "1200A"], ["W15", "split-2", "1000A"]] },
  { groupId: "Etch-IPO_ET-seq-num-001", stage: "Etch", step: "IPO_ET", seq: "seq-num-001", baselineWaferId: "W11", members: [["W11", "BSL", "IPO Remain~2800A"], ["W16", "split-1", "IPO Remain~2500A"], ["W17", "split-2", "IPO Remain~3100A"]] },
  { groupId: "Backside Process-Warpage-seq-num-001", stage: "Backside Process", step: "Warpage", seq: "seq-num-001", baselineWaferId: "W11", members: [["W11", "BSL", "5K + SPM 5min + SC1 5min"], ["W18", "split-1", "1K+Skip clean"], ["W19", "split-1", "1K+Skip clean"]] },
  { groupId: "Etch-P2_ET-seq-num-001", stage: "Etch", step: "P2_ET", seq: "seq-num-001", baselineWaferId: "W11", members: [["W11", "BSL", "660A"], ["W20", "split-1", "BSL-10%"], ["W21", "split-2", "BSL+10%"]] },
  { groupId: "Wet Clean-Mesa OX Wet Dip-seq-num-001", stage: "Wet Clean", step: "Mesa OX Wet Dip", seq: "seq-num-001", baselineWaferId: "W11", members: [["W11", "BSL", "600A"], ["W22", "split-1", "400A"], ["W23", "split-2", "500A"]] },
  { groupId: "Oxidation-Screen OX-seq-num-001", stage: "Oxidation", step: "Screen OX", seq: "seq-num-001", baselineWaferId: "W11", members: [["W11", "BSL", "1000C 550A"], ["W24", "split-1", "1050C 550A"]] },
  { groupId: "standalone-baseline", stage: "Baseline", step: "Post-run BSL", seq: "seq-num-001", baselineWaferId: "W25", members: [["W25", "BSL", "BSL"]] },
] as const

const yieldComparisonFixturePhysicalRows = new Map(
  (reportYieldAnalysisFixture.matrixRows ?? []).map((row) => [row.waferId, row])
)

const yieldComparisonFixtureMatrixRows: ReportYieldMatrixRow[] =
  yieldComparisonFixtureGroups.flatMap((group) => {
    const baseline = yieldComparisonFixturePhysicalRows.get(group.baselineWaferId)
    if (!baseline) throw new Error(`Missing fixture baseline ${group.baselineWaferId}`)
    return group.members.map(([waferId, role, condition]) => {
      const physical = yieldComparisonFixturePhysicalRows.get(waferId)
      if (!physical) throw new Error(`Missing fixture wafer ${waferId}`)
      return {
        ...physical,
        rowId: `${group.groupId}::${waferId}`,
        memberId: `${group.groupId}::${waferId}`,
        groupId: group.groupId,
        role,
        stage: group.stage,
        step: group.step,
        seq: group.seq,
        condition,
        baselineWaferId: group.baselineWaferId,
        deltaPp:
          role === "BSL" || physical.yield === null || baseline.yield === null
            ? null
            : physical.yield - baseline.yield,
      }
    })
  })

function fixtureMedian(values: number[]) {
  const sorted = [...values].sort((left, right) => left - right)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle]
}

const yieldComparisonFixtureConditionGroups = new Map<string, ReportYieldMatrixRow[]>()
yieldComparisonFixtureMatrixRows.forEach((row) => {
  const key = `${row.groupId}::${row.condition}`
  yieldComparisonFixtureConditionGroups.set(
    key,
    [...(yieldComparisonFixtureConditionGroups.get(key) ?? []), row]
  )
})

const yieldComparisonFixtureConditionRows: ReportYieldConditionRow[] =
  [...yieldComparisonFixtureConditionGroups.entries()].map(([rowId, rows]) => {
    const tested = rows.reduce((sum, row) => sum + (row.testedDies ?? 0), 0)
    const passed = rows.reduce((sum, row) => sum + (row.passDies ?? 0), 0)
    const yields = rows.flatMap((row) => row.yield === null ? [] : [row.yield])
    const weightedYield = tested > 0 ? (passed / tested) * 100 : null
    return {
      rowId,
      groupId: rows[0].groupId,
      waferIds: rows.map((row) => row.waferId),
      stage: rows[0].stage,
      step: rows[0].step,
      seq: rows[0].seq,
      condition: rows[0].condition,
      weightedYield,
      medianYield: yields.length > 0 ? fixtureMedian(yields) : null,
      averageYield: yields.length > 0
        ? yields.reduce((sum, value) => sum + value, 0) / yields.length
        : null,
      minYield: yields.length > 0 ? Math.min(...yields) : null,
      maxYield: yields.length > 0 ? Math.max(...yields) : null,
      tone:
        weightedYield === null
          ? "neutral"
          : weightedYield >= 99.5
            ? "good"
            : weightedYield >= 90
              ? "watch"
              : "bad",
    }
  })

export const reportYieldAnalysisComparisonFixture: ReportYieldAnalysisInput = {
  ...reportYieldAnalysisFixture,
  matrixRows: yieldComparisonFixtureMatrixRows,
  conditionYieldRows: yieldComparisonFixtureConditionRows,
}

const waferYieldCpFailOrder = [
  "W01",
  "W11",
  "W25",
  "W16",
  "W17",
  "W09",
  "W10",
  "W14",
  "W15",
  "W22",
  "W23",
  "W20",
  "W21",
  "W08",
  "W24",
  "W12",
  "W13",
  "W02",
  "W03",
  "W04",
  "W05",
  "W06",
  "W07",
  "W18",
  "W19",
] as const

const waferYieldCpFailParameters = ["VGSTX1", "IGSSP1", "IGSSPSC"] as const

export const reportWaferYieldCpFailFixture: ReportWaferYieldCpFail = {
  title: "Wafer Yield & CP Fail Analysis",
  failThresholdPercent: 2,
  series: waferYieldCpFailParameters.map((parameter) => ({ parameter })),
  wafers: waferYieldCpFailOrder.map((waferId) => {
    const source = reportYieldAnalysisFixture.matrixRows?.find(
      (row) => row.waferId === waferId
    )
    if (!source) {
      throw new Error(`Missing report yield fixture row for ${waferId}`)
    }

    return {
      waferId: source.waferId,
      step: source.role === "BSL" ? "BSL" : source.step,
      condition: source.condition,
      yield: source.yield,
      cpFails: waferYieldCpFailParameters.flatMap((parameter) => {
        const failedDies = source.failCounts[parameter] ?? 0
        return failedDies > 0
          ? [{
              parameter,
              failedDies,
              percent: source.testedDies === null
                ? null
                : (failedDies / source.testedDies) * 100,
            }]
          : []
      }),
    }
  }),
}

export const reportWaferMapFixture: ReportWaferMapInput = {
  title: "Wafer Map",
  subtitle: "Report-level CP final-bin, parameter, and defect wafer-map views.",
  sourceLabel: "REPORT SNAPSHOT",
  mapViews: [
    {
      kind: "cp-final-bin",
      status: "ready",
      wafers: waferMapFinalBinOverviewFixture,
      mapStates: availableMapStates(waferMapFinalBinOverviewFixture),
    },
    {
      kind: "cp-parameter",
      status: "ready",
      parameter: {
        parameterCode: "IDDQ",
        label: "IDDQ",
        unit: "mA",
        scale: { domainMin: 0.7, median: 0.85, domainMax: 1 },
      },
      wafers: waferMapParameterOverviewFixture,
      mapStates: availableMapStates(waferMapParameterOverviewFixture),
    },
    {
      kind: "cp-parameter",
      status: "ready",
      parameter: {
        parameterCode: "BVDSS",
        label: "BVDSS",
        unit: "V",
        scale: { domainMin: 540, median: 582.5, domainMax: 625 },
      },
      wafers: waferMapParameterBvdssOverviewFixture,
      mapStates: availableMapStates(waferMapParameterBvdssOverviewFixture),
    },
    {
      kind: "defect",
      status: "ready",
      layers: [
        { id: "M1", label: "M1" },
        { id: "M2", label: "M2" },
      ],
      selectedLayerId: "M1",
      defectTypes: [
        { id: "particle", label: "Particle" },
        { id: "scratch", label: "Scratch" },
      ],
      selectedDefectTypeIds: ["particle", "scratch"],
      wafers: waferMapDefectOverviewFixture,
      mapStates: availableMapStates(waferMapDefectOverviewFixture),
      coordinateContract: "DEFECT_INDEX_V1",
    },
  ],
  overlayState: {
    status: "unavailable",
    reason: "CP 与 Defect 坐标尚未对齐，不能可靠叠图。",
  },
}

const reportParameterMedianWaferIds = Array.from(
  { length: 25 },
  (_, index) => `W${String(index + 1).padStart(2, "0")}`
)

function parameterMedianTone(cpk: number | null, oos = false) {
  if (oos) return "bad" as const
  if (cpk === null) return "neutral" as const
  if (cpk < 1.33) return "bad" as const
  if (cpk < 1.67) return "watch" as const
  return "good" as const
}

function parameterMedianCells(
  values: [number, number | null, boolean?][]
) {
  return values.map(([value, cpk, oos], index) => ({
    waferId: reportParameterMedianWaferIds[index],
    value,
    cpk,
    oos: Boolean(oos),
    lowYield: ["W03", "W10", "W12", "W25"].includes(
      reportParameterMedianWaferIds[index]
    ),
    tone: parameterMedianTone(cpk, oos),
  }))
}

export const reportParameterMedianFixture: ReportParameterMedianInput = {
  title: "Parameter Median",
  subtitle: "Prototype-backed CP parameter median and CPK matrix by wafer.",
  sourceLabel: "REPORT SNAPSHOT",
  parameterOptions: [
    "IGSSN1",
    "IGSSN2",
    "IGSSNSC",
    "IGSSP1",
    "IGSSP2",
    "IGSSPSC",
    "pre_IGSSN1",
    "pre_IGSSP1",
    "QG_GBr",
    "QG_QGD",
    "QG_QGS",
    "Qg_test",
    "BVDSS",
    "IDSS",
    "VTH",
    "RDS(on)",
  ],
  parameterQuery: "",
  selectedParameterId: "",
  showOosOnly: false,
  oosResultCount: 42,
  waferIds: reportParameterMedianWaferIds,
  stickyHeader: true,
  stickyFirstColumn: true,
  rows: [
    {
      parameter: "IGSSN1",
      unit: "A",
      lsl: -1.71378e-7,
      usl: 1.8671e-7,
      specKind: "MOCK SPEC · Baseline-derived",
      oosCount: 1,
      wafers: parameterMedianCells([
        [7.69277e-9, 3.1], [7.41614e-9, 4.05], [7.45975e-9, 3.24],
        [7.25928e-9, 7.48], [7.1586e-9, 3.24], [7.27856e-9, 5.34],
        [7.16539e-9, 3.8], [7.15306e-9, 3.1], [7.30821e-9, 4.79],
        [7.47845e-9, 0.39], [7.08056e-9, 3.4],
        [3.60637e-7, -0.18, true], [7.40695e-9, 3.8],
        [8.29571e-9, 3.09], [7.42372e-9, 3.59],
        [7.13266e-9, 3.8], [6.98232e-9, 3.25],
        [5.24958e-9, 4.32], [5.50619e-9, 2.86],
        [6.19544e-9, 4.76], [7.78216e-9, 3.8],
        [1.07712e-8, 2.75], [8.82434e-9, 3.56],
        [7.83232e-9, 2.6], [7.66615e-9, 1.01],
      ]),
    },
    {
      parameter: "IGSSN2",
      unit: "A",
      lsl: -1.03105e-7,
      usl: 1.15196e-7,
      specKind: "MOCK SPEC · Baseline-derived",
      oosCount: 1,
      wafers: parameterMedianCells([
        [6.32535e-9, 6.29], [6.02861e-9, 6.31], [6.06975e-9, 4.55],
        [5.87442e-9, 24.12], [5.84606e-9, 2.45], [5.90425e-9, 3.75],
        [5.85416e-9, 24.3], [5.75023e-9, 6.32], [5.89461e-9, 6.32],
        [5.8801e-9, 24.9], [5.73434e-9, 6.32],
        [3.60642e-7, -0.35, true], [6.06006e-9, 3.73],
        [6.89798e-9, 23.5], [6.16477e-9, 6.31],
        [5.84108e-9, 2.9], [5.70281e-9, 6.33],
        [4.48628e-9, 24.69], [4.61151e-9, 2.87],
        [5.14703e-9, 24.08], [6.30571e-9, 6.35],
        [8.30497e-9, 4.47], [6.97528e-9, 24.07],
        [6.37159e-9, 6.33], [6.0457e-9, 0.95],
      ]),
    },
    {
      parameter: "IGSSNSC",
      unit: "A",
      lsl: -0.000120844,
      usl: 0.000120903,
      specKind: "MOCK SPEC · Baseline-derived",
      oosCount: 1,
      wafers: parameterMedianCells([
        [2.8e-8, 8.58], [2.93e-8, 4.95], [2.71e-8, 4.95],
        [2.78e-8, 6.07], [2.76e-8, 2.37], [2.87e-8, 6.07],
        [2.89e-8, 3.83], [2.89e-8, 3.5], [2.87e-8, 6.07],
        [3.14e-8, 3.02], [2.93e-8, 4.29],
        [0.000299996, -0.28, true], [3e-8, 3.83],
        [3.17e-8, 3.23], [3.21e-8, 3.83], [2.86e-8, 3.24],
        [2.99e-8, 3.83], [2.47e-8, 4.29], [2.53e-8, 2.7],
        [2.69e-8, 6.07], [3.17e-8, 4.29], [3.9e-8, 2.85],
        [3.42e-8, 3.24], [2.8e-8, 2.85], [3.26e-8, 0.95],
      ]),
    },
    {
      parameter: "IGSSP1",
      unit: "A",
      lsl: -1.76534e-7,
      usl: 1.83716e-7,
      specKind: "MOCK SPEC · Baseline-derived",
      oosCount: 1,
      wafers: parameterMedianCells([
        [3.92652e-9, 3.09], [3.47131e-9, 4.05], [3.74348e-9, 3.23],
        [3.58477e-9, 7.52], [3.42311e-9, 3.24], [3.50951e-9, 5.34],
        [3.45403e-9, 3.79], [3.40174e-9, 3.1], [3.47632e-9, 4.79],
        [3.72665e-9, 0.39], [3.30669e-9, 3.4],
        [3.58879e-7, -0.17, true], [3.65276e-9, 3.79],
        [4.48927e-9, 3.09], [3.82715e-9, 3.58],
        [3.5102e-9, 3.79], [3.35899e-9, 3.24],
        [2.74667e-9, 4.37], [2.88492e-9, 2.88],
        [3.04499e-9, 4.8], [3.72234e-9, 3.8],
        [4.92287e-9, 2.76], [4.01701e-9, 3.57],
        [3.6473e-9, 2.6], [3.59091e-9, 1.01],
      ]),
    },
    {
      parameter: "QG_GBr",
      unit: "—",
      lsl: -3.8541,
      usl: 4.1041,
      specKind: "MOCK SPEC · Baseline-derived",
      oosCount: 1,
      wafers: parameterMedianCells([
        [0.128023, 8.56], [0.154165, 4.93], [0.0610659, 4.86],
        [0.122089, 6.07], [0.124088, 2.28], [0.127653, 4.95],
        [0.134974, 3.83], [0.121306, 3.5], [0.129389, 6.06],
        [0.10587, 3.03], [0.125, 4.28], [10, -0.22, true],
        [0.143532, 3.82], [0.120163, 3.24], [0.121594, 3.83],
        [0.133877, 3.49], [0.113667, 3.84], [0.130501, 4.28],
        [0.123812, 2.7], [0.121183, 6.07], [0.124893, 4.29],
        [0.116864, 2.85], [0.122606, 3.24], [0.13206, 2.85],
        [0.123856, 0.95],
      ]),
    },
    {
      parameter: "QG_QGD",
      unit: "nC",
      lsl: 9.28657e-9,
      usl: 1.38987e-8,
      specKind: "MOCK SPEC · Baseline-derived",
      oosCount: 1,
      wafers: parameterMedianCells([
        [1.15927e-8, 1.64], [1.09297e-8, 2.11],
        [1.45266e-8, -0.2, true], [1.19595e-8, 1.37],
        [1.1758e-8, 1.53], [1.2014e-8, 1.26],
        [1.17467e-8, 1.56], [1.17355e-8, 1.7],
        [1.05344e-8, 1.38], [1.34346e-8, 0.27],
        [1.17153e-8, 1.57], [1.07988e-8, -0.01],
        [1.21596e-8, 1.45], [1.15621e-8, 1.56],
        [1.13595e-8, 1.62], [1.30407e-8, 0.75],
        [1.0396e-8, 1.12], [1.17354e-8, 1.43],
        [1.16351e-8, 1.74], [1.19206e-8, 1.41],
        [1.14037e-8, 1.66], [1.19311e-8, 1.49],
        [1.17241e-8, 1.95], [1.1748e-8, 1.41],
        [1.15804e-8, 1.72],
      ]),
    },
    {
      parameter: "Qg_test",
      unit: "—",
      lsl: -0.61281,
      usl: 0.61281,
      specKind: "MOCK SPEC · Baseline-derived",
      oosCount: 1,
      wafers: parameterMedianCells([
        [0, 6.52], [0, 6.53], [0, 4.61], [0, null], [0, 2.45],
        [0, 3.76], [0, null], [0, 6.52], [0, 6.53], [0, null],
        [0, 6.53], [2, -0.29, true], [0, 3.76], [0, null],
        [0, 6.53], [0, 3.26], [0, 6.53], [0, null], [0, 2.91],
        [0, null], [0, 6.53], [0, 4.61], [0, null], [0, 6.52],
        [0, 0.95],
      ]),
    },
  ],
}

export const reportCpDataFixture: ReportCpDataInput = {
  title: "CP Data",
  subtitle: "Parent report tab that adapts CP die measurement data into Measurement.",
  sourceLabel: "CP REPORT",
  selectedParameterId: "BVDSS",
  parameterOptions: [
    { label: "BVDSS", value: "BVDSS" },
    { label: "IGSSN1", value: "IGSSN1" },
    { label: "IDSS", value: "IDSS" },
  ],
  measurement: {
    ...measurementFixture,
    title: "Die Measurement Distribution",
    subtitle: "Measurement distribution composed by Report CP Data.",
    sourceLabel: "MEASUREMENT",
  },
}

const inlineMatrixWaferIds = Array.from({ length: 25 }, (_, index) =>
  `W${String(index + 1).padStart(2, "0")}`
)

const inlineMatrixParameterIds = [
  "AMC-SN080T24-HDP-NCMP-GOF-69",
  "AMC-SN080T24-HDP-NCMP-THK-69",
  "AMC-SN080T24-P1CMP-OX-GOF-69",
  "AMC-SN080T24-P1CMP-OX-THK-69",
  "AMC-SN080T24-P2CMP-OX-GOF-69",
  "AMC-SN080T24-P2CMP-OX-THK-69",
  "AMC-SN080T24-SICMP-OX-GOF-69",
  "AMC-SN080T24-SICMP-OX-THK-69",
]

function inlineMatrixCells(parameterIndex: number) {
  const measuredIndexes = parameterIndex === 0
    ? [0, 8]
    : Array.from({ length: Math.min(parameterIndex + 2, 8) }, (_, index) => index)

  return inlineMatrixWaferIds.map((waferId, waferIndex) => {
    if (!measuredIndexes.includes(waferIndex)) {
      return { waferId, median: null, sampleSize: null, cpk: null, status: "MISSING" }
    }

    const isThickness = parameterIndex % 2 === 1
    return {
      waferId,
      median: isThickness
        ? 5867.2 - parameterIndex * 284.1 + waferIndex * 39.8
        : 0.992 + parameterIndex / 1000 + waferIndex / 10000,
      sampleSize: 13,
      cpk: Number((8.19 + parameterIndex * 2.31 + waferIndex * 1.27).toFixed(2)),
      status: "IN_SPEC",
    }
  })
}

export const reportInlineDataFixture: ReportInlineDataInput = {
  status: "partial",
  defaultViewMode: "distribution",
  title: "Inline Data",
  subtitle: "Parent report tab that adapts inline/SPC data into Measurement.",
  sourceLabel: "INLINE REPORT",
  selectedParameterId: inlineMatrixParameterIds[0],
  parameterOptions: inlineMatrixParameterIds,
  summary: { parameterCount: 86, sampleRowCount: 65, rawRowCount: 65, cpkEvaluableCount: 13, limitation: "CPK · SOURCE PROVISIONAL · STEP MAPPING UNAVAILABLE" },
  coverage: inlineMatrixWaferIds.map((waferId, index) => ({ waferId, measured: index < 8 || index === 8 })),
  matrix: inlineMatrixParameterIds.map((parameterId, index) => ({
    parameterId,
    coverageLabel: "SOURCE PROVISIONAL",
    cells: inlineMatrixCells(index),
  })),
  rawDetail: { parameterId: inlineMatrixParameterIds[0], rawPointCount: 65, sampleIds: ["19295376", "19300659"], status: "partial", reason: "Raw coverage is retained from the immutable Snapshot." },
  measurement: {
    ...measurementFixture,
    title: "Wafer × Inline Parameter",
    subtitle: "Measurement distribution composed by Report Inline Data.",
    sourceLabel: "MEASUREMENT",
    referenceLines: [
      { id: "inline-usl", label: "USL", value: 127.67, kind: "formal-spec" },
      { id: "inline-target", label: "Target", value: 95, kind: "target" },
      { id: "inline-lsl", label: "LSL", value: 52.41, kind: "formal-spec" },
    ],
    groups: measurementFixture.groups.slice(0, 5).map((group, index) => ({
      ...group,
      label: ["W01", "W02", "W11", "W18", "W24"][index] ?? group.label,
    })),
  },
}

export { reportCpInlineFitFixture } from "@/components/domain/report-cp-inline-fit.fixtures"
