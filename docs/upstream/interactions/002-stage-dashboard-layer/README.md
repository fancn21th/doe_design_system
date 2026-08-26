# Stage Dashboard Layer

Source prototype: `http://localhost:8080/preview.html`

Observed on: 2026-08-26

## Scope

This observation captures the Stage Dashboard layer behavior after MES data is available.

It is upstream evidence for future `layer`, `wafer`, and `wafer-defect` component contracts. It is not app routing, MES polling, real export, or backend integration behavior.

## Evidence

- `01-stage-dashboard-full-layer.png`: full Stage Dashboard workspace state with `02 ETCH` selected.

## Entry Points

The prototype exposes two Stage Dashboard presentations:

- Full workspace layer: clicking the top navigation `Stage Dashboard` opens the dashboard inside `stage-dashboard-host`.
- Context preview layer: clicking a stage link or `查看Stage Dashboard` from the execution center opens the same dashboard content in the right preview panel.

Before opening either presentation:

- If configuration has not been released, the prototype closes the contextual preview and shows `配置尚未下发，暂无MES返回数据，无法查看Stage Dashboard`.
- If the selected stage has no returned data, the prototype shows `<Stage> Stage暂无MES返回数据`.

## Full Workspace Layer

When opened as the top-level Stage Dashboard view:

- The application enters `stage-mode`.
- The normal conversation area is hidden.
- The right preview panel is hidden.
- `stage-dashboard-host` becomes visible and owns the scroll container.
- The dashboard body scrolls to the top.
- A toast confirms `已打开 <Stage> Stage Dashboard`.

The screenshot shows this full workspace layer:

- Top bar title is `stage dashboard`.
- Status pill is `MES数据已返回`.
- Top-right actions include download, close, and fullscreen.
- Main content starts with a Stage selector set to `02 ETCH`.

## Context Preview Layer

When opened from execution-center context:

- The application enters `context-preview`.
- The execution center stays visible.
- The preview panel renders the Stage Dashboard paper.
- Preview title becomes `stage dashboard`.
- Preview status becomes `MES数据已返回`.
- On narrow viewports, the preview panel becomes a drawer.
- A toast confirms `已在右侧打开 <Stage> Stage Dashboard`.

Closing the contextual preview:

- Removes `context-preview`.
- Hides the preview drawer.
- Sets the preview `aria-hidden` state back to true.
- Hides the Stage filter.

## Layer Actions

Download:

- Does not perform a real export in the prototype.
- Shows a toast: `已准备 <Stage> Stage Dashboard 导出文件`.
- Should become an `onExport` callback in Domain UI rather than file-generation logic inside the component.

Fullscreen:

- Toggles a `full` document state.
- Hides the app shell, sidebar, taskbar, workspace, and resizers.
- Shows the preview as a fixed full-viewport layer.
- Gives the paper a maximum width around the evidence-reading surface.
- Escape exits fullscreen.

Close:

- In contextual preview, close hides the preview layer.
- In fullscreen, Escape exits fullscreen first.
- Domain UI should expose close intent through `onOpenChange` or `onClose`.

## Stage Selector

The dashboard has a Stage selector at the top of the content area.

Prototype options are derived from stage execution state:

```ts
type StageOption = {
  id: "PHOTO" | "ETCH" | "CLEAN" | "IMPLANT" | "ANNEAL"
  no: "01" | "02" | "03" | "04" | "05"
  data: "Complete" | "12 / 18" | "Waiting" | "0 / 25"
}
```

Rules:

- Stages with returned data are selectable.
- Stages with `Waiting` or `0 / 25` data are disabled and labeled `（暂无数据）`.
- Selecting a stage reopens/rerenders the dashboard in the current presentation mode.
- Selection should be local UI state or a controlled prop; it should not fetch MES data by itself.

## Process Capability Area

The first evidence card is `Process Capability by Wafer`.

Visible sections:

- Header title and subtitle: `按Wafer比较原始测量值、Mean ± 3σ、规格窗口与Cpk`.
- Source chip: `SPC PARAMETER`.
- Left parameter list with count, selected parameter, wafer count, and raw point count.
- Summary row with selected parameter id, observed wafer count, raw points, sample timestamp, LSL, TARGET, USL, and CPK.
- Derived variant strip with reference candidate and variant candidate.
- Cpk / 3σ chart by observed wafer.
- Legend for raw value, Mean ± 3σ, Mean, and active source SPEC.

