import { describe, expect, it } from "vitest"

import {
  createDieId,
  createDieVisualStates,
  type DieRenderPolicy,
} from "@/components/domain/wafer-map-model"

describe("createDieVisualStates", () => {
  it("combines each die geometry with its policy appearance", () => {
    const die = { id: createDieId(3, 5), x: 3, y: 5 }
    const policy: DieRenderPolicy<typeof die, void> = {
      resolve() {
        return { fill: "#123456", opacity: 0.5, visible: true }
      },
    }

    expect(
      createDieVisualStates(
        [die],
        [{ id: die.id, x: 10, y: 20, width: 4, height: 4 }],
        policy
      )
    ).toEqual([
      {
        id: die.id,
        geometry: { id: die.id, x: 10, y: 20, width: 4, height: 4 },
        appearance: { fill: "#123456", opacity: 0.5, visible: true },
      },
    ])
  })
})