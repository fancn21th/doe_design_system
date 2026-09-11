import type { LayoutSidebarShellInput } from "@/schemas/domain-component-inputs"

export const layoutSidebarShellFixture: LayoutSidebarShellInput = {
  title: "DOE Workspace",
  subtitle: "Layout-only shell for domain surfaces and grouped navigation.",
  sidebarTitle: "DOE UI",
  sidebarSubtitle: "Domain Component Lab",
  searchPlaceholder: "Search domain surfaces...",
  collapsed: false,
  versions: ["0.1.0", "0.2.0-alpha", "0.3.0-beta"],
  selectedVersion: "0.1.0",
  breadcrumbs: [
    { id: "domain", label: "Domain", href: "/docs/domain", current: false },
    { id: "shared", label: "Shared", href: "/docs/domain/shared/layout-shell", current: false },
    { id: "layout", label: "Layout Shell", current: true },
  ],
  topLinks: [
    { id: "trial", label: "Trial", href: "/docs/domain/trial/experiment", active: false },
    { id: "shared", label: "Shared", href: "/docs/domain/shared/layout-shell", active: true },
    { id: "report", label: "Report", href: "/docs/domain/report/overview", active: false },
  ],
  navGroups: [
    {
      id: "shared",
      label: "Shared",
      items: [
        { id: "layout-shell", label: "Layout Shell", href: "#layout-shell", active: true },
        { id: "wafer-map", label: "Wafer Map", href: "/docs/domain/shared/wafer-map", active: false },
        { id: "measurement", label: "Measurement", href: "/docs/domain/shared/measurement", active: false },
      ],
    },
    {
      id: "report",
      label: "Report",
      items: [
        { id: "overview", label: "Overview", href: "/docs/domain/report/overview", active: false },
        { id: "split-table", label: "Split Table", href: "/docs/domain/report/split-table", active: false },
        { id: "yield-analysis", label: "Yield Analysis", href: "/docs/domain/report/yield-analysis", active: false },
        { id: "wafer-map-report", label: "Report Wafer Map", href: "/docs/domain/report/wafer-map", active: false },
      ],
    },
    {
      id: "trial",
      label: "Trial",
      items: [
        { id: "experiment", label: "Experiment", href: "/docs/domain/trial/experiment", active: false },
        { id: "lot", label: "Lot", href: "/docs/domain/trial/lot", active: false },
        { id: "steps", label: "Steps", href: "/docs/domain/trial/steps", active: false },
      ],
    },
  ],
}

export const layoutSidebarShellCollapsedFixture: LayoutSidebarShellInput = {
  ...layoutSidebarShellFixture,
  collapsed: true,
}
