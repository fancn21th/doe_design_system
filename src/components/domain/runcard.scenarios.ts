import type { RunCardInput } from "@/schemas/domain-component-inputs"
import {
  runCardFixture,
  runCardGroupsFixture,
  runCardReleaseStepsFixture,
  runCardWithUnassignedFixture,
} from "@/components/domain/runcard.fixtures"

type RunCardScenario = {
  name: string
  input: RunCardInput
}

export const runCardScenarios = {
  initial: {
    name: "initial",
    input: runCardFixture,
  },
  singleStepSelected: {
    name: "single-step-selected",
    input: {
      ...runCardFixture,
      selectedStepIds: ["step-01"],
    },
  },
  runCardSelected: {
    name: "runcard-selected",
    input: {
      ...runCardFixture,
      selectedStepIds: ["step-01", "step-02"],
    },
  },
  emptyRunCardAdded: {
    name: "empty-runcard-added",
    input: {
      ...runCardFixture,
      runCards: [
        ...runCardGroupsFixture,
        { id: "RC-003", stepIds: [], collapsed: false },
      ],
    },
  },
  stepMoved: {
    name: "step-moved",
    input: {
      ...runCardFixture,
      runCards: [
        { id: "RC-001", stepIds: ["step-01", "step-02"], collapsed: false },
        { id: "RC-002", stepIds: [], collapsed: false },
        { id: "RC-003", stepIds: ["step-03"], collapsed: false },
      ],
    },
  },
  partialReleaseSubmitted: {
    name: "partial-release-submitted",
    input: {
      ...runCardFixture,
      releasedStepIds: ["step-01", "step-02"],
      runCards: [
        { id: "RC-001", stepIds: ["step-01", "step-02"], collapsed: false },
        { id: "RC-002", stepIds: ["step-03"], collapsed: false },
      ],
    },
  },
  allReleased: {
    name: "all-released",
    input: {
      ...runCardFixture,
      releasedStepIds: runCardReleaseStepsFixture.map((step) => step.id),
    },
  },
  unassignedStep: {
    name: "unassigned-step",
    input: {
      ...runCardFixture,
      runCards: [
        { id: "RC-001", stepIds: ["step-01", "step-02"], collapsed: false },
        { id: "RC-002", stepIds: [], collapsed: false },
      ],
    },
  },
  withUnassignedSteps: {
    name: "with-unassigned-steps",
    input: runCardWithUnassignedFixture,
  },
} satisfies Record<string, RunCardScenario>
