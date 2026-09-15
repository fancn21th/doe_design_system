# Report Box & Cpk

## Intake

- Component name: Report Box & Cpk
- Sequence: 020
- Source page: frozen Report Center `BoxChartModule.tsx`; its implementation
  is evidence, not a source to copy.
- Backend contract: `GET /api/bff/report-center/{sourceId}/modules/box-cpk`
- Intake status: contract-ready; component implementation has not started.

## Observed UI Region

The report tab contains one selected-parameter analysis surface with a
page-owned CP parameter/baseline selector; captured baseline/Cpk and Mock Spec
evidence; wafer distribution; abnormal-wafer predicates; direct, associated and
unassigned yield impact; and an AI/fallback narrative with limitations.

## Candidate Module Boundary

`ReportBoxCpk` is a deep presentation module at the report-analysis seam. Its
small interface accepts one schema-shaped, already-selected immutable analysis
bundle and emits only local wafer/stage inspection intents. Its implementation
owns layout, responsive grouping, local expand/hover state and evidence
labeling. It does not fetch, select a parameter/baseline, filter injected data,
calculate Cpk/risk/impact, or turn association into a cause.

Changing CP parameter, baseline policy, manual wafer, source or CP slice stays
in DOE App workflow and creates a new BFF query. The module receives the
resulting immutable bundle.

## Candidate UI-facing Input Contract

The eventual `ReportBoxCpkInput` contains typed display facts, not a BFF DTO:

- selected parameter/unit, baseline coverage and captured nullable Cpk;
- Mock Spec/formal-spec lines and wafer distribution groups;
- backend-evaluated abnormality predicates/statuses;
- backend impact types with non-causality limitation text;
- narrative text alongside deterministic facts/limitation status; and
- `ready` / `pending` / `unavailable` display status.

Missing facts remain missing. Mock Spec is visibly distinct from formal spec,
and `ASSOCIATED` impact cannot be presented as causal.

## Out of Scope

- BFF calls, retries, source/slice/parameter/baseline workflow.
- Recalculation of Cpk, Mock Spec, anomaly risk or impact.
- A local combined risk score or causal conclusion.
- Copying Ant Design, legacy report code or a duplicate measurement chart.

## Open Questions Before Implementation

- What BFF-authorized point representation is sufficient for V1 distribution
  without forcing a full raw-die read?
- Is V1 stage comparison a local expansion or deferred until its exact display
  payload is defined?
- Which deterministic facts accompany the compact narrative view?
