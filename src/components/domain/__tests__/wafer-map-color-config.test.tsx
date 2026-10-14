import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import finalBinJson from "@/config/wafer-map/final-bin.json"
import parameterJson from "@/config/wafer-map/parameter-map.json"
import defectJson from "@/config/wafer-map/defect-map.json"
import {
  defectColor, defectColorSchemeSchema, finalBinColor, finalBinColorSchemeSchema,
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

  it("preserves the previous default colours for known and unlisted bins, values and classes", () => {
    expect(finalBinColor("1", undefined, true)).toBe("hsl(158 65% 41%)")
    expect(finalBinColor("9", undefined, false)).toBe("hsl(24 78% 47%)")
    expect(finalBinColor("31", undefined, false)).toBe("hsl(0 78% 40%)")
    expect(finalBinColor("PASS", undefined, false)).toBe("hsl(12 78% 41%)")
    expect(finalBinColor("31", undefined, true)).toBe("hsl(139 65% 32%)")
    expect(parameterColor(0, 0, 1)).toBe("hsl(265 65% 34%)")
    expect(parameterColor(0.5, 0, 1)).toBe("hsl(162.5 65% 43%)")
    expect(parameterColor(1, 0, 1)).toBe("hsl(60 65% 52%)")
    expect(defectColor("class:206")).toBe("#0e7490")
    expect(defectColor("class:212")).toBe("#be185d")
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

  it("changes the fallback family without adding bins to drawing code", () => {
    const scheme = finalBinColorSchemeSchema.parse(finalBinJson)
    scheme.states.fail.fallback = { hues: [210], saturation: 60, lightness: { start: 45, count: 1 } }
    expect(finalBinColor("NEW_BIN", undefined, false, scheme)).toBe("hsl(210 60% 45%)")
    expect(finalBinColor("9", undefined, false, scheme)).toBe(scheme.states.fail.byBin["9"])
  })

  it("uses configured uneven gradient stops with the same domain and legend", () => {
    const scheme = parameterColorSchemeSchema.parse(parameterJson)
    scheme.stops = [{ at: 0, hsl: [0, 100, 50] }, { at: 0.4, hsl: [120, 80, 40] }, { at: 1, hsl: [240, 60, 30] }]
    expect(parameterColor(14, 10, 20, scheme)).toBe("hsl(120 80% 40%)")
    expect(parameterColor(12, 10, 20, scheme)).toBe("hsl(60 90% 45%)")
    expect(parameterColor(9, 10, 20, scheme)).toBe("hsl(0 100% 50%)")
    expect(parameterColor(21, 10, 20, scheme)).toBe("hsl(240 60% 30%)")
    expect(parameterColorGradient(10, 20, scheme)).toContain("hsl(120 80% 40%) 40%")
    expect(parameterColorGradient(3, 3, scheme)).toContain("hsl(0 100% 50%) 100%")
  })

  it("resolves each mixed-defect class independently and supports unlisted classes", () => {
    const scheme = defectColorSchemeSchema.parse(defectJson)
    scheme.byType["class:206"] = "#123456"
    scheme.byType["class:212"] = "#abcdef"
    scheme.fallbackPalette = ["#789abc"]
    expect(["class:206", "class:212"].map((id) => defectColor(id, scheme))).toEqual(["#123456", "#abcdef"])
    expect(defectColor("class:new", scheme)).toBe("#789abc")
    expect(defectColor("toString", scheme)).toBe("#789abc")
    expect(finalBinColor("constructor")).toMatch(/^hsl\(/)
  })

  it("uses the same configured colours in the rendered gallery legend", () => {
    const parameter = waferMapColorSchemes["cp-parameter"]
    const finalBin = waferMapColorSchemes["cp-final-bin"]
    const savedParameter = structuredClone(parameter)
    const savedFinalBin = structuredClone(finalBin)
    try {
      parameter.invalidValue = "#123456"
      parameter.cpFailOutline = "#abcdef"
      parameter.stops = [{ at: 0, hsl: [10, 50, 20] }, { at: 1, hsl: [50, 50, 80] }]
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
    expect(parameterColorSchemeSchema.safeParse({ ...parameterJson, stops: [{ at: 0, hsl: [0, 50, 50] }, { at: 0, hsl: [120, 50, 50] }] }).success).toBe(false)
    const invalid = structuredClone(finalBinJson)
    invalid.states.pass.fallback.lightness = { start: 99, count: 10 }
    expect(finalBinColorSchemeSchema.safeParse(invalid).success).toBe(false)
  })
})
