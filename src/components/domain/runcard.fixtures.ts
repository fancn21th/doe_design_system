import type {
  RunCardGroup,
  RunCardInput,
  RunCardReleaseStep,
} from "@/schemas/domain-component-inputs"

export const runCardReleaseStepsFixture: RunCardReleaseStep[] = [
  {
    id: "step-01",
    stage: "OXIDE_ETCH",
    name: "MAIN",
    seq: "Seq 1",
    detail: "Baseline / Variant A",
  },
  {
    id: "step-02",
    stage: "CLEAN",
    name: "MAIN",
    seq: "Seq 2",
    detail: "Variant B · Time +10s",
  },
  {
    id: "step-03",
    stage: "FS-TAPE",
    name: "S-B-TAPE-B-01",
    seq: "Seq 3",
    detail: "New Step",
  },
]

export const runCardWithUnassignedStepsFixture: RunCardReleaseStep[] = [
  ...runCardReleaseStepsFixture,
  {
    id: "step-04",
    stage: "FS-TAPE",
    name: "S-B-TAPE-B-01",
    seq: "Seq 3",
    detail: "New Step",
  },
  {
    id: "step-05",
    stage: "OXIDE-ETCH",
    name: "OXIDE-ETCH-MAIN",
    seq: "Seq 4",
    detail: "New Step",
  },
  {
    id: "step-06",
    stage: "CLEAN",
    name: "S-CLEAN-D-01",
    seq: "Seq 5",
    detail: "New Step",
  },
]

export const runCardGroupsFixture: RunCardGroup[] = [
  {
    id: "RC-001",
    stepIds: ["step-01", "step-02"],
    collapsed: false,
  },
  {
    id: "RC-002",
    stepIds: ["step-03"],
    collapsed: false,
  },
]

export const runCardFixture: Required<RunCardInput> = {
  steps: runCardReleaseStepsFixture,
  runCards: runCardGroupsFixture,
  releasedStepIds: [],
  selectedStepIds: [],
}

export const runCardWithUnassignedFixture: Required<RunCardInput> = {
  steps: runCardWithUnassignedStepsFixture,
  runCards: [
    {
      id: "RC-001",
      stepIds: ["step-01", "step-02", "step-03"],
      collapsed: false,
    },
    {
      id: "RC-002",
      stepIds: [],
      collapsed: false,
    },
  ],
  releasedStepIds: [],
  selectedStepIds: [],
}
