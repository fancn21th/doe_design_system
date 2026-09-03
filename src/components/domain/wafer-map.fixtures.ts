import waferMapW01Coordinates from "@/components/domain/wafer-map-w01-dies.json"
import {
  calculateWaferBounds,
  createDieId,
  type DieData,
  type WaferMapData,
} from "@/components/domain/wafer-map-model"

const waferMapW01Dies: readonly DieData[] = waferMapW01Coordinates.map(([x, y]) => ({
  id: createDieId(x, y),
  x,
  y,
}))

export const waferMapW01Fixture: WaferMapData = {
  id: "W01",
  dies: waferMapW01Dies,
  bounds: calculateWaferBounds(waferMapW01Dies),
}

export const waferMapSmallFixture: WaferMapData = {
  id: "DEMO-01",
  dies: [
    { id: createDieId(-1, 0), x: -1, y: 0 },
    { id: createDieId(0, -1), x: 0, y: -1 },
    { id: createDieId(0, 0), x: 0, y: 0 },
    { id: createDieId(0, 1), x: 0, y: 1 },
    { id: createDieId(1, 0), x: 1, y: 0 },
  ],
  bounds: { minX: -1, maxX: 1, minY: -1, maxY: 1 },
}

export const waferMapEmptyFixture: WaferMapData = {
  id: "EMPTY",
  dies: [],
  bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
}