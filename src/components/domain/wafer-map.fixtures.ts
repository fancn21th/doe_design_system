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
  WaferMapMapState,
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

export function availableMapStates(
  wafers: ReadonlyArray<{ mapId: string; waferId: string }>,
): WaferMapMapState[] {
  return wafers.map((wafer) => ({
    mapId: wafer.mapId,
    waferId: wafer.waferId,
    availability: "available",
  }))
}
const bins = ["1", "13", "10", "31", "19", "12", "9"] as const
const binDescriptions: Record<string, string> = {
  "1": "PASS",
  "9": "SHORT",
  "10": "LEAKAGE",
  "12": "VTH",
  "13": "RDS(ON)",
  "19": "BVDSS",
  "31": "Default",
}

function ratePercent(count: number, total: number) {
  return total === 0 ? 0 : Number(((count / total) * 100).toFixed(2))
}

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
  const summary = summaryFor(dies)
  const counts = new Map<string, number>()
  for (const die of dies) counts.set(die.finalBin, (counts.get(die.finalBin) ?? 0) + 1)
  const rows = [...counts.entries()]
    .sort(([left], [right]) => Number(left) - Number(right))
    .map(([binCode, count]) => ({
      binCode,
      binDescription: binDescriptions[binCode] ?? "Unclassified",
      count,
      ratePercent: ratePercent(count, dies.length),
    }))

  return {
    mapId: `cp-final-bin:${waferId}`,
    waferId,
    geometry,
    dies,
    summary,
    inspection: {
      testedDieCount: dies.length,
      totalFailBinCount: summary.fail,
      totalFailBinRatePercent: ratePercent(summary.fail, dies.length),
      rows,
    },
  }
}

export const waferMapFinalBinOverviewFixture: WaferMapFinalBinWaferInput[] = waferIds.map(finalBinWafer)

function parameterInspection(pass: number, fail: number, waferIndex: number) {
  const testedDieCount = pass + fail
  const defectDieCount = Math.min(pass, 75 + ((waferIndex * 11) % 28))
  const failDefectCount = Math.min(fail, waferIndex % 3)
  const counts = [
    { classification: "cp-fail-defect" as const, label: "CP Fail & Defect", count: failDefectCount },
    { classification: "cp-pass-defect" as const, label: "CP Pass & Defect", count: defectDieCount },
    { classification: "cp-pass-no-defect" as const, label: "CP Pass & No Defect", count: pass - defectDieCount },
    { classification: "cp-fail-no-defect" as const, label: "CP Fail & No Defect", count: fail - failDefectCount },
  ]
  return {
    testedDieCount,
    rows: counts.map((row) => ({ ...row, ratePercent: ratePercent(row.count, testedDieCount) })),
  }
}

export const waferMapParameterOverviewFixture: WaferMapParameterWaferInput[] = waferIds.map((waferId, waferIndex) => {
  const dies = waferMapW01Dies.map((die, dieIndex) => {
    const pass = (dieIndex + waferIndex * 29) % 173 !== 0
    const status = dieIndex % 541 === 0 ? "MISSING" as const : "VALID" as const
    const value = status === "MISSING" ? null : 0.72 + ((die.x * 3 + die.y * 5 + waferIndex * 17 + 500) % 260) / 1000
    return { ...die, finalBin: pass ? "1" : "10", pass, value, status }
  })
  const summary = summaryFor(dies)
  return {
    mapId: `cp-parameter:IDDQ:${waferId}`,
    waferId,
    geometry,
    dies,
    summary,
    inspection: parameterInspection(summary.pass, summary.fail, waferIndex),
  }
})

export const waferMapParameterBvdssOverviewFixture: WaferMapParameterWaferInput[] = waferIds.map((waferId, waferIndex) => {
  const dies = waferMapW01Dies.map((die, dieIndex) => {
    const pass = (dieIndex * 7 + waferIndex * 31) % 211 !== 0
    const status = dieIndex % 487 === 0 ? "MISSING" as const : "VALID" as const
    const value = status === "MISSING" ? null : 540 + ((die.x * 11 + die.y * 7 + waferIndex * 23 + 1600) % 850) / 10
    return { ...die, finalBin: pass ? "1" : "10", pass, value, status }
  })
  const summary = summaryFor(dies)
  return {
    mapId: `cp-parameter:BVDSS_100u:${waferId}`,
    waferId,
    geometry,
    dies,
    summary,
    inspection: parameterInspection(summary.pass, summary.fail, waferIndex),
  }
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
  const byLayer = ["M1", "M2"].map((layerId) => {
    const layerDefects = dies.flatMap((die) => die.defects.filter((defect) => defect.layerId === layerId))
    const layerDefectDies = dies.filter((die) => die.defects.some((defect) => defect.layerId === layerId))
    const typeCounts = new Map<string, { label: string; count: number }>()
    for (const defect of layerDefects) {
      const current = typeCounts.get(defect.typeId)
      typeCounts.set(defect.typeId, { label: defect.typeLabel, count: (current?.count ?? 0) + 1 })
    }
    return {
      layerId,
      defectDieCount: layerDefectDies.length,
      defectRecordCount: layerDefects.length,
      rows: [...typeCounts.entries()].map(([typeId, row]) => ({
        typeId,
        label: row.label,
        count: row.count,
        ratePercent: ratePercent(row.count, layerDefects.length),
      })),
    }
  })
  const defectDieCount = dies.filter((die) => die.defects.length > 0).length
  return {
    mapId: `defect:M1:${waferId}`,
    waferId,
    geometry: { ...geometry, coordinateSystem: "DEFECT_INDEX_V1" as const },
    dies,
    summary: { pass: dies.length - defectDieCount, fail: defectDieCount },
    inspection: { byLayer },
  }
})
