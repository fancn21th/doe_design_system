# YieldExceptionSummary Contract

## Status

**Draft candidate; not promoted.** This is a DOE Domain asset candidate that
composes a Table Pattern/primitive; it is not a generic `DataTable`.

## Purpose

Make a yield exception attributable to its split context, wafer, baseline
comparison, and available CP evidence.

## Anatomy

1. Section title and exception scope;
2. A dense, readable row surface;
3. Split Group and Variant context;
4. Wafer identity and quantitative yield;
5. Available baseline comparison and CP evidence;
6. Explicit assessment that qualifies the same row.

## Data Contract

```text
YieldException
  splitGroup: DOE split context
  variant?: condition or recipe variant
  waferId: observed wafer identity
  yield: quantitative yield with defined unit/format
  baselineDelta?: comparison to an explicit baseline
  cpSummary?: available CP evidence
  assessment: explicit analytical assessment
  provenance?: source status
```

Missing baseline or CP evidence remains missing. It cannot be rendered as a
passing result or inferred from the yield alone.

## Visual Rules

- Keep all attribution facts on the same readable row.
- Prioritise row density, stable headers, and local horizontal containment over
  decorative card nesting.
- Use monospace or another documented identifier treatment for wafer IDs when
  it improves comparison.
- Assessment must be textual/iconographic as well as tonal; colour alone is
  insufficient.

## States

- Exception present: one or more attributable rows are shown.
- No exceptions: the owning application explicitly chooses whether to omit the
  section or show a no-exception state; neither means data coverage is complete.
- Partial evidence: baseline delta or CP summary is unavailable and remains
  visibly unavailable.
- Source provisional: evidence is labelled before it is used for decisions.

## Non-goals

- Sorting, selection, drag reordering, pagination, or generic column controls.
- A universal low-yield threshold or one global DOE status taxonomy.
- Converting missing evidence into zero, pass, or no issue.

## Evidence

[Report Overview Visual Analysis](../visual-system/reference-analysis/report-overview-analysis.md)
records the current component, schema, fixture, and empty-state behaviour.
