import type { WaferMapData } from "@/components/domain/wafer-map-model"
import {
  waferMapDefectOverviewFixture,
  waferMapEmptyFixture,
  waferMapFinalBinOverviewFixture,
  waferMapParameterOverviewFixture,
  waferMapSmallFixture,
  waferMapSemanticColorFixture,
  waferMapW01Fixture,
  availableMapStates,
} from "@/components/domain/wafer-map.fixtures"
import type { WaferMapGalleryInput } from "@/schemas/domain-component-inputs"

type WaferMapScenario = {
  name: string
  data: WaferMapData
}

export const waferMapScenarios = {
  base: {
    name: "base",
    data: waferMapSmallFixture,
  },
  w01RealGeometry: {
    name: "w01-real-geometry",
    data: waferMapW01Fixture,
  },
  empty: {
    name: "empty",
    data: waferMapEmptyFixture,
  },
} satisfies Record<string, WaferMapScenario>

export const waferMapGalleryScenarios = {
  cpDefectSummary: {
    name: "cp-independent-default-layer-defect-summary",
    input: {
      kind: "cp-final-bin", status: "ready",
      wafers: waferMapFinalBinOverviewFixture.slice(0, 3).map((wafer, index) => ({ ...wafer, defectSummary: { status: index === 0 ? "AVAILABLE" as const : index === 1 ? "EMPTY" as const : "UNAVAILABLE" as const, layerId: "EOL", defectDieCount: index === 0 ? 142 : null, ...(index === 2 ? { unavailableReason: "缺陷统计未提供。" } : {}) } })),
    },
  },
  parameterVariationUnavailable: {
    name: "parameter-zero-mean-variation-unavailable",
    // Mock symmetric population: 2,049 negative + one zero + 2,049 positive values.
    input: {
      kind: "cp-parameter",
      status: "ready",
      parameter: { parameterCode: "ZERO_MEAN", label: "零均值参数（Mock）", unit: "mA", scale: { domainMin: -1, median: 0, domainMax: 1 } },
      wafers: [{
        ...waferMapParameterOverviewFixture[0],
        mapId: "cp-parameter:ZERO_MEAN:W01",
        dies: waferMapParameterOverviewFixture[0].dies.map((die, index) => ({ ...die, value: index < 2049 ? -1 : index === 2049 ? 0 : 1, status: "VALID" as const })),
        inspection: { sampleCount: 4099, mean: 0, stddev: 1, min: -1, max: 1, median: 0, cpk: null, cpkStatus: "NO_SPEC", lsl: null, usl: null, unit: "mA", uniformityPercent: null, hiLoVariationPercent: null, uniformityStatus: "ZERO_MEAN", hiLoVariationStatus: "ZERO_MEAN" },
      }],
    },
  },
  parameterCpSummaryUnavailable: {
    name: "parameter-cp-summary-unavailable",
    input: {
      kind: "cp-parameter",
      status: "ready",
      parameter: { parameterCode: "IDDQ", label: "IDDQ（Mock）", unit: "mA", scale: { domainMin: 0.7, median: 0.85, domainMax: 1 } },
      wafers: [{
        ...waferMapParameterOverviewFixture[0],
        cpSummary: { status: "UNAVAILABLE", testedDieCount: null, passDieCount: null, failDieCount: null, passRatePercent: null, failRatePercent: null, unavailableReason: "MAP_TEST_IDENTITY_MISMATCH" },
      }],
    },
  },
  oneSidedParameter: {
    name: "single-sided-parameter-capability",
    // Mock UI fixture: exercises nullable specifications and negative capability.
    input: {
      kind: "cp-parameter",
      status: "ready",
      parameter: { parameterCode: "LOWER_BOUND_PARAMETER", label: "单边规格参数（Mock）", unit: "V", lsl: 81.2, usl: null, scale: { domainMin: 70, median: 89, domainMax: 100 } },
      wafers: [{
        ...waferMapParameterOverviewFixture[0],
        mapId: "cp-parameter:LOWER_BOUND_PARAMETER:W01",
        inspection: { sampleCount: 4099, mean: 89.2707, stddev: 5.1994, min: null, max: null, median: null, cpk: 0.5174070712855903, cpkStatus: "AVAILABLE", lsl: 81.2, usl: null, unit: "V" },
      }],
    },
  },
  defectAggregates: {
    name: "multi-record-die-unresolved-classes",
    // Mock aggregate + delivered record fixture; record IDs are fixture-only.
    input: {
      kind: "defect",
      status: "ready",
      layers: [{ id: "EOL", label: "EOL" }],
      selectedLayerId: "EOL",
      defectTypes: [{ id: "class:206", label: "206（名称未解析）" }, { id: "class:212", label: "212（名称未解析）" }],
      selectedDefectTypeIds: [],
      wafers: [{
        mapId: "defect:EOL:W01", waferId: "W01",
        geometry: { coordinateSystem: "DEFECT_INDEX_V1", dies: [{ id: "-19:5", x: -19, y: 5 }], bounds: { minX: -19, maxX: -19, minY: 5, maxY: 5 } },
        dies: [{ id: "-19:5", x: -19, y: 5, defects: [{ id: "0", layerId: "EOL", typeId: "class:206", typeLabel: "206（名称未解析）", classNumber: 206, sizeX: 1.25, sizeY: null, waferX: -12.5, waferY: 0, imageCount: 0 }, { id: "DEMO-RECORD-2", layerId: "EOL", typeId: "class:212", typeLabel: "212（名称未解析）", classNumber: 212 }, { id: "DEMO-RECORD-3", layerId: "EOL", typeId: "class:212", typeLabel: "212（名称未解析）", classNumber: 212 }], defectRecordsStatus: "AVAILABLE", defectCount: 3, classBreakdownStatus: "AVAILABLE", classBreakdown: [{ typeId: "class:206", label: "206（名称未解析）", nameResolved: false, count: 1 }, { typeId: "class:212", label: "212（名称未解析）", nameResolved: false, count: 2 }] }],
        summary: { pass: 0, fail: 1 },
        inspection: { byLayer: [{ layerId: "EOL", testedDieCount: 1, defectDieCount: 1, defectRecordCount: 4, inGridRecordCount: 3, outsideGridCount: 1, rows: [{ typeId: "class:206", label: "206（名称未解析）", nameResolved: false, count: 1, ratePercent: 100 }, { typeId: "class:212", label: "212（名称未解析）", nameResolved: false, count: 3, ratePercent: 300 }] }] },
      }],
    },
  },
  semanticFinalBins: {
    name: "mock-cp-status-over-bin-label",
    input: {
      kind: "cp-final-bin",
      status: "ready",
      wafers: [waferMapSemanticColorFixture],
      mapStates: availableMapStates([waferMapSemanticColorFixture]),
    },
  },
  finalBinOverview: {
    name: "cp-final-bin-overview",
    input: {
      kind: "cp-final-bin",
      status: "ready",
      wafers: waferMapFinalBinOverviewFixture,
      mapStates: availableMapStates(waferMapFinalBinOverviewFixture),
    },
  },
  parameterOverview: {
    name: "cp-parameter-overview",
    input: {
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
  },
  defectOverview: {
    name: "defect-overview",
    input: {
      kind: "defect",
      status: "ready",
      layers: [{ id: "M1", label: "M1" }, { id: "M2", label: "M2" }],
      selectedLayerId: "M1",
      defectTypes: [{ id: "particle", label: "Particle" }, { id: "scratch", label: "Scratch" }],
      selectedDefectTypeIds: ["particle", "scratch"],
      wafers: waferMapDefectOverviewFixture,
      mapStates: availableMapStates(waferMapDefectOverviewFixture),
      coordinateContract: "DEFECT_INDEX_V1",
    },
  },
  defectLayerCoverage: {
    name: "defect-selected-layer-coverage",
    input: {
      kind: "defect",
      status: "ready",
      layers: [{ id: "EOL", label: "EOL" }],
      selectedLayerId: "EOL",
      defectTypes: [{ id: "particle", label: "Particle" }],
      selectedDefectTypeIds: [],
      // Only these two selected-layer maps have coordinate payloads. The other
      // 23 cards intentionally contain no geometry and must render as empty.
      wafers: waferMapDefectOverviewFixture.slice(0, 2).map((wafer) => ({
        ...wafer,
        mapId: `defect:EOL:${wafer.waferId}`,
      })),
      mapStates: waferMapDefectOverviewFixture.map((wafer, index) => ({
        mapId: `defect:EOL:${wafer.waferId}`,
        waferId: wafer.waferId,
        availability: index < 2 ? "available" as const : "empty" as const,
      })),
      coordinateContract: "RAW-INDEX-V1",
    },
  },
  partial: {
    name: "partial-map-payload",
    input: {
      kind: "cp-final-bin",
      status: "ready",
      wafers: waferMapFinalBinOverviewFixture.slice(0, 1),
      mapStates: [
        {
          mapId: waferMapFinalBinOverviewFixture[0]!.mapId,
          waferId: "W01",
          availability: "partial",
          reason: "仅返回可用 Die；完整 Final Bin 快照仍在生成。",
        },
        {
          mapId: "cp-final-bin:W02",
          waferId: "W02",
          availability: "unavailable",
          reason: "权威 CP Map 尚未提供。",
        },
      ],
    },
  },
  inspectionUnavailable: {
    name: "map-without-inspection-statistics",
    input: {
      kind: "cp-parameter",
      status: "ready",
      parameter: {
        parameterCode: "IDDQ",
        label: "IDDQ",
        unit: "mA",
        scale: { domainMin: 0.7, median: 0.85, domainMax: 1 },
      },
      // The value, validity and CP result are authoritative per-Die facts.
      // Parameter statistics are intentionally absent, not inferred.
      wafers: waferMapParameterOverviewFixture.slice(0, 1).map((source) => {
        const wafer = { ...source }
        delete wafer.inspection
        // Parameter L1 need not repeat CP Final Bin / pass facts.
        const dies = wafer.dies.map((sourceDie) => {
          const die = { ...sourceDie }
          delete die.finalBin
          delete die.binCode
          delete die.binDescription
          delete die.pass
          die.cpUnavailableReason = "CP_MAP_IDENTITY_UNAVAILABLE"
          return die
        })
        return {
          ...wafer,
          dies,
          inspectionUnavailableReason: "BFF 尚未提供单片 Parameter 统计。",
        }
      }),
      mapStates: availableMapStates(waferMapParameterOverviewFixture.slice(0, 1)),
    },
  },
  summaryUnavailable: {
    name: "map-without-wafer-summary",
    input: {
      kind: "cp-parameter",
      status: "ready",
      parameter: {
        parameterCode: "IDDQ",
        label: "IDDQ",
        unit: "mA",
        scale: { domainMin: 0.7, median: 0.85, domainMax: 1 },
      },
      // A selected Parameter slice can be drawable while yield totals are not.
      wafers: waferMapParameterOverviewFixture.slice(0, 1).map((source) => {
        return {
          ...source,
          summary: null,
          summaryUnavailableReason: "选中 Parameter slice 未提供 yield summary。",
        }
      }),
      mapStates: availableMapStates(waferMapParameterOverviewFixture.slice(0, 1)),
    },
  },
  pending: {
    name: "pending-base-geometry",
    input: {
      kind: "cp-final-bin",
      status: "pending",
      wafers: waferMapFinalBinOverviewFixture.slice(0, 4),
      mapStates: availableMapStates(waferMapFinalBinOverviewFixture.slice(0, 4)),
    },
  },
} satisfies Record<string, { name: string; input: WaferMapGalleryInput }>
