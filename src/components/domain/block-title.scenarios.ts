import { blockTitleFixture } from "@/components/domain/block-title.fixtures"
import type { BlockTitleInput } from "@/schemas/domain-component-inputs"

export const blockTitleScenarios = {
  normal: { name: "normal", input: blockTitleFixture },
  longTitle: {
    name: "long-title",
    input: { ...blockTitleFixture, id: "wafer-split-table-long-preview", title: "Wafer Split Table · Stage / Step / Sequence 分配上下文" },
  },
} satisfies Record<string, { name: string; input: BlockTitleInput }>
