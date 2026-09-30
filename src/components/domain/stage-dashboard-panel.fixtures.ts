import type { StageDashboardPanelInput } from "@/schemas/domain-component-inputs"

export const stageDashboardReadyFixture: StageDashboardPanelInput = {
  state: "ready",
  stageId: "OXIDE_ETCH",
  stageLabel: "OXIDE ETCH · Stage Dashboard",
  eyebrow: "Stage Dashboard",
  message: "MES 数据已返回 · 数据时间 2026-09-24 10:30",
  downloadAvailable: true,
}

export const stageDashboardLoadingFixture: StageDashboardPanelInput = {
  state: "loading",
  stageId: "OXIDE_ETCH",
  stageLabel: "OXIDE ETCH · Stage Dashboard",
  eyebrow: "Stage Dashboard",
  downloadAvailable: false,
  downloadUnavailableReason: "数据加载完成后可下载",
}

export const stageDashboardEmptyFixture: StageDashboardPanelInput = {
  state: "empty",
  stageId: "CLEAN",
  stageLabel: "CLEAN · Stage Dashboard",
  eyebrow: "Stage Dashboard",
  message: "该 Stage 暂无 MES 返回数据。",
  downloadAvailable: false,
  downloadUnavailableReason: "暂无可下载数据",
}

export const stageDashboardErrorFixture: StageDashboardPanelInput = {
  state: "error",
  stageId: "FS_TAPE",
  stageLabel: "FS TAPE · Stage Dashboard",
  eyebrow: "Stage Dashboard",
  errorMessage: "Stage Report aggregation failed.",
  downloadAvailable: false,
  downloadUnavailableReason: "读取失败时不能下载",
}
