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
