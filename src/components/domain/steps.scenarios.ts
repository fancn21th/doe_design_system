import type { StepsInput } from "@/schemas/domain-component-inputs"
import {
  createStepRowFromCandidate,
  stepCandidatesFixture,
  stepRowsFixture,
  stepsFixture,
} from "@/components/domain/steps.fixtures"

type StepsScenario = {
  name: string
  input: StepsInput
}

export const stepsScenarios = {
  normal: {
    name: "normal",
    input: stepsFixture,
  },
  empty: {
    name: "empty",
    input: {
      rows: [],
      candidates: stepCandidatesFixture,
      waferCount: 25,
    },
  },
  withNewRows: {
    name: "with-new-rows",
    input: {
      rows: [
        ...stepRowsFixture,
        ...stepCandidatesFixture.map((candidate) =>
          createStepRowFromCandidate(candidate)
        ),
      ],
      candidates: stepCandidatesFixture,
      waferCount: 25,
    },
  },
  allReleased: {
    name: "all-released",
    input: {
      ...stepsFixture,
      release: {
        ...stepsFixture.release,
        releaseStatus: "known",
        releasedStepIds: ["step-01", "step-02", "step-03"],
      },
    },
  },
  mixedRelease: {
    name: "mixed-release",
    input: {
      ...stepsFixture,
      release: {
        ...stepsFixture.release,
        releaseStatus: "known",
        releasedStepIds: ["step-01"],
      },
    },
  },
  allUnreleased: {
    name: "all-unreleased",
    input: {
      ...stepsFixture,
      release: {
        ...stepsFixture.release,
        releaseStatus: "known",
        releasedStepIds: [],
      },
    },
  },
  releaseStatusUnknown: {
    name: "release-status-unknown",
    input: {
      ...stepsFixture,
      release: {
        ...stepsFixture.release,
        releaseStatus: "unknown",
        releasedStepIds: [],
      },
    },
  },
  readonlyUnknownAssignments: {
    name: "readonly-unknown-assignments",
    input: {
      rows: stepRowsFixture.map((row) => ({
        ...row,
        baseline: false,
        condition: "—",
        factor: "—",
        recipe: "—",
        assignments: row.assignments.map(() => "—" as const),
        editable: false,
      })),
      candidates: [],
      waferCount: 25,
      release: {
        steps: [],
        releaseStatus: "unknown",
        releasedStepIds: [],
      },
      releaseHistory: { events: [] },
      readonly: true,
      sourceNote: "当前只提供 Lot、Step 与 Wafer 顺序；Split assignment、Recipe 和 Release 事实未提供。",
    },
  },
} satisfies Record<string, StepsScenario>
