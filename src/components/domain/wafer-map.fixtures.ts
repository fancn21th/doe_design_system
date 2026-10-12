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

/** Mock colour-contract case: source CP status intentionally contradicts bin names. */
export const waferMapSemanticColorFixture: WaferMapFinalBinWaferInput = {
  mapId: "mock-semantic-final-bin",
  waferId: "MOCK-CP-STATUS",
  geometry: {
    coordinateSystem: "CP_DIE_GRID_V1",
    dies: [...waferMapSmallFixture.dies],
    bounds: waferMapSmallFixture.bounds,
  },
  dies: waferMapSmallFixture.dies.map((die, index) => ({
    ...die,
    finalBin: ["PASS", "PASS", "NON_NUMERIC_FAILURE", "1", "FAIL"][index],
    pass: index === 0 || index === 4,
  })),
  summary: { pass: 2, fail: 3 },
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

function parameterInspection(values: Array<number | null>, lsl: number | null, usl: number | null, unit: string) {
  const valid = values.filter((value): value is number => value !== null).sort((a, b) => a - b)
  const mean = valid.reduce((sum, value) => sum + value, 0) / valid.length
  const stddev = Math.sqrt(valid.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (valid.length - 1))
  const sides = [lsl === null ? null : (mean - lsl) / (3 * stddev), usl === null ? null : (usl - mean) / (3 * stddev)].filter((value): value is number => value !== null)
  // Mock derivation only; Domain UI consumes the Backend's percentages.
  const uniformityPercent = mean === 0 ? null : stddev / mean * 100
  const hiLoVariationPercent = mean === 0 ? null : (valid[valid.length - 1] - valid[0]) / (2 * mean) * 100
  return { uniformityPercent, hiLoVariationPercent, uniformityStatus: mean === 0 ? "ZERO_MEAN" : "AVAILABLE", hiLoVariationStatus: mean === 0 ? "ZERO_MEAN" : "AVAILABLE", sampleCount: valid.length, mean, stddev, min: valid[0], max: valid[valid.length - 1], median: valid[Math.floor(valid.length / 2)], cpk: Math.min(...sides), cpkStatus: "AVAILABLE", lsl, usl, unit }
}

/** Mock fixture computation only; production CP rates arrive from Backend. */
function parameterCpSummary(summary: { pass: number; fail: number }) {
  const testedDieCount = summary.pass + summary.fail
  return { status: "AVAILABLE" as const, testedDieCount, passDieCount: summary.pass, failDieCount: summary.fail, passRatePercent: ratePercent(summary.pass, testedDieCount), failRatePercent: ratePercent(summary.fail, testedDieCount) }
}

export const waferMapParameterOverviewFixture: WaferMapParameterWaferInput[] = waferIds.map((waferId, waferIndex) => {
  const dies = waferMapW01Dies.map((die, dieIndex) => {
    const pass = (dieIndex + waferIndex * 29) % 173 !== 0
    const status = dieIndex % 541 === 0 ? "MISSING" as const : "VALID" as const
    const value = status === "MISSING" ? null : 0.72 + ((die.x * 3 + die.y * 5 + waferIndex * 17 + 500) % 260) / 1000
    return { ...die, finalBin: pass ? "PASS" : "FAIL", binCode: pass ? "1" : "10", binDescription: pass ? "PASS" : "FAIL", pass, value, status }
  })
  const summary = summaryFor(dies)
  return {
    mapId: `cp-parameter:IDDQ:${waferId}`,
    waferId,
    geometry,
    dies,
    summary,
    cpSummary: parameterCpSummary(summary),
    inspection: parameterInspection(dies.map((die) => die.value), 0.7, 1, "mA"),
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
    cpSummary: parameterCpSummary(summary),
    inspection: parameterInspection(dies.map((die) => die.value), 500, null, "V"),
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
