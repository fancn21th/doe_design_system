import { z } from "zod"
import finalBinJson from "@/config/wafer-map/final-bin.json"
import parameterJson from "@/config/wafer-map/parameter-map.json"
import defectJson from "@/config/wafer-map/defect-map.json"

// Static JSON is the colour authority. Validation also provides the future
// settings seam; colour choices never classify a Die or change a supplied scale.
const hexColor = z.string().regex(/^#[\da-f]{6}$/i, "Use #RRGGBB")
const color = z.string().refine((value) => {
  if (/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value)) return true
  const match = /^hsl\((\d+(?:\.\d+)?) (\d+(?:\.\d+)?)% (\d+(?:\.\d+)?)%\)$/.exec(value)
  return !!match && Number(match[1]) <= 360 && Number(match[2]) <= 100 && Number(match[3]) <= 100
}, "Use #RGB, #RRGGBB or hsl(H S% L%) with valid channel ranges")
const canvas = z.strictObject({
  waferBackground: color, waferBorder: color, dieBackground: color,
  selectedOutline: color, hoverOutline: color,
})
const metadata = { schemaVersion: z.literal(1), id: z.string().min(1), name: z.string().min(1), canvas }
export const finalBinColorSchemeSchema = z.strictObject({
  ...metadata, palette: z.array(color).min(1), fallback: color,
})
export const parameterColorSchemeSchema = z.strictObject({
  ...metadata, invalidValue: color, cpFailOutline: color.nullable(), interpolation: z.literal("rgb"),
  stops: z.array(z.strictObject({ at: z.number().finite().min(0).max(1), color: hexColor })).min(2)
    .refine((stops) => stops[0].at === 0 && stops[stops.length - 1].at === 1
      && stops.every((stop, index) => index === 0 || stop.at > stops[index - 1].at),
    "Stops must run strictly from 0 to 1 without duplicate positions"),
})
export const defectColorSchemeSchema = z.strictObject({
  ...metadata, palette: z.array(color).min(1), fallback: color,
})
export type FinalBinColorScheme = z.infer<typeof finalBinColorSchemeSchema>
export type ParameterColorScheme = z.infer<typeof parameterColorSchemeSchema>
export type DefectColorScheme = z.infer<typeof defectColorSchemeSchema>

function readScheme<T>(schema: z.ZodType<T>, json: unknown, file: string): T {
  const result = schema.safeParse(json)
  if (!result.success) throw new Error(`Invalid Wafer Map colour configuration (${file}): ${result.error.message}`)
  return result.data
}

export const waferMapColorSchemes = {
  "cp-final-bin": readScheme(finalBinColorSchemeSchema, finalBinJson, "final-bin.json"),
  "cp-parameter": readScheme(parameterColorSchemeSchema, parameterJson, "parameter-map.json"),
  defect: readScheme(defectColorSchemeSchema, defectJson, "defect-map.json"),
}
// Retain the legacy public export; there is no second palette in the model.
export const DEFAULT_FINAL_BIN_PALETTE = waferMapColorSchemes["cp-final-bin"].palette

function rgbChannels(value: string): [number, number, number] {
  return [Number.parseInt(value.slice(1, 3), 16), Number.parseInt(value.slice(3, 5), 16), Number.parseInt(value.slice(5, 7), 16)]
}

function interpolateRgb(left: string, right: string, amount: number) {
  const from = rgbChannels(left)
  const to = rgbChannels(right)
  return `#${from.map((channel, index) => Math.round(channel + (to[index] - channel) * amount).toString(16).padStart(2, "0")).join("")}`
}

export function finalBinColor(
  finalBin: string,
  orderedBins: readonly string[],
  scheme: FinalBinColorScheme = waferMapColorSchemes["cp-final-bin"],
): string {
  const normalized = finalBin.replace(/^BIN\s*/i, "").trim()
  const index = orderedBins.findIndex((bin) => bin.replace(/^BIN\s*/i, "").trim() === normalized)
  return index < 0 ? scheme.fallback : scheme.palette[index % scheme.palette.length]
}

export function finalBinDieColor(
  die: { finalBin: string; binCode?: string | null },
  orderedBins: readonly string[],
  scheme: FinalBinColorScheme = waferMapColorSchemes["cp-final-bin"],
) {
  return finalBinColor(die.binCode ?? die.finalBin, orderedBins, scheme)
}

export function parameterColor(value: number, low: number, high: number, scheme: ParameterColorScheme = waferMapColorSchemes["cp-parameter"]): string {
  const amount = Math.max(0, Math.min(1, (value - low) / (high - low || 1)))
  const { stops } = scheme
  const end = stops.findIndex((stop) => stop.at >= amount)
  if (end === 0) return interpolateRgb(stops[0].color, stops[0].color, 0)
  const left = stops[end - 1]
  const right = stops[end]
  const fraction = (amount - left.at) / (right.at - left.at)
  return interpolateRgb(left.color, right.color, fraction)
}

/** Canvas and both legends use the same supplied numeric domain and colour table. */
export function parameterColorGradient(low: number, high: number, scheme: ParameterColorScheme = waferMapColorSchemes["cp-parameter"]): string {
  const positions = [...new Set([...scheme.stops.map((stop) => stop.at), 0.25, 0.5, 0.75])].sort((a, b) => a - b)
  return `linear-gradient(to right, ${positions.map((at) => `${parameterColor(low + (high - low) * at, low, high, scheme)} ${at * 100}%`).join(", ")})`
}

export function defectColor(typeId: string, orderedTypeIds: readonly string[], scheme: DefectColorScheme = waferMapColorSchemes.defect): string {
  const index = orderedTypeIds.indexOf(typeId)
  return index < 0 ? scheme.fallback : scheme.palette[index % scheme.palette.length]
}
