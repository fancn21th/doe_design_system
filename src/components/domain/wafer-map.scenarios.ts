import type { WaferMapData } from "@/components/domain/wafer-map-model"
import {
  waferMapDefectOverviewFixture,
  waferMapEmptyFixture,
  waferMapFinalBinOverviewFixture,
  waferMapParameterOverviewFixture,
  waferMapSmallFixture,
  waferMapW01Fixture,
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
    },
  },
  pending: {
    name: "pending-base-geometry",
    input: {
      kind: "cp-final-bin",
      status: "pending",
      wafers: waferMapFinalBinOverviewFixture.slice(0, 4),
    },
  },
} satisfies Record<string, { name: string; input: WaferMapGalleryInput }>
