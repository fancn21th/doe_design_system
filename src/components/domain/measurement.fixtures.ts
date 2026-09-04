import type { MeasurementInput } from "@/schemas/domain-component-inputs"

const groups = Array.from({ length: 13 }, (_, index) => {
  const wafer = `W${String(index + 1).padStart(2, "0")}`
  const base = index === 9 ? 0.4 : 87 + ((index * 7) % 8)
  const values = Array.from({ length: 18 }, (_, point) =>
    point % 11 === 0 ? Math.max(0, base - 82) : base + ((point * 13) % 8) * 0.35
  )
  const mean = values.reduce((total, value) => total + value, 0) / values.length
  const sorted = [...values].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]

  return {
    id: wafer,
    label: wafer,
    subtitle: index === 0 || index === 10 ? "BSL" : undefined,
    values,
    mean,
    median,
    low: Math.max(0, mean - (index === 9 ? 36 : 16)),
    high: mean + (index === 9 ? 28 : 16),
    n: values.length,
    tone: index === 9 ? "bad" : "neutral",
  } as const
})

export const measurementFixture: MeasurementInput = {
  title: "Measurement",
  subtitle: "Shared placeholder for grouped CP and Inline measurement distributions.",
  sourceLabel: "SHARED",
  yAxisLabel: "Measurement Value (V)",
  referenceLines: [
    { label: "USL", value: 127.67, tone: "watch" },
    { label: "LSL", value: 52.41, tone: "watch" },
  ],
  groups,
}

export const measurementEmptyFixture: MeasurementInput = {
  title: "Measurement",
  subtitle: "No source measurement groups supplied.",
  sourceLabel: "SHARED",
  groups: [],
}
