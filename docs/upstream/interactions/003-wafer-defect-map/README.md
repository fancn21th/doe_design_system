# Wafer Defect Map

Source prototype: `http://localhost:8080/preview.html`

Observed on: 2026-08-26

## Scope

This observation captures the `Wafer Defect Map` behavior inside the Stage Dashboard evidence layer.

It is upstream evidence for the future `wafer-defect` component contract, fixtures, and scenarios. It is not DMS integration, SPC polling, defect classification logic, or root-cause analysis.

## Evidence

- `01-wafer-defect-map-selected.png`: `W01` selected, first defect point active, right-side image evidence showing `1 / 2`.

Related component intake:

- `docs/upstream/components/005-experiment-lot-step-steps-stage-wafer-defect/`

## Purpose

`Wafer Defect Map` is a source-aware evidence exploration surface.

It lets the user:

- choose an abnormal wafer
- inspect the defect count and type distribution for that wafer
- see where defect groups are positioned on a wafer map
- hover or select a defect point
- inspect the selected die/defect evidence on the right
- open a larger defect image modal

The component must clearly distinguish source-backed facts from illustrative prototype data.

## Source Boundary

The prototype explicitly marks:

- Source-backed: wafer defect count and sample timestamp come from SPC.
- Illustrative: point position, coordinate, defect type, and defect image are prototype examples.

This distinction should survive into the component contract. A future implementation should not imply that illustrative coordinates or images are real DMS evidence unless the schema marks them as source-backed.

## Visible Layout

The component has three main regions:

- Left wafer list: abnormal wafers and defect counts.
- Center map panel: wafer position view with grid, wafer outline, rings, crosshair, notch, and defect points.
- Right detail panel: selected wafer summary, defect type distribution, selected coordinate, image counter, image preview, and previous/next controls.

The whole module is wrapped by a card header:

- Title: `Wafer Defect Map`
- Subtitle: `按异常Wafer查看缺陷数量、类型、Die位置与缺陷明细`
- Source chip: `SPC DEFECT`

## Prototype Data Shape

Observed wafer list:

```ts
const defectWafers = [
  { id: "W01", count: 2 },
  { id: "W02", count: 4 },
  { id: "W08", count: 2 },
  { id: "W11", count: 6 },
  { id: "W24", count: 7 },
  { id: "W25", count: 9 },
]
```

Prototype local state:

```ts
type WaferDefectMapState = {
  selectedDefectWafer: string
  selectedDefectPointId: string
  selectedDefectImage: number
  defectTypesExpanded: boolean
}
```

Initial state:

```ts
{
  selectedDefectWafer: "W01",
  selectedDefectPointId: "DIE-01-001",
  selectedDefectImage: 0,
  defectTypesExpanded: false,
}
```

Prototype generated point shape:

```ts
type DefectPoint = {
  id: string
  defects: Array<{
    id: string
    type: string
    typeId: string
  }>
  defectCount: number
  typesSummary: string
  defectIds: string
  type: string
  typeId: string
  x: number
  y: number
  cx: number
  cy: number
}
```

Observed id formats:

- Die point id: `DIE-<wafer-number>-<die-seq>`, for example `DIE-01-001`.
- Defect id: `DF-<wafer-number>-<die-seq>-<defect-seq>`, for example `DF-01-001-01`.

## Wafer Selection

Clicking a wafer in the left list:

- Sets `selectedDefectWafer`.
- Sets `selectedDefectPointId` to the first generated point for that wafer.
- Resets `selectedDefectImage` to `0`.
- Resets `defectTypesExpanded` to `false`.
- Rerenders the map, defect type distribution, and right-side image evidence.

Selection visual:

- Active wafer uses blue border.
- Active wafer uses light blue background.
- Active wafer has an inset blue accent on the left edge.

## Defect Point Hover

Hovering or focusing a defect point shows a tooltip.

Tooltip content:

- `Wafer编号`
- `坐标`
- `缺陷数量`
- `缺陷类型`
- `缺陷ID`

Tooltip behavior:

- Follows pointer movement.
- Is clamped to viewport bounds.
- Hides on mouse leave or blur.
- Does not affect selected point state.

## Defect Point Selection

Clicking a defect point:

- Sets `selectedDefectPointId`.
- Resets `selectedDefectImage` to `0`.
- Rerenders the right-side die image panel.

Selection visual:

- Active point keeps a white stroke.
- Active point renders a pulsing halo.
- When reduced motion is preferred, the halo should become static.

## Defect Type Distribution

The right panel computes type counts from defects under the selected wafer.

Prototype behavior:

- Type rows are sorted by count descending, then type name.
- Shows up to Top 5 by default.
- If more than five types exist, a toggle expands or collapses the full list.
- Toggle labels are represented by accessible title and aria-label.

For `W01` in the screenshot:

- `Particle`: `1`
- `Scratch`: `1`

