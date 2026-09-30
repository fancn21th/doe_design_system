import type { LotInput } from "@/schemas/domain-component-inputs"
import { lotFixture } from "@/components/domain/lot.fixtures"

type LotScenario = {
  name: string
  input: LotInput
}

export const lotScenarios = {
  normal: {
    name: "normal",
    input: lotFixture,
  },
  partial: {
    name: "partial",
    input: {
      lotId: "AE01590",
      productName: "",
      experimentName: "AE01590 DOE试验",
      experimentDescription: "",
      stepCount: 1,
      waferCount: 6,
      waferIds: Array.from(
        { length: 6 },
        (_, index) => `AE01590_${String(index + 1).padStart(2, "0")}`
      ),
      sourceLabel: "DOE Backend BFF verify-context",
      sourceStatus: "partial",
    },
  },
  emptyWafers: {
    name: "empty-wafers",
    input: {
      lotId: "LOT-PENDING",
      productName: "",
      experimentName: "待确认试验",
      experimentDescription: "",
      stepCount: 0,
      waferCount: 0,
      waferIds: [],
      sourceStatus: "unavailable",
    },
  },
} satisfies Record<string, LotScenario>
