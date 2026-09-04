# Business Component Intake

This directory is the intake log for user-provided business component
boundaries.

## Status

Intake is in progress. The user will provide one component screenshot at a time
and explicitly say when the input is complete.

## Naming

Use this folder pattern:

```text
NNN-component-slug/
```

Examples:

```text
001-lot-round-basic-info/
002-step-wafer-split-table/
```

## Per-component Record

Each component folder should include:

```text
README.md
screenshot.<ext>
```

`README.md` should record:

- Component name from the user.
- Source screenshot filename.
- User-provided notes.
- Observed UI region.
- Candidate domain boundary.
- Open questions.

Keep these records close to the user's input. Do not over-model them during
intake.

## Current Report Tab Intake

The `DOE Report` prototype tab batch is recorded as:

- `010-report-overview/`
- `011-report-split-table/`
- `012-report-yield-analysis/`
- `013-report-wafer-map/`
- `014-report-parameter-median/`
- `015-report-cp-data/`
- `016-report-inline-data/`
- `017-report-cp-inline/`

Each folder treats one right-side report tab as one large business component.

## Current Shared Component Intake

- `018-measurement/`
- `019-layout-shell/`

`Measurement` is the shared measurement distribution component expected to be
composed by `015-report-cp-data/` and `016-report-inline-data/`.

`Layout Shell` is the shared layout-only component with the `layout-*` naming
prefix. It uses skeleton placeholders and owns no business content.

## Code Evidence

- `report-code-first-pass.md`

Use the code first pass when moving from screenshot intake to detailed design.
It records which behavior was observed in the local prototype source and which
parts still need Playwright trace or product confirmation.
