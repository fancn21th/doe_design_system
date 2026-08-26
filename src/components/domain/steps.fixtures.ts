import type {
  StepAssignment,
  StepCandidate,
  StepRow,
  StepsInput,
} from "@/schemas/domain-component-inputs"
import { runCardFixture } from "@/components/domain/runcard.fixtures"

const waferCount = 25

function assignments(
  prefix: StepAssignment[],
  fill: StepAssignment,
  count = waferCount
) {
  return [...prefix, ...Array.from({ length: count - prefix.length }, () => fill)]
}

export const stepCandidatesFixture: StepCandidate[] = [
  {
    id: "fs-tape-b-01",
    stage: "FS-TAPE",
    step: "S-B-TAPE-B-01",
    seq: "seq-num-003",
    recipeOptions: ["RCP-FS-TAPE-01"],
  },
  {
    id: "oxide-etch-main",
    stage: "OXIDE-ETCH",
    step: "OXIDE-ETCH-MAIN",
    seq: "seq-num-005",
    recipeOptions: ["RCP-OXIDE-ETCH-01"],
  },
  {
    id: "clean-d-01",
    stage: "CLEAN",
    step: "S-CLEAN-D-01",
    seq: "seq-num-006",
    recipeOptions: ["RCP-CLEAN-01"],
  },
]

export const stepRowsFixture: StepRow[] = [
  {
    id: "oxide-baseline",
    stage: "OXIDE_ETCH",
    step: "MAIN",
    seq: "seq-num-001",
    baseline: true,
    condition: "Baseline",
    factor: "Power",
    recipe: "RCP-OXE-STD-01",
    recipeOptions: ["RCP-OXE-STD-01"],
    assignments: assignments(["B", "B", "B"], "V"),
    editable: false,
  },
  {
    id: "oxide-variant",
    stage: "",
    step: "MAIN",
    seq: "seq-num-001",
    baseline: false,
    condition: "Power +5%",
    factor: "Power",
    recipe: "RCP-OXE-HP-02",
    recipeOptions: ["RCP-OXE-HP-02"],
    assignments: assignments(["↔", "↔", "↔"], "V"),
    editable: false,
  },
  {
    id: "clean-variant",
    stage: "CLEAN",
    step: "MAIN",
    seq: "seq-num-002",
    baseline: false,
    condition: "Time +10s",
    factor: "Time",
    recipe: "RCP-CLN-T10-03",
    recipeOptions: ["RCP-CLN-T10-03"],
    assignments: assignments(["↔", "↔", "↔"], "V"),
    editable: false,
  },
]

export const stepsFixture: Required<StepsInput> = {
  rows: stepRowsFixture,
  candidates: stepCandidatesFixture,
  waferCount,
  release: runCardFixture,
  releaseHistory: {
    events: [],
  },
}

export function createStepRowFromCandidate(candidate: StepCandidate, count = waferCount): StepRow {
  return {
    id: `added-${candidate.id}`,
    stage: candidate.stage,
    step: candidate.step,
    seq: candidate.seq,
    baseline: false,
    condition: "",
    factor: "",
    recipe: "",
    recipeOptions: candidate.recipeOptions,
    assignments: Array.from({ length: count }, () => "E"),
    editable: true,
  }
}
