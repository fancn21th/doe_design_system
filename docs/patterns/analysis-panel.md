# AnalysisPanel Contract

## Status

**Established for v0.1 first-round UI alignment.** The Pattern is selected from
Dashboard 01 as the standard wide analytical surface; domain evidence and
interaction contracts remain separate.

## Purpose

Present one bounded analytical question with its title, scope, local controls,
and primary evidence in a stable reading order.

## Anatomy

1. Analytical title;
2. Scope, population, period, or provenance context;
3. Optional local view/filter control;
4. Primary evidence surface, such as a chart, matrix, or inspection result.

## Visual Rules

- Use the shared [Analytical Surface Contract](../foundation/analytical-surfaces.md).
- Keep the heading and local controls together in the header so readers can
  tell what evidence the control changes.
- Give evidence the dominant area; controls must not compete with it.
- Substitute controls responsively only when they preserve the same local
  intent and selected state.
- A chart, wafer map, or table keeps its own Domain semantics; this Pattern
  does not assign their units, thresholds, or assessment states.

## Non-goals

- A generic dashboard chart with decorative area gradients.
- Application routing, page-level filters, or cross-panel workflow.
- A universal time-range policy.

## Evidence

Dashboard 01 `ChartAreaInteractive` provides the selected visual reference:
title and scope at the leading edge, bounded local range controls, and an
evidence-dominant body. Its visitors data, date ranges, and area fills are not
adopted DOE rules.
