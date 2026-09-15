import type { LayoutShellInput } from "@/schemas/domain-component-inputs"

export const layoutShellFixture: LayoutShellInput = {
  title: "Layout Shell",
  subtitle: "Shared layout-only shell with collapsible left navigation and top links.",
  sidebarTitle: "DOE UI",
  collapsed: false,
  navItems: [
    { id: "overview", label: "Overview", active: true },
    { id: "split-table", label: "Split Table", active: false },
    { id: "yield-analysis", label: "Yield Analysis", active: false },
    { id: "wafer-map", label: "Wafer Map", active: false },
    { id: "cp-data", label: "CP Data", active: false },
  ],
  topLinks: [
    { id: "trial", label: "Trial", active: false },
    { id: "shared", label: "Shared", active: true },
    { id: "report", label: "Report", active: false },
  ],
}

export const layoutShellCollapsedFixture: LayoutShellInput = {
  ...layoutShellFixture,
  collapsed: true,
}

export const layoutShellSidebarFixture = {
  title: "DOE试验设计",
  searchPlaceholder: "搜索试验名称或Lot ID",
  trials: [
    { id: "AF01112", name: "刻蚀功率窗口确认试验", lotId: "AF01112", status: "进行中", active: true },
    { id: "AF01113", name: "清洗时间参数优化试验", lotId: "AF01113", status: "已暂停", active: false },
    { id: "AF01098", name: "光刻胶厚度基线试验", lotId: "AF01098", status: "已完成", active: false },
    { id: "AF01076", name: "离子注入剂量探索试验", lotId: "AF01076", status: "已终止", active: false },
  ],
} as const
