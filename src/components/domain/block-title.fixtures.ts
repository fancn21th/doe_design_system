import type { BlockTitleInput } from "@/schemas/domain-component-inputs"

/** Presentation-only fixture: no report measurements or workflow state. */
export const blockTitleFixture: BlockTitleInput = {
  id: "wafer-split-table-preview",
  title: "Wafer Split Table",
  helpText: "按 Stage / Step / Seq 分组查看 Wafer 的 Recipe、Condition、Yield 与 Top Fail，BSL / split 标签标识基准与实验条件分配。可通过 Stage 和 Step 筛选缩小查看范围；结果来自当前报告快照。",
}
