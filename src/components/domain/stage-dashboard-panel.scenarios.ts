import {
  stageDashboardEmptyFixture,
  stageDashboardErrorFixture,
  stageDashboardLoadingFixture,
  stageDashboardReadyFixture,
} from "@/components/domain/stage-dashboard-panel.fixtures"
import type { StageDashboardPanelInput } from "@/schemas/domain-component-inputs"

type StageDashboardPanelScenario = {
  name: string
  input: StageDashboardPanelInput
}

export const stageDashboardPanelScenarios = {
  loading: { name: "loading", input: stageDashboardLoadingFixture },
  ready: { name: "ready", input: stageDashboardReadyFixture },
  empty: { name: "empty", input: stageDashboardEmptyFixture },
  error: { name: "error", input: stageDashboardErrorFixture },
} satisfies Record<string, StageDashboardPanelScenario>
