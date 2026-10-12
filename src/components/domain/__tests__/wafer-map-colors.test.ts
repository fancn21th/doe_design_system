import { describe, expect, it } from "vitest"
import { DEFAULT_FINAL_BIN_PALETTE, finalBinColor, parameterColor, parameterColorGradient } from "@/components/domain/wafer-map-model"

function hue(color: string) {
  return Number(color.match(/^hsl\((\d+)/)?.[1])
}

describe("authoritative CP status colours", () => {
  it("never renders explicit Fail green even when its bin name or palette implies Pass", () => {
    for (const bin of ["PASS", "1", "11", "VGSTX1", "CUSTOM_FAIL"]) {
      const color = finalBinColor(bin, { ...DEFAULT_FINAL_BIN_PALETTE, [bin]: "#16a34a" }, false)
      expect(hue(color) < 35 || hue(color) >= 340).toBe(true)
      expect(color).not.toBe(finalBinColor(bin, undefined, true))
    }
  })
  it("renders supplied Pass green regardless of its label", () => {
    for (const bin of ["PASS", "FAIL", "31", "CUSTOM_PASS"]) {
      expect(hue(finalBinColor(bin, undefined, true))).toBeGreaterThanOrEqual(134)
      expect(hue(finalBinColor(bin, undefined, true))).toBeLessThanOrEqual(158)
    }
  })
  it("retains stable bin distinction within a CP state", () => {
    expect(finalBinColor("VGSTX1", undefined, false)).toBe(finalBinColor("VGSTX1", undefined, false))
    expect(finalBinColor("VGSTX1", undefined, false)).not.toBe(finalBinColor("BVDSS", undefined, false))
  })
  it("preserves legacy palette fallback when CP status is not supplied", () => {
    expect(finalBinColor("BIN 1")).toBe(DEFAULT_FINAL_BIN_PALETTE["1"])
    expect(finalBinColor("CUSTOM", { CUSTOM: "#123456" })).toBe("#123456")
  })
})

describe("parameter colour scale", () => {
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
