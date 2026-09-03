import type { WaferMapData } from "@/components/domain/wafer-map-model"
import {
  waferMapEmptyFixture,
  waferMapSmallFixture,
  waferMapW01Fixture,
} from "@/components/domain/wafer-map.fixtures"

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