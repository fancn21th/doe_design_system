# DOE Visual System Evolution Log

## v0.1.1 — 2026-09-22

- Added the scoped Wafer Yield × CP Fail chart dimensions and recorded its
  Analytical Surface, local scrolling, legend, tooltip, and grouping contract
  under Report Split Table.

## v0.1 — 2026-09-18

- Established `DESIGN.md` and `docs/visual-system/` as the DOE product design
  system's sole normative document set.
- Separated the Fumadocs documentation shell, shadcn implementation primitives,
  DOE product visual language, and DOE domain assets.
- Established token, Pattern, Domain, and reference-distillation entry points.
- Migrated legacy design-system documentation to pointer pages so it no longer
  duplicates visual rules.

## 2026-10-09 — CP × Inline evidence colours

Candidates and Fit record scoped blue emphasis/Target, teal Linear, purple Quadratic/negative correlation, green Wafer/positive correlation, and red specification limits in their [component contract](../../content/docs/domain/report/cp-inline.mdx). These distinguish evidence identities alongside labels and signs; they do not change generic chart tokens or imply statistical validity.

## 2026-10-09 — Split Table loading / empty pilot

Scoped the user-approved shadcn Empty/Spinner composition to Split Table: centered
title and description, rounded muted spinner media only during loading, no Cancel
or empty-state icon. Other tabs await user review. The component-specific rule
and previews live in the [Split Table contract](../../content/docs/domain/report/split-table.mdx).

## 2026-10-10 — Report state adoption

User accepted the Split Table pilot and approved adoption in every Report tab.
The common ReportState owns loading / empty presentation, using the approved
shadcn Empty and Spinner composition. Loading wording and motion are shared;
empty, selection and filter wording remain specific to the visible evidence.
Measurement and WaferMapGallery offer optional consumer presentation slots so
standalone Shared previews keep their existing fallback. See the Report MDX
contracts and their executable loading / empty previews.
