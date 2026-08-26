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
} satisfies Record<string, StepsScenario>
