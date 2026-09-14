import waferCoordinates from "@/components/domain/wafer-map-w01-dies.json"
import type { MeasurementInput, MeasurementPoint, MeasurementSummary } from "@/schemas/domain-component-inputs"

const WAFER_COUNT = 25
const DIES_PER_WAFER = 4099

if (waferCoordinates.length !== DIES_PER_WAFER) {
  throw new Error(`Measurement fixture requires exactly ${DIES_PER_WAFER} die coordinates.`)
}

function quantile(sorted: number[], percentile: number) {
  const position = (sorted.length - 1) * percentile
  const lower = Math.floor(position)
  const upper = Math.ceil(position)
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower)
}

function summarise(points: MeasurementPoint[]): MeasurementSummary {
  const values = points.map((point) => point.value).sort((left, right) => left - right)
  const count = values.length
  const mean = values.reduce((total, value) => total + value, 0) / count
  const variance = values.reduce((total, value) => total + (value - mean) ** 2, 0) / Math.max(count - 1, 1)
  const q1 = quantile(values, 0.25)
  const q3 = quantile(values, 0.75)
  const iqr = q3 - q1
  const lowerFence = q1 - iqr * 1.5
  const upperFence = q3 + iqr * 1.5
  return {
    count,
    min: values[0],
    q1,
    median: quantile(values, 0.5),
    q3,
    max: values.at(-1) ?? null,
    whiskerLow: values.find((value) => value >= lowerFence) ?? values[0],
    whiskerHigh: values.findLast((value) => value <= upperFence) ?? values.at(-1) ?? null,
    mean,
    sampleSigma: Math.sqrt(variance),
  }
}

function createPoints(waferIndex: number, waferId: string): MeasurementPoint[] {
  const center = 89 + ((waferIndex * 11) % 9) * 0.42
  return waferCoordinates.map(([x, y], dieIndex) => {
    const ripple = Math.sin((x * 7 + y * 13 + waferIndex * 29) * 0.19) * 1.25
    const local = ((dieIndex * 17 + waferIndex * 23) % 19) * 0.045
    let value = center + ripple + local
    if (dieIndex % 571 === 0) value = 0.2 + ((waferIndex + dieIndex) % 7) * 0.15
    else if (dieIndex % 401 === 0) value = 9 + ((waferIndex * 3 + dieIndex) % 8)
    else if (dieIndex % 223 === 0) value = 72 + ((waferIndex + dieIndex) % 12)
    return {
      id: `${waferId}:${x}:${y}`,
      x,
      y,
      value,
      sourceStatus: "PHYSICAL_VALID",
      finalBin: dieIndex % 571 === 0 ? "8" : "1",
      result: dieIndex % 571 === 0 ? "FAIL" : "PASS",
    }
  })
}

function createGroup(waferIndex: number) {
  const waferId = `W${String(waferIndex + 1).padStart(2, "0")}`
  const points = createPoints(waferIndex, waferId)
  return {
    id: waferId,
    label: waferId,
    role: waferIndex < 3 ? "baseline" as const : "experiment" as const,
    comparison: waferIndex < 3
      ? { cohortId: "bsl-clean-01", role: waferIndex === 0 ? "baseline" as const : "variant" as const }
      : { cohortId: `exp-${Math.floor((waferIndex - 3) / 3) + 1}`, role: waferIndex % 3 === 0 ? "baseline" as const : "variant" as const },
    context: {
      stage: waferIndex < 3 ? "BSL" : `EXP-${String((waferIndex % 5) + 1).padStart(2, "0")}`,
      step: waferIndex < 3 ? "Pre clean" : "Clean",
      sequence: `seq-num-${String(waferIndex + 1).padStart(3, "0")}`,
      condition: waferIndex < 3 ? "HF 30A" : `HF ${30 + (waferIndex % 3) * 5}A`,
    },
    capability: {
      cpk: 2.14 + (waferIndex % 7) * 0.07,
      cpu: 2.31 + (waferIndex % 5) * 0.06,
      cpl: 2.08 + (waferIndex % 6) * 0.06,
    },
    summary: summarise(points),
    points,
  }
}

const fullGroups = Array.from({ length: WAFER_COUNT }, (_, index) => createGroup(index))

/** Full-scale fixture for labs, tests, and visual performance verification (25 × 4,099 dies). */
export const measurementFixture: MeasurementInput = {
  status: "ready",
  title: "Die Measurement Distribution",
  subtitle: "Full physical-valid die cloud with wafer summaries and selectable wafer columns.",
  sourceLabel: "CP REPORT",
  metric: { id: "BVDSS", label: "BVDSS", unit: "V" },
  groups: fullGroups,
  referenceLines: [
    { id: "mock-usl", label: "Mock USL", value: 127.67, kind: "mock-spec" },
    { id: "mock-lsl", label: "Mock LSL", value: 52.41, kind: "mock-spec" },
  ],
}

/** A compact fixture for downstream app stories where full-cloud load is not under test. */
export const measurementSmallFixture: MeasurementInput = {
  ...measurementFixture,
  title: "Measurement compact fixture",
  groups: fullGroups.slice(0, 3).map((group) => {
    const points = group.points.slice(0, 80)
    return { ...group, points, summary: summarise(points) }
  }),
}

export const measurementEmptyFixture: MeasurementInput = {
  status: "ready",
  title: "Measurement",
  subtitle: "No source measurement groups supplied.",
  metric: { id: "BVDSS", label: "BVDSS", unit: "V" },
  groups: [],
  referenceLines: [],
}

export const measurementPendingFixture: MeasurementInput = { ...measurementEmptyFixture, status: "pending" }
export const measurementUnavailableFixture: MeasurementInput = { ...measurementEmptyFixture, status: "unavailable" }
