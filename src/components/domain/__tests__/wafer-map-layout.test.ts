import { describe, expect, it } from "vitest"

import {
  createDieId,
  createWaferLayout,
  DEFAULT_WAFER_RENDER_CONFIG,
  type WaferMapData,
} from "@/components/domain/wafer-map-model"
import { waferMapW01Fixture } from "@/components/domain/wafer-map.fixtures"

const testWafer: WaferMapData = {
  id: "TEST",
  dies: [
    { id: createDieId(0, 0), x: 0, y: 0 },
    { id: createDieId(1, 1), x: 1, y: 1 },
  ],
  bounds: { minX: -1, maxX: 1, minY: -1, maxY: 1 },
}

describe("createWaferLayout", () => {
  it("centers the domain midpoint and preserves POC Y orientation", () => {
    const layout = createWaferLayout(testWafer, {
      ...DEFAULT_WAFER_RENDER_CONFIG,
      width: 300,
      height: 300,
      padding: 30,
    })
    const center = layout.dies[0]
    const upperRight = layout.dies[1]

    expect(center.x + center.width / 2).toBe(150)
    expect(center.y + center.height / 2).toBe(150)
    expect(upperRight.x).toBeGreaterThan(center.x)
    expect(upperRight.y).toBeLessThan(center.y)
  })

  it("creates geometry for every real W01 die", () => {
    const layout = createWaferLayout(
      waferMapW01Fixture,
      DEFAULT_WAFER_RENDER_CONFIG
    )

    expect(layout.dies).toHaveLength(4099)
    expect(layout.dies).toHaveLength(waferMapW01Fixture.dies.length)
  })
})