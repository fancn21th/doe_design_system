# ExperimentSummary Contract

## Status

**Draft candidate; not promoted.** This contract captures a DOE report subject
summary observed in Report Overview. It is not a generic PageHeader and does
not replace the existing `Experiment` domain component.

## Purpose

Identify the DOE experiment or report subject before readers interpret its
measurements, exceptions, and evidence.

## Anatomy

1. Subject identity, such as product or experiment name;
2. Lot, step, and wafer scope;
3. A concise round summary that preserves supplied certainty and provenance.

## Data Contract

```text
ExperimentSummary
  subject: product, experiment, or report identity
  lot: explicit lot identifier
  stepScope: completed or observed step scope
  waferScope: explicit wafer scope
  summary?: source-backed contextual statement
  sourceLabel?: provenance label
```

The scope fields must state what they count. A wafer count must not silently
imply planned, released, executed, completed, or observed scope.

## Visual Rules

- Establish identity before aggregates or exception lists.
- Keep Lot, Step, and Wafer scope compact and individually readable.
- Present the summary as context, not as an unsupported performance verdict.
- Use a neutral analytical surface; the surrounding Card is an implementation
  choice, not a required visual identity.

## States

- Identified: required identity and scope are present.
- Partial: one or more scope facts are unavailable and shown as such.
- Source provisional: the contextual summary is labelled as provisional.
- Empty: do not render a fabricated subject from unrelated report data.

## Non-goals

- Generic page title, navigation, routing, or page actions.
- A release/execution status surface.
- A causal interpretation of reported metrics.

## Evidence

[Report Overview Visual Analysis](../visual-system/reference-analysis/report-overview-analysis.md)
documents the current identity composition and source schema.
