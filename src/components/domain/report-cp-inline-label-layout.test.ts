import { describe, expect, it } from "vitest"
import { placeFitPointLabels } from "./report-cp-inline-label-layout"

describe("fit scatter label placement", () => {
  it("keeps coincident wafer labels separate and inside a narrow plot", () => {
    const plot = { x: 82, y: 20, width: 240, height: 240 }
    const points = ["AF01112_01", "AF01112_08", "AF01112_18", "AF01112_25"].map((label) => ({ id: label, label, x: 200, y: 120 }))
    const labels = placeFitPointLabels(points, plot)
    expect(labels).toHaveLength(4)
    for (const [index, label] of labels.entries()) {
      expect(label.left).toBeGreaterThanOrEqual(plot.x)
      expect(label.left + label.width).toBeLessThanOrEqual(plot.x + plot.width)
      expect(label.top).toBeGreaterThanOrEqual(plot.y)
      expect(label.top + label.height).toBeLessThanOrEqual(plot.y + plot.height)
      expect(label.x).toBe(points[index].x)
      expect(label.y).toBe(points[index].y)
      for (const other of labels.slice(index + 1)) {
        expect(label.left >= other.left + other.width || label.left + label.width <= other.left || label.top >= other.top + other.height || label.top + label.height <= other.top).toBe(true)
      }
    }
  })

  it("moves boundary annotations inward without moving the source points", () => {
    const points = [{ id: "last", label: "AF01112_25", x: 320, y: 20 }, { id: "first", label: "AF01112_01", x: 82, y: 259 }]
    const labels = placeFitPointLabels(points, { x: 82, y: 20, width: 240, height: 240 })
    expect(labels).toHaveLength(2)
    expect(labels[0].left + labels[0].width).toBeLessThanOrEqual(322)
    expect(labels[1].left).toBeGreaterThanOrEqual(82)
    expect(points).toEqual([{ id: "last", label: "AF01112_25", x: 320, y: 20 }, { id: "first", label: "AF01112_01", x: 82, y: 259 }])
  })

  it("leaves annotations to tooltips when the plot cannot hold text", () => {
    expect(placeFitPointLabels([{ id: "p", label: "Wafer", x: 0, y: 0 }], { x: 0, y: 0, width: 12, height: 12 })).toEqual([])
  })
})
