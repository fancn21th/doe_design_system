import type { LotInput } from "@/schemas/domain-component-inputs"

export const lotFixture: LotInput = {
  lotId: "AF01112",
  productName: "S0269A · Power MOSFET",
  experimentName: "AF01112 DOE Split 试验",
  experimentDescription: "按 Split Table Version-5 展示实际试验分组",
  stepCount: 11,
  waferCount: 25,
  waferIds: Array.from(
    { length: 25 },
    (_, index) => `AF01112.${String(index + 1).padStart(2, "0")}`
  ),
  sourceLabel: "Oracle Lot 与当前 DOE 配置",
  sourceStatus: "available",
}
