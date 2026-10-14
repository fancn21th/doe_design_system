import { describe, expect, it } from "vitest"
import { DEFAULT_FINAL_BIN_PALETTE, finalBinColor, parameterColor, parameterColorGradient } from "@/components/domain/wafer-map-model"

describe("authoritative CP status colours", () => {
  it("uses the prototype Final Bin table for the matching CP state", () => {
    expect(finalBinColor("1", undefined, true)).toBe("#34C759")
    expect(finalBinColor("9", undefined, false)).toBe("#FF9F0A")
    expect(finalBinColor("31", undefined, false)).toBe("#FF6482")
  })

  it("uses the prototype gray fallback for an unmapped or inconsistent bin", () => {
    expect(finalBinColor("CUSTOM_PASS", undefined, true)).toBe("#8E8E93")
    expect(finalBinColor("CUSTOM_FAIL", undefined, false)).toBe("#8E8E93")
    expect(finalBinColor("31", undefined, true)).toBe("#8E8E93")
  })

  it("preserves legacy palette fallback when CP status is not supplied", () => {
    expect(finalBinColor("BIN 1")).toBe(DEFAULT_FINAL_BIN_PALETTE["1"])
    expect(finalBinColor("CUSTOM", { CUSTOM: "#123456" })).toBe("#123456")
  })
})

describe("parameter colour scale", () => {
  it("matches the prototype RGB interpolation nodes", () => {
    expect(parameterColor(0, 0, 1)).toBe("#f4e275")
    expect(parameterColor(0.25, 0, 1)).toBe("#71b48e")
    expect(parameterColor(0.5, 0, 1)).toBe("#1a8b95")
    expect(parameterColor(0.75, 0, 1)).toBe("#005b87")
    expect(parameterColor(1, 0, 1)).toBe("#00224d")
  })

  it("uses identical canvas endpoint and midpoint colours in the legend", () => {
    const gradient = parameterColorGradient(0.7, 1)
    expect(gradient).toContain(`${parameterColor(0.7, 0.7, 1)} 0%`)
    expect(gradient).toContain(`${parameterColor(0.85, 0.7, 1)} 50%`)
    expect(gradient).toContain(`${parameterColor(1, 0.7, 1)} 100%`)
  })
  it("represents a constant supplied scale without invalid colour values", () => {
    expect(parameterColorGradient(3, 3)).not.toContain("NaN")
    expect(parameterColorGradient(3, 3)).toContain(`${parameterColor(3, 3, 3)} 100%`)
  })
})
