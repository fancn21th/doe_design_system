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
