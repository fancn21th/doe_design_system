import {
  layoutShellCollapsedFixture,
  layoutShellFixture,
} from "@/components/domain/layout-shell.fixtures"
import type { LayoutShellInput } from "@/schemas/domain-component-inputs"

type LayoutShellScenario = {
  name: string
  input: LayoutShellInput
}

export const layoutShellScenarios = {
  normal: {
    name: "normal",
    input: layoutShellFixture,
  },
  collapsed: {
    name: "collapsed",
    input: layoutShellCollapsedFixture,
  },
} satisfies Record<string, LayoutShellScenario>