## Die Image Panel

The right-side image panel is driven by the selected defect point.

Visible fields:

- Coordinate, for example `坐标 X 14 / Y 24`.
- Image index, for example `1 / 2`.
- Preview image.
- Overlay label, for example `Particle ×1`.
- Defect id, for example `DF-01-001-01`.
- Previous and next controls.

Clicking previous/next:

- Cycles `selectedDefectImage` within the selected point's defect count.
- Wraps around at the beginning or end.
- Updates image index, type, and defect id.
- Does not change wafer or defect point selection.

Clicking the image or zoom affordance:

- Opens the defect image modal for the selected point.

## Defect Detail Modal

The modal is a focused image evidence view.

Open behavior:

- Sets `selectedDefectPointId` to the requested point.
- Reads the current `selectedDefectImage`.
- Sets modal title to `<point-id> · <defect-count> Defects`.
- Shows a larger illustrative image.
- Shows metadata for wafer, coordinate, defect type, defect id, and image index.
- Focus moves to the close button.

Close behavior:

- Close button closes the modal.
- Overlay click closes the modal.
- Escape closes the modal.
- Escape handling for the defect modal should not accidentally trigger outer layer close first.

Modal previous/next behavior:

- Cycles images in the same selected point.
- Updates modal image and metadata in place.

## Local State Ownership

The `wafer-defect` component may own:

- selected wafer
- selected defect point
- selected image index
- defect type expansion state
- hover tooltip open/position state
- defect detail modal open state

The component should not own:

- SPC data fetching
- DMS image fetching
- MES execution state
- Stage Dashboard layer open/close
- route or page state
- defect classification business rules

## Candidate Component Contract

```ts
type WaferDefectSourceKind = "spc" | "dms" | "illustrative" | "unknown"

type WaferDefectMapInput = {
  title?: string
  subtitle?: string
  sourceLabel: string
  sourceNote: string
  wafers: WaferDefectSummary[]
  selectedWaferId?: string
  onSelectedWaferChange?: (waferId: string) => void
  readonly?: boolean
}

type WaferDefectSummary = {
  waferId: string
  defectCount: number
  sampledAt?: string
  points: WaferDefectPoint[]
  source: {
    count: WaferDefectSourceKind
    sampledAt: WaferDefectSourceKind
    position: WaferDefectSourceKind
    image: WaferDefectSourceKind
  }
}

type WaferDefectPoint = {
  id: string
  coordinate?: {
    x: number
    y: number
    source: WaferDefectSourceKind
  }
  mapPosition: {
    x: number
    y: number
    source: WaferDefectSourceKind
  }
  defects: WaferDefectEvidence[]
}

type WaferDefectEvidence = {
  id: string
  type: string
  typeId?: string
  image?: {
    src?: string
    alt: string
    source: WaferDefectSourceKind
  }
}
```

This schema is intentionally UI-facing. It should not be treated as the SPC, DMS, MES, or backend API contract.

## Scenario Candidates

- `normal`: several abnormal wafers, selected wafer, selected defect point, image evidence visible.
- `wafer-selected`: choosing another wafer resets point and image index.
- `point-hovered`: tooltip shows wafer, coordinate, defect count, type summary, and defect ids.
- `point-selected`: right-side detail updates for the selected point.
- `image-next-prev`: image controls cycle within selected point.
- `image-modal-open`: large modal opens and focus moves to close.
- `image-modal-next-prev`: modal image controls update metadata in place.
- `many-defect-types`: type distribution shows Top 5 and can expand.
- `single-defect`: one point with one image, counter shows `1 / 1`.
- `no-image`: defect point exists but no DMS image source is available.
- `empty`: no abnormal wafers.
- `loading`: source data is loading.
- `error`: source data cannot be read.
- `readonly`: exploration is allowed, but no mutation callbacks are exposed.
- `reduced-motion`: active point halo is static.

## Shadcn Foundation Candidates

Use existing shadcn primitives where available:

- `Card` for the module container.
- `Button` for wafer list items, map points, image navigation, zoom, and close actions.
- `Badge` for `SPC DEFECT`.
- `Dialog` for the defect detail modal.
- `Tooltip` for defect point hover details if the local primitive supports pointer-position requirements; otherwise keep tooltip behavior local to the domain component.
- `Separator` for right-panel section dividers if available.

Do not create custom foundation controls for buttons, badges, or modal behavior.

## Open Questions

- Are die coordinates source-backed, illustrative, or mixed by data source?
- Should image preview support real DMS images later, or remain evidence metadata only until DMS integration exists?
- Should wafer selection be controlled by the parent Stage Dashboard, or local to `wafer-defect`?
- Should `Source-backed` be a shared provenance component used by both `wafer` and `wafer-defect`?
- Should the map coordinate system use wafer-relative normalized coordinates or die-grid coordinates in the public schema?
