import { describe, expect, it } from "vitest"

import {
  calculateWaferBounds,
  createDieId,
} from "@/components/domain/wafer-map-model"

describe("calculateWaferBounds", () => {
  it("returns the coordinate extents", () => {
    expect(
      calculateWaferBounds([
        { id: createDieId(-2, 3), x: -2, y: 3 },
        { id: createDieId(4, 8), x: 4, y: 8 },
      ])
    ).toEqual({ minX: -2, maxX: 4, minY: 3, maxY: 8 })
  })

  it("rejects an empty wafer", () => {
    expect(() => calculateWaferBounds([])).toThrow("empty wafer")
  })
})