import type { RunCardHistoryInput } from "@/schemas/domain-component-inputs"
import { runCardHistoryFixture } from "@/components/domain/runcard-history.fixtures"

type RunCardHistoryScenario = {
  name: string
  input: RunCardHistoryInput
}

export const runCardHistoryScenarios = {
  normal: {
    name: "normal",
    input: runCardHistoryFixture,
  },
  empty: {
    name: "empty",
    input: {
      events: [],
    },
  },
} satisfies Record<string, RunCardHistoryScenario>
