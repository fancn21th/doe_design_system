import {
  layoutSidebarShellCollapsedFixture,
  layoutSidebarShellFixture,
} from "@/components/domain/layout-sidebar-shell.fixtures"
import type { LayoutSidebarShellInput } from "@/schemas/domain-component-inputs"

type LayoutSidebarShellScenario = {
  name: string
  input: LayoutSidebarShellInput
}

export const layoutSidebarShellScenarios = {
  normal: {
    name: "normal",
    input: layoutSidebarShellFixture,
  },
  collapsed: {
    name: "collapsed",
    input: layoutSidebarShellCollapsedFixture,
  },
} satisfies Record<string, LayoutSidebarShellScenario>
