# Analytical Surface Contract

## Status

**Established for v0.1 first-round UI alignment.** This contract defines the
shared surface used by the selected Dashboard 01 Metric Snapshot and Analysis
Panel references. It does not define the business content inside either
Pattern.

## Purpose

Create a quiet, bounded reading surface for DOE analytical information without
using decoration to imply importance.

## Contract

- Use the local shadcn `Card` primitive as the implementation base.
- Use one low-contrast, 1px neutral boundary (`--border`) to separate the
  surface from its canvas.
- Use the DOE card radius (`--doe-radius-card`) and the card background.
- Keep the surface neutral; hierarchy comes from content structure, spacing,
  typography, and explicit assessment—not an arbitrary colour fill.
- Do not nest a table inside a second analytical Card when its own bordered,
  horizontally contained table surface is the readable boundary.

## Elevation and Decoration

The Dashboard 01 source applies a `primary/5` gradient and `shadow-xs` to its
metric group. Those are reference-specific treatments, not part of this DOE
contract: no DOE semantic meaning has yet been established for either.

A shadow requires a named layering relationship. A colour fill requires a
named data, status, or evidence meaning.

## Evidence

The original Dashboard 01 files were inspected on another machine and are not
available in the current workspace. They remain historical evidence only. The
rules recorded above and the current repository's shadcn Card implementation
are the active sources for ongoing work; do not recreate or guess the former
absolute paths.
