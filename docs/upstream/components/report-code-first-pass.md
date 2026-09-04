# DOE Report Code First Pass

## Purpose

This file records the first pass of component evidence inferred from the local
prototype code, not only from screenshots.

Evidence sources:

- `http://127.0.0.1:8888/DOE%20report.html`
- `http://127.0.0.1:8888/stage%20dashboard.html?embed=inline&ui=20260903-50`
- `http://127.0.0.1:8888/DTJX-DOE-PROTOTYPE-main/round-report/index.html?embed=1&tab=inline&ui=20260903-43`

The prototype code is upstream evidence. It is not a direct implementation
instruction and should not be copied blindly into the design system.

## Sufficiency

Current evidence is enough for a first implementation-planning pass:

- Component boundaries by report tab.
- Shared component boundaries for `WaferMap` and `Measurement`.
- Initial visual model and interaction contracts.
- Parent-child composition constraints.
- Known non-goals and unknowns.

Current evidence is not enough for final production semantics:

- Backend DTO and canonical data source contracts are still missing.
- Some thresholds are prototype-local and need confirmation.
- Some labels are marked mock or source-provisional.
- iframe-hosted modules need explicit integration decisions before being
  rewritten as design-system components.

## Playwright Trace Recommendation

A Playwright trace would improve confidence for interaction-heavy components.

Trace is useful for:

- Tab switching, focus management, and keyboard navigation.
- Hover tooltip behavior on measurement charts and wafer maps.
- Click-to-detail flows such as CP Data opening a detail distribution modal.
- Modal close, Escape, wheel zoom, zoom in, zoom out, and reset behavior.
- Embedded iframe loading, resize synchronization, and scroll behavior.
- Filter, combobox, clear, and reset flows.

Trace does not replace the source/data contract. It should be treated as
interaction evidence plus regression material, not as the only specification.

## Report Shell Evidence

Observed from the outer report page:

- The report uses a `role="tablist"` with tab buttons carrying `data-tab`.
- Panels carry `data-panel` and are hidden/shown by the tab id.
- `setTab(name)` updates active class, `aria-selected`, `tabIndex`, panel
  visibility, lazy iframe `src`, and resets `.main.scrollTop`.
- Tab keyboard navigation supports ArrowRight, ArrowDown, ArrowLeft, ArrowUp,
  Home, and End.
- `Inline Data` and `CP x Inline` are embedded via iframe in the prototype.

## Measurement Evidence

`CP Data` code evidence:

- Uses `canvas#boxCpkCanvas`.
- Draws raw die measurement points grouped by wafer.
- Draws y-axis grid, `Measurement Value (...)` label, mean marker, median line,
  mean +/- 3 sigma range, and LSL / USL spec lines.
- Tracks point count, wafer count, render mode, and hover group in canvas
  dataset fields.
- Hover finds nearest die point and shows wafer, die X/Y, stage, step, seq,
  condition, CP parameter, value, pass/fail, bin, and capability values.
- Click on the main chart opens a wafer group detail distribution modal.
- Detail modal supports close, Escape, zoom in, zoom out, reset, and wheel zoom.

`Inline Data` code evidence:

- Prototype iframe renders inline measurement distribution from accepted SPC
  data.
- It groups measurements by wafer and selected inline parameter.
- It draws measurement points, mean, median, mean +/- 3 sigma, and spec lines.
- It filters by selected parameter, detail wafer, status, type, matrix status,
  and search.
- It supports parameter row click, matrix cell click, wafer coverage click,
  hover / click point inspection, keyboard left/right browsing, and Escape
  unlock behavior.

Conclusion:

```text
Measurement should be the shared visual and interaction contract for grouped
measurement distributions. CP Data and Inline Data should adapt their data into
Measurement rather than owning separate chart implementations.
```

Renderer note:

- CP Data prototype uses canvas.
- Inline Data prototype contains SVG and canvas measurement renderers in
  different contexts.
- The design-system `Measurement` detailed design should choose the renderer
  based on density and interaction requirements, not by copying one prototype
  implementation path.

## CP x Inline Evidence

Observed from the embedded round-report code:

- A separate selection module owns which wafers enter analysis.
- It classifies wafers as `PAIRED`, `INLINE_ONLY`, `CP_ONLY`, or `NO_DATA`.
- Excluded wafers are represented as sparse exclusions, so newly valid wafers
  are included by default.
- The same selected wafer set applies to condition aggregation and wafer-level
  merged fitting.
- Linear fit requires at least two condition levels.
- Quadratic fit requires at least three condition levels.
- A single condition level is repeatability review, not factor boundary
  evidence.

This supports treating `CP x Inline` as a report-level analysis component, not
as part of `Measurement`.

## First-Round Creation Readiness

Ready to draft detailed design for:

- `Measurement` shared component.
- `Report CP Data` as a parent adapter around `Measurement`.
- `Report Inline Data` as a parent adapter around `Measurement`.
- `Report Wafer Map` as a parent adapter around shared `WaferMap`.

Need trace or further confirmation before finalizing:

- Exact tooltip copy and locked selection behavior.
- Modal/detail behavior scope for Measurement V1.
- Whether keyboard point browsing is required in V1.
- Which statistics are component-derived versus supplied.
- Whether iframe modules should be migrated all at once or decomposed in
  staged passes.
