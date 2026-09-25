import type { WaferMapData } from "@/components/domain/wafer-map-model"
import {
  waferMapDefectOverviewFixture,
  waferMapEmptyFixture,
  waferMapFinalBinOverviewFixture,
  waferMapParameterOverviewFixture,
  waferMapSmallFixture,
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
      // CP × Defect classifications are intentionally absent, not inferred.
      wafers: waferMapParameterOverviewFixture.slice(0, 1).map((source) => {
        const wafer = { ...source }
        delete wafer.inspection
        // Parameter L1 need not repeat CP Final Bin / pass facts.
        const dies = wafer.dies.map((sourceDie) => {
          const die = { ...sourceDie }
          delete die.finalBin
          delete die.pass
          return die
        })
        return {
          ...wafer,
          dies,
          inspectionUnavailableReason: "BFF 尚未提供 CP × Defect 分类统计。",
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
