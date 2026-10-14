import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import finalBinJson from "@/config/wafer-map/final-bin.json"
import parameterJson from "@/config/wafer-map/parameter-map.json"
import defectJson from "@/config/wafer-map/defect-map.json"
import {
  defectColor, defectColorSchemeSchema, finalBinColor, finalBinColorSchemeSchema, finalBinDieColor,
  parameterColor, parameterColorGradient, parameterColorSchemeSchema, waferMapColorSchemes,
} from "../wafer-map-colors"
import { WaferMapGallery } from "../wafer-map"
import { waferMapGalleryScenarios } from "../wafer-map.scenarios"

describe("Wafer Map JSON colour tables", () => {
  it("loads three independently validated schemes", () => {
    expect(finalBinColorSchemeSchema.parse(finalBinJson)).toEqual(waferMapColorSchemes["cp-final-bin"])
    expect(parameterColorSchemeSchema.parse(parameterJson)).toEqual(waferMapColorSchemes["cp-parameter"])
    expect(defectColorSchemeSchema.parse(defectJson)).toEqual(waferMapColorSchemes.defect)
  })

  it("matches the prototype Final Bin, Parameter and named Defect colours", () => {
    const bins = {
      "1": "#34C759", "9": "#FF9F0A", "10": "#AF52DE", "11": "#64D2FF",
      "12": "#007AFF", "13": "#FF3B30", "17": "#FFD60A", "18": "#00C7BE",
      "19": "#BF5AF2", "20": "#5E5CE6", "22": "#AC8E68", "31": "#FF6482",
    }
    for (const [bin, expected] of Object.entries(bins)) {
      expect(finalBinColor(bin)).toBe(expected)
    }
    expect(finalBinColor("not-configured")).toBe("#8E8E93")

    expect(parameterColor(0, 0, 1)).toBe("#f4e275")
    expect(parameterColor(0.125, 0, 1)).toBe("#b3cb82")
    expect(parameterColor(0.25, 0, 1)).toBe("#71b48e")
    expect(parameterColor(0.5, 0, 1)).toBe("#1a8b95")
    expect(parameterColor(0.75, 0, 1)).toBe("#005b87")
    expect(parameterColor(1, 0, 1)).toBe("#00224d")

    expect(defectColor("Particle")).toBe("#FF3B30")
    expect(defectColor("Pattern")).toBe("#AF52DE")
    expect(defectColor("Bridge")).toBe("#34C759")
    expect(defectColor("Crack")).toBe("#8B5CF6")
    expect(defectColor("Scratch")).toBe("#0071E3")
    expect(defectColor("Unknown")).toBe("#64748B")
    expect(defectColor("Void")).toBe("#FF9500")
  })

  it("changes explicit CP-state bin colours from JSON rows, including Bin 0", () => {
    const json = structuredClone(finalBinJson)
    const scheme = finalBinColorSchemeSchema.parse(json)
    scheme.states.pass.byBin["0"] = "#123456"
    scheme.states.fail.byBin["0"] = "#abcdef"
    scheme.states.unknown.byBin["0"] = "#789abc"
    expect(finalBinColor("BIN 0", undefined, true, scheme)).toBe("#123456")
    expect(finalBinColor("0", undefined, false, scheme)).toBe("#abcdef")
    expect(finalBinColor("0", undefined, undefined, scheme)).toBe("#789abc")
    // A misleading legacy palette does not silently override the chosen CP state.
    expect(finalBinColor("0", { "0": "#ffffff" }, false, scheme)).toBe("#abcdef")
  })

  it("uses numeric binCode ahead of the business Bin name for canvas and legend colours", () => {
    expect(finalBinDieColor({ finalBin: "VGSTX1", binCode: "10", pass: false })).toBe("#AF52DE")
    expect(finalBinDieColor({ finalBin: "PASS", binCode: "1", pass: true })).toBe("#34C759")
    expect(finalBinDieColor({ finalBin: "VGSTX1", pass: false })).toBe("#8E8E93")
  })

  it("changes either fixed or hashed fallbacks without adding bins to drawing code", () => {
    const scheme = finalBinColorSchemeSchema.parse(finalBinJson)
    scheme.states.fail.fallback = { color: "#123456" }
    expect(finalBinColor("NEW_BIN", undefined, false, scheme)).toBe("#123456")
    scheme.states.fail.fallback = { hues: [210], saturation: 60, lightness: { start: 45, count: 1 } }
    expect(finalBinColor("NEW_BIN", undefined, false, scheme)).toBe("hsl(210 60% 45%)")
    expect(finalBinColor("9", undefined, false, scheme)).toBe(scheme.states.fail.byBin["9"])
  })

  it("uses configured uneven gradient stops with the same domain and legend", () => {
    const scheme = parameterColorSchemeSchema.parse(parameterJson)
    scheme.stops = [{ at: 0, color: "#ff0000" }, { at: 0.4, color: "#00ff00" }, { at: 1, color: "#0000ff" }]
    expect(parameterColor(14, 10, 20, scheme)).toBe("#00ff00")
    expect(parameterColor(12, 10, 20, scheme)).toBe("#808000")
    expect(parameterColor(9, 10, 20, scheme)).toBe("#ff0000")
    expect(parameterColor(21, 10, 20, scheme)).toBe("#0000ff")
    expect(parameterColorGradient(10, 20, scheme)).toContain("#00ff00 40%")
    expect(parameterColorGradient(3, 3, scheme)).toContain("#ff0000 100%")
  })

  it("resolves each mixed-defect class independently and supports unlisted classes", () => {
    const scheme = defectColorSchemeSchema.parse(defectJson)
    scheme.byType["class:206"] = "#123456"
    scheme.byType["class:212"] = "#abcdef"
    scheme.fallbackPalette = ["#789abc"]
    expect(["class:206", "class:212"].map((id) => defectColor(id, scheme))).toEqual(["#123456", "#abcdef"])
    expect(defectColor("class:new", scheme)).toBe("#789abc")
    expect(defectColor("toString", scheme)).toBe("#789abc")
    expect(finalBinColor("constructor")).toBe("#8E8E93")
  })

  it("uses the same configured colours in the rendered gallery legend", () => {
    const parameter = waferMapColorSchemes["cp-parameter"]
    const finalBin = waferMapColorSchemes["cp-final-bin"]
    const savedParameter = structuredClone(parameter)
    const savedFinalBin = structuredClone(finalBin)
    try {
      parameter.invalidValue = "#123456"
      parameter.cpFailOutline = "#abcdef"
      parameter.stops = [{ at: 0, color: "#112233" }, { at: 1, color: "#ddeeff" }]
      finalBin.states.pass.byBin["PASS"] = "#246abc"
      const parameterHtml = renderToStaticMarkup(<WaferMapGallery input={waferMapGalleryScenarios.parameterOverview.input} />)
      expect(parameterHtml).toContain("background:#123456")
      expect(parameterHtml).toContain("border-color:#abcdef")
      expect(parameterHtml).toContain(parameterColor(0.7, 0.7, 1))
      const binHtml = renderToStaticMarkup(<WaferMapGallery input={waferMapGalleryScenarios.semanticFinalBins.input} />)
      expect(binHtml).toContain("background:#246abc")
      expect(binHtml).not.toContain("绿色 Pass")
    } finally {
      Object.assign(parameter, savedParameter)
      Object.assign(finalBin, savedFinalBin)
    }
  })

  it("rejects invalid colours, empty palettes, invalid ranges, duplicate stops and typos", () => {
    expect(finalBinColorSchemeSchema.safeParse({ ...finalBinJson, schemaVersion: 2 }).success).toBe(false)
    expect(defectColorSchemeSchema.safeParse({ ...defectJson, byType: { typo: "not-a-colour" } }).success).toBe(false)
    expect(defectColorSchemeSchema.safeParse({ ...defectJson, fallbackPalette: [] }).success).toBe(false)
    expect(parameterColorSchemeSchema.safeParse({ ...parameterJson, invalidValue: "hsl(361 50% 50%)" }).success).toBe(false)
    expect(parameterColorSchemeSchema.safeParse({ ...parameterJson, invalidVaule: "#ffffff" }).success).toBe(false)
    expect(parameterColorSchemeSchema.safeParse({ ...parameterJson, stops: [{ at: 0, color: "#000000" }, { at: 0, color: "#ffffff" }] }).success).toBe(false)
    expect(finalBinColorSchemeSchema.safeParse({
      ...finalBinJson,
      states: {
        ...finalBinJson.states,
        pass: { ...finalBinJson.states.pass, fallback: { hues: [120], saturation: 50, lightness: { start: 99, count: 10 } } },
      },
    }).success).toBe(false)
  })
})