Local interactions:

- Selecting a parameter updates the summary, candidate strip, chart, and CPK values.
- Chart raw points expose per-point titles in the prototype.

## Wafer Defect Area

The second evidence card is `Wafer Defect Map`.

Visible sections:

- Header title and subtitle: `按异常Wafer查看缺陷数量、类型、Die位置与缺陷明细`.
- Source chip: `SPC DEFECT`.
- Source-backed warning: wafer defect counts and sample time come from SPC; point positions, coordinates, defect types, and images are prototype illustrations.
- Abnormal wafer list.
- Wafer position map.
- Defect type distribution.
- Selected die detail with coordinates, image index, illustrative image, and previous/next image controls.

Local interactions:

- Selecting an abnormal wafer resets the selected defect point and image index.
- Hovering a defect point shows wafer, coordinate, count, type, and defect id details.
- Clicking a defect point updates the right-side die detail.
- Clicking the die image or zoom control opens a defect detail modal.
- Previous/next image controls cycle within the selected defect point.
- Defect type distribution can expand beyond Top 5 when more than five types exist.

## Local State Model

The layer family should model these local states:

```ts
type StageDashboardLayerState = {
  presentation: "side-preview" | "full-workspace" | "fullscreen"
  selectedStageId: string
  selectedParameterId: string
  selectedDefectWaferId: string
  selectedDefectPointId: string | null
  selectedDefectImageIndex: number
  defectTypesExpanded: boolean
}
```

The host application may control open state, selected stage, and callbacks. The Domain UI asset may own local parameter/defect exploration state.

## Component Boundary

Likely future decomposition:

- `layer`: reusable domain layout component for evidence preview/full workspace containers.
- `wafer`: process capability by wafer evidence component.
- `wafer-defect`: wafer defect map and defect image exploration component.

The layer component should own:

- presentation layout
- header/title/status/action placement
- close/fullscreen/export intent callbacks
- local presentation toggles

The layer component should not own:

- application route switching
- MES polling
- real export/download implementation
- source data loading
- cross-page workflow state

## Scenario Candidates

- `closed`: no layer visible.
- `side-preview-open`: opened from execution center with MES data returned.
- `full-workspace-open`: opened from top navigation with `02 ETCH` selected.
- `fullscreen`: shell hidden, preview occupies the viewport.
- `stage-with-data-selected`: selecting `PHOTO` or `ETCH` updates dashboard content.
- `stage-without-data-disabled`: `CLEAN`, `IMPLANT`, or `ANNEAL` disabled because no data has returned.
- `parameter-selected`: parameter list changes the capability summary and chart.
- `defect-wafer-selected`: abnormal wafer list changes wafer map and side details.
- `defect-point-hovered`: tooltip displays wafer, coordinate, count, type, and defect ids.
- `defect-point-selected`: right-side die image panel updates.
- `defect-image-modal-open`: zoom opens the larger defect image modal.
- `export-requested`: export action emits callback/toast without doing real export.
- `source-error`: source data unavailable or inconsistent.
- `empty`: stage has no parameter or defect evidence.
- `loading`: MES data is expected but not yet available.

## Shadcn Foundation Candidates

Use existing shadcn primitives where available:

- `Card` for evidence modules.
- `Button` for icon actions and local commands.
- `Select` for Stage selection.
- `Badge` for source/status chips.
- `Dialog` for defect image modal.
- `ScrollArea` if the project exposes it for layer body scrolling.

Do not create foundation primitives for shell, button, select, badge, or modal behavior. Domain UI should only compose them.

## Open Questions

- Should the public component name be the generic `layer` asset, or a more specific `stage-dashboard-layer`?
- Should fullscreen state be internal to the layer or controlled by the host application?
- Should Stage selection be controlled by the host application for URL/state synchronization, while parameter and defect exploration stay local?
- Should export intent include the selected stage and selected evidence sections, or only the whole dashboard?
