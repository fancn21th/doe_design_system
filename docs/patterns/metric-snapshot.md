# MetricSnapshot Contract

## Status

**Established for v0.1 first-round UI alignment.** Its reusable API still
requires validation in a second DOE context before it is treated as a stable,
cross-product Pattern.

## Purpose

Present one comparable analytical measure with the evidence a DOE reader needs
to interpret it. This is a metric snapshot, not a generic KPI or a Card API.

## Anatomy

1. Measure label;
2. Comparable value and explicit unit when applicable;
3. Optional assessment state;
4. Evidence context, such as population, threshold, scope, or provenance.

The grouping of several snapshots establishes scan order only; it does not make
their measurements semantically equivalent.

## Data Contract

```text
MetricSnapshot
  label: human-readable measure name
  value: comparable formatted measure
  unit?: explicit unit or dimension
  assessment?: explicit domain assessment
  evidence?: scope, population, threshold, period, or provenance
```

`assessment` must be explicit rather than inferred from a value or colour.
`evidence` must not make a causal claim that the supplied report data does not
support.

## Visual Rules

- Preserve the reading order: label → value/unit → assessment → evidence.
- Use tabular numerals when values are compared across a group.
- Keep assessment adjacent to the value it qualifies; colour is supplementary
  to text or icon semantics.
- Use documented foundation density and the local UI primitive; a Card is one
  possible implementation, not part of this Pattern's identity.
- When it uses an analytical Card surface, follow
  `docs/foundation/analytical-surfaces.md`.

## States

- Measured: value and evidence are available.
- Assessment required: value has an explicit watch/bad/review state.
- Unavailable: value or evidence is missing; show it as unavailable, never as
  zero or passing.
- Source provisional: evidence exists but its provenance remains provisional.

## Non-goals

- A dashboard marketing KPI, growth trend, or decorative delta treatment.
- A global DOE assessment taxonomy.
- A fixed number of columns, a fixed card surface, or page layout.

## Evidence

[Report Overview Visual Analysis](../visual-system/reference-analysis/report-overview-analysis.md)
records the source evidence and known gaps: units, thresholds, periods, trends,
and provenance are not yet uniformly modelled.

Dashboard 01 is the selected visual reference for this Pattern's compact
surface, label/value/action/evidence hierarchy, and responsive group rhythm.
