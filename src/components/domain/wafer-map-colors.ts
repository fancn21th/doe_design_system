import { z } from "zod"
import finalBinJson from "@/config/wafer-map/final-bin.json"
import parameterJson from "@/config/wafer-map/parameter-map.json"
import defectJson from "@/config/wafer-map/defect-map.json"

// Static JSON is the colour authority. Validation also provides the future
// settings seam; colour choices never classify a Die or change a supplied scale.
const percentage = z.number().finite().min(0).max(100)
const hue = z.number().finite().min(0).max(360)
const color = z.string().refine((value) => {
  if (/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value)) return true
  const match = /^hsl\((\d+(?:\.\d+)?) (\d+(?:\.\d+)?)% (\d+(?:\.\d+)?)%\)$/.exec(value)
  return !!match && Number(match[1]) <= 360 && Number(match[2]) <= 100 && Number(match[3]) <= 100
}, "Use #RGB, #RRGGBB or hsl(H S% L%) with valid channel ranges")
const colorMap = z.record(z.string(), color)
const canvas = z.strictObject({
  waferBackground: color, waferBorder: color, dieBackground: color,
  selectedOutline: color, hoverOutline: color,
})
const metadata = { schemaVersion: z.literal(1), id: z.string().min(1), name: z.string().min(1), canvas }
const hueRange = z.strictObject({ start: hue, count: z.number().int().positive().max(360) })
  .refine((value) => value.start + value.count - 1 <= 360, "Hue range exceeds 360")
const lightnessRange = z.strictObject({ start: percentage, count: z.number().int().positive().max(101) })
  .refine((value) => value.start + value.count - 1 <= 100, "Lightness range exceeds 100")
const binStyle = z.strictObject({
  byBin: colorMap,
  fallback: z.strictObject({
    hues: z.union([z.array(hue).min(1), hueRange]),
    saturation: percentage,
    lightness: lightnessRange,
  }),
})
export const finalBinColorSchemeSchema = z.strictObject({
  ...metadata, states: z.strictObject({ pass: binStyle, fail: binStyle, unknown: binStyle }),
})
export const parameterColorSchemeSchema = z.strictObject({
  ...metadata, invalidValue: color, cpFailOutline: color,
  stops: z.array(z.strictObject({ at: z.number().finite().min(0).max(1), hsl: z.tuple([hue, percentage, percentage]) })).min(2)
    .refine((stops) => stops[0].at === 0 && stops[stops.length - 1].at === 1
      && stops.every((stop, index) => index === 0 || stop.at > stops[index - 1].at),
    "Stops must run strictly from 0 to 1 without duplicate positions"),
})
export const defectColorSchemeSchema = z.strictObject({
  ...metadata, byType: colorMap, fallbackPalette: z.array(color).min(1),
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
export const DEFAULT_FINAL_BIN_PALETTE = waferMapColorSchemes["cp-final-bin"].states.unknown.byBin

function ownColor(palette: Readonly<Record<string, string>>, key: string) {
  return Object.hasOwn(palette, key) ? palette[key] : undefined
}

function colorHash(value: string) {
  let hash = 0
  for (const character of value) hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  return hash
}

function hslColor(channels: readonly number[]) {
  return `hsl(${channels[0]} ${channels[1]}% ${channels[2]}%)`
}

export function finalBinColor(
  finalBin: string,
  palette?: Readonly<Record<string, string>>,
  pass?: boolean,
  scheme: FinalBinColorScheme = waferMapColorSchemes["cp-final-bin"],
): string {
  const normalized = finalBin.replace(/^BIN\s*/i, "").trim()
  const state = pass === true ? "pass" : pass === false ? "fail" : "unknown"
  const style = scheme.states[state]
  // Legacy caller palettes never override an explicit CP state. The JSON has
  // separate Pass/Fail rows so both states can be configured deliberately.
  const explicit = (state === "unknown" && palette ? ownColor(palette, normalized) : undefined) ?? ownColor(style.byBin, normalized)
  if (explicit) return explicit
  const hash = colorHash(normalized || "unknown")
  const { hues, saturation, lightness } = style.fallback
  const selectedHue = Array.isArray(hues) ? hues[hash % hues.length] : hues.start + hash % hues.count
  return hslColor([selectedHue, saturation, lightness.start + hash % lightness.count])
}

export function parameterColor(value: number, low: number, high: number, scheme: ParameterColorScheme = waferMapColorSchemes["cp-parameter"]): string {
  const amount = Math.max(0, Math.min(1, (value - low) / (high - low || 1)))
  const { stops } = scheme
  const end = stops.findIndex((stop) => stop.at >= amount)
  if (end === 0) return hslColor(stops[0].hsl)
  const left = stops[end - 1]
  const right = stops[end]
  const fraction = (amount - left.at) / (right.at - left.at)
  return hslColor(left.hsl.map((channel, index) => channel + (right.hsl[index] - channel) * fraction))
}

/** Canvas and both legends use the same supplied numeric domain and colour table. */
export function parameterColorGradient(low: number, high: number, scheme: ParameterColorScheme = waferMapColorSchemes["cp-parameter"]): string {
  const positions = [...new Set([...scheme.stops.map((stop) => stop.at), 0.25, 0.5, 0.75])].sort((a, b) => a - b)
  return `linear-gradient(to right, ${positions.map((at) => `${parameterColor(low + (high - low) * at, low, high, scheme)} ${at * 100}%`).join(", ")})`
}

export function defectColor(typeId: string, scheme: DefectColorScheme = waferMapColorSchemes.defect): string {
  return ownColor(scheme.byType, typeId) ?? scheme.fallbackPalette[colorHash(typeId) % scheme.fallbackPalette.length]
}
