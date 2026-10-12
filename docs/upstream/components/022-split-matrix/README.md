# Split Matrix upstream intake

- Source: `doe-copilot-hackathon-template/apps/frontend-ds/src/components/split-matrix.tsx` and `step-config-dialog.tsx` on `feateure/uat_release_1010` at `c078c27` (2026-10-12 local comparison).
- Visible surface: Stage / Step × 25 wafer-slot matrix, Baseline and Variant rows, Condition, Recipe, local Step actions, Qtime and EDC Spec dialogs.
- Template mode: slots #1–#25 are portable positions; Lot mode enables only explicitly identified physical wafer slots.
- Input and output: the consumer supplies flow steps, wafer identities, draft rows, lock state and template positions; the component emits a changed draft, slot intent and release intent.
- Boundary: template persistence, source Lot loading, RunCard preview/submission, Oracle and MES calls remain in DOE App and Backend.
- Open question: Qtime and EDC values are saved by the consumer, but the external MES field mapping is not confirmed here.
