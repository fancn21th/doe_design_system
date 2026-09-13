import waferMapW01Coordinates from "@/components/domain/wafer-map-w01-dies.json"
import {
  calculateWaferBounds,
  createDieId,
  type DieData,
  type WaferMapData,
} from "@/components/domain/wafer-map-model"
import type {
  WaferMapDefectWaferInput,
  WaferMapFinalBinWaferInput,
  WaferMapParameterWaferInput,
} from "@/schemas/domain-component-inputs"

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

const geometry = {
  coordinateSystem: "CP_DIE_GRID_V1" as const,
  dies: [...waferMapW01Dies],
  bounds: waferMapW01Fixture.bounds,
}

const waferIds = Array.from({ length: 25 }, (_, index) => `W${String(index + 1).padStart(2, "0")}`)
const bins = ["1", "13", "10", "31", "19", "12", "9"] as const

function summaryFor(dies: ReadonlyArray<{ pass: boolean }>) {
  const pass = dies.filter((die) => die.pass).length
  return { pass, fail: dies.length - pass }
}

function finalBinWafer(waferId: string, waferIndex: number): WaferMapFinalBinWaferInput {
  const dies = waferMapW01Dies.map((die, dieIndex) => {
    const failure = waferIndex === 2
      ? dieIndex % 10 !== 0
      : (dieIndex + waferIndex * 29) % 173 === 0
    const finalBin = failure ? bins[(dieIndex + waferIndex) % bins.length] : "1"
    return { ...die, finalBin, pass: !failure }
  })
  return { waferId, geometry, dies, summary: summaryFor(dies) }
}

export const waferMapFinalBinOverviewFixture: WaferMapFinalBinWaferInput[] = waferIds.map(finalBinWafer)

export const waferMapParameterOverviewFixture: WaferMapParameterWaferInput[] = waferIds.map((waferId, waferIndex) => {
  const dies = waferMapW01Dies.map((die, dieIndex) => {
    const pass = (dieIndex + waferIndex * 29) % 173 !== 0
    const status = dieIndex % 541 === 0 ? "MISSING" as const : "VALID" as const
    const value = status === "MISSING" ? null : 0.72 + ((die.x * 3 + die.y * 5 + waferIndex * 17 + 500) % 260) / 1000
    return { ...die, finalBin: pass ? "1" : "10", pass, value, status }
  })
  return { waferId, geometry, dies, summary: summaryFor(dies) }
})

export const waferMapDefectOverviewFixture: WaferMapDefectWaferInput[] = waferIds.map((waferId, waferIndex) => {
  const dies = waferMapW01Dies.map((die, dieIndex) => {
    const defects = (dieIndex + waferIndex * 47) % 197 === 0
      ? [{ id: `${waferId}-${die.id}-particle`, layerId: "M1", typeId: "particle", typeLabel: "Particle" }]
      : (dieIndex + waferIndex * 19) % 389 === 0
        ? [{ id: `${waferId}-${die.id}-scratch`, layerId: "M2", typeId: "scratch", typeLabel: "Scratch" }]
        : []
    return { ...die, defects }
  })
  return { waferId, geometry: { ...geometry, coordinateSystem: "DEFECT_INDEX_V1" as const }, dies, summary: { pass: 4099 - dies.filter((die) => die.defects.length > 0).length, fail: dies.filter((die) => die.defects.length > 0).length } }
})
