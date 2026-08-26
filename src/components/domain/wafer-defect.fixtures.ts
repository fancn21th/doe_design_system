import type {
  WaferDefectEvidence,
  WaferDefectInput,
  WaferDefectPoint,
  WaferDefectSummary,
} from "@/schemas/domain-component-inputs"

const defectTypes = [
  "Particle",
  "Scratch",
  "Residue",
  "Bridge",
  "Void",
  "Stain",
  "Crack",
  "Unknown",
]

const waferCounts = [
  { waferId: "W01", defectCount: 2 },
  { waferId: "W02", defectCount: 4 },
  { waferId: "W08", defectCount: 2 },
  { waferId: "W11", defectCount: 6 },
  { waferId: "W24", defectCount: 7 },
  { waferId: "W25", defectCount: 9 },
]

function defectEvidence(
  waferId: string,
  dieIndex: number,
  defectIndex: number
): WaferDefectEvidence {
  const type = defectTypes[(dieIndex * 3 + (defectIndex === 2 ? 0 : defectIndex)) % defectTypes.length]

  return {
    id: `DF-${waferId.slice(1)}-${String(dieIndex + 1).padStart(3, "0")}-${String(defectIndex + 1).padStart(2, "0")}`,
    type,
    typeId: `${type.slice(0, 3).toUpperCase()}-${String(21 + dieIndex * 3 + defectIndex).padStart(3, "0")}`,
    image: {
      alt: `${waferId} ${type} illustrative defect evidence`,
      source: "illustrative",
    },
  }
}

function defectPoints(waferId: string, defectCount: number): WaferDefectPoint[] {
  const dieCount = Math.max(1, Math.ceil(defectCount / 3))
  const allocations = Array.from({ length: dieCount }, () => 1)

  for (let remaining = defectCount - dieCount, index = 0; remaining > 0; remaining -= 1, index += 1) {
    allocations[index % dieCount] += 1
  }

  return allocations.map((count, index) => ({
    id: `DIE-${waferId.slice(1)}-${String(index + 1).padStart(3, "0")}`,
    coordinate: {
      x: (14 + index * 29) % 100,
      y: (24 + index * 37) % 100,
      source: "illustrative",
    },
    mapPosition: {
      x: 82 + (index * 91) % 210,
      y: 78 + (index * 117) % 210,
      source: "illustrative",
    },
    defects: Array.from({ length: count }, (_, defectIndex) =>
      defectEvidence(waferId, index, defectIndex)
    ),
  }))
}

export const waferDefectWafersFixture: WaferDefectSummary[] = waferCounts.map(
  ({ waferId, defectCount }) => ({
    waferId,
    defectCount,
    sampledAt: "2026-04-11 02:27:41",
    points: defectPoints(waferId, defectCount),
    source: {
      count: "spc",
      sampledAt: "spc",
      position: "illustrative",
      image: "illustrative",
    },
  })
)

export const waferDefectFixture: Required<WaferDefectInput> = {
  title: "Wafer Defect Map",
  subtitle: "按异常Wafer查看缺陷数量、类型、Die位置与缺陷明细",
  sourceLabel: "SPC DEFECT",
  sourceNote:
    "Source-backed: Wafer缺陷数量与采样时间来自SPC；点位、坐标、类型和缺陷图为原型示意。",
  wafers: waferDefectWafersFixture,
  selectedWaferId: "W01",
  readonly: true,
}

export const waferDefectManyTypesFixture: Required<WaferDefectInput> = {
  ...waferDefectFixture,
  selectedWaferId: "W25",
}

export const waferDefectNoImageFixture: Required<WaferDefectInput> = {
  ...waferDefectFixture,
  wafers: waferDefectWafersFixture.map((wafer) => ({
    ...wafer,
    source: {
      ...wafer.source,
      image: "unknown",
    },
    points: wafer.points.map((point) => ({
      ...point,
      defects: point.defects.map((defect) => ({
        ...defect,
        image: undefined,
      })),
    })),
  })),
}

export const waferDefectEmptyFixture: Required<WaferDefectInput> = {
  ...waferDefectFixture,
  wafers: [],
  selectedWaferId: "",
}
