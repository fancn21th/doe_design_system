# Release RunCard Flow

Source prototype: `http://localhost:8080/preview.html`

Observed on: 2026-08-26

## Scope

This observation captures the interaction from `Step × Wafer Split Table` release action into the RunCard release modal, then back to the execution center after submission.

This is upstream evidence for future `steps`, `runcard`, and `runcard-history` component contracts. It is not app-service or MES integration behavior.

## Evidence

- `01-runcard-modal-initial.png`: modal initial state after clicking `下发配置`.
- `02-runcard-modal-selected.png`: RC-001 group selected and ready to submit.
- `03-after-release-partial.png`: execution center after submitting 2 selected steps.

## Trigger

Starting from a configured Lot with a visible `Step × Wafer Split Table`, clicking the primary `下发配置` action opens a modal titled `配置RunCard并下发`.

The modal starts with no selected steps.

## Initial RunCard State

Prototype data model:

```ts
releaseSteps = [
  {
    id: "step-01",
    stage: "OXIDE_ETCH",
    name: "MAIN",
    seq: "Seq 1",
    detail: "Baseline / Variant A",
  },
  {
    id: "step-02",
    stage: "CLEAN",
    name: "MAIN",
    seq: "Seq 2",
    detail: "Variant B · Time +10s",
  },
  {
    id: "step-03",
    stage: "FS-TAPE",
    name: "S-B-TAPE-B-01",
    seq: "Seq 3",
    detail: "New Step",
  },
]

runCards = [
  { id: "RC-001", steps: ["step-01", "step-02"], collapsed: false },
  { id: "RC-002", steps: ["step-03"], collapsed: false },
]
```

Runtime selection state:

```ts
selectedReleaseSteps = Set<stepId>
releasedStepIds = Set<stepId>
```

Initial visible state:

- `RC-001` shows `0/2已下发`.
- `RC-002` shows `0/1已下发`.
- Footer shows `未选择Step`.
- Submit button text is `下发所选Step`.
- Submit button is disabled.
- Each unreleased step has a checkbox and a RunCard owner selector.
- Owner selector options are `未分配`, existing RunCards.

## RunCard Modal Interactions

Selecting a single step:

- Adds that step id to `selectedReleaseSteps`.
- Footer changes to `已选择 1 个Step`.
- Submit button changes to `下发 1 个Step`.
- Submit button becomes enabled.
- Parent RunCard checkbox becomes partial/indeterminate when only some available children are selected.

Selecting a RunCard checkbox:

- Selects every unreleased step under that RunCard.
- Released steps are excluded from selection.
- For `RC-001`, selecting the group selects `step-01` and `step-02`.
- Footer changes to `已选择 2 个Step`.
- Submit button changes to `下发 2 个Step`.

Collapsing a RunCard:

- Hides child rows.
- Keeps selected steps selected.
- Keeps footer and submit state unchanged.

Adding a RunCard:

- Clicking `新增RunCard` appends the next id, for example `RC-003`.
- Empty RunCard shows `0/0已下发` and `暂无Step`.
- Empty RunCard group checkbox is disabled.
- Existing step owner selectors gain the new RunCard option.

Moving a step between RunCards:

- Owner selector moves the step id between `runCards[*].steps`.
- Selecting `未分配` removes the step from all RunCards and clears that step from `selectedReleaseSteps`.
- Unassigned steps render in an `未分配` group and cannot be selected for release until assigned to a RunCard.

Deleting a RunCard:

- Empty RunCards can be deleted.
- RunCards containing steps cannot be deleted; the prototype shows a toast asking the user to move steps first.

Cancel / close:

- `取消`, close icon, overlay click, and Escape close the modal.
- Closing does not submit selected steps.

## Submit Behavior

Clicking the submit button when enabled:

- Counts selected steps.
- Adds each selected step id to `releasedStepIds`.
- Clears `selectedReleaseSteps`.
- Closes the modal.
- Sets released state when at least one step has been submitted.
- Shows toast `已提交 N 个Step至MES`.
- Resets selected stage to `PHOTO`.
- Re-renders the execution center.
- Scrolls the execution center to top.

## After Partial Release

After selecting `RC-001` and submitting 2 steps:

- Modal closes.
- Toast shows `已提交 2 个Step至MES`.
- Main table remains visible.
- `下发配置` remains visible because `step-03` is not yet released.
- `MES事件记录` appears below the split table.
- Reopening release modal shows:
  - `RC-001` count as `2/2已下发`.
  - `step-01` and `step-02` checkboxes disabled.
  - `step-01` and `step-02` owner selectors disabled.
  - unreleased `step-03` still selectable and movable.

## After Full Release

After all release steps are submitted:

- Modal closes.
- Toast shows `已提交 1 个Step至MES` for the final remaining step in the observed flow.
- `下发配置` disappears from the main table because all release steps are released.
- `MES事件记录` remains visible.

## MES Event Record Shape

The post-release execution center renders a RunCard-oriented MES event table:

```ts
type RunCardEvent = {
  runCardId: string
  time: string
  step: string
  status: "通过" | "OPEN" | "已接受" | "运行中" | "TIMEOUT"
  description: string
  operator: "System" | "MES" | string
}
```

Observed rows include:

- `RC-002`, `14:28:42`, `FS-TAPE / S-B-TAPE-B-01`, `通过`, `前置条件及Recipe映射校验通过`, `System`
- `RC-001`, `14:20:16`, `OXIDE_ETCH / MAIN`, `OPEN`, `Wafer 17在主工序进入Hold`, `MES`
- `RC-001`, `14:14:33`, `OXIDE_ETCH / MAIN`, `已接受`, `生产Route已接受，18片Wafer进入队列`, `MES`
- `RC-001`, `14:08:05`, `OXIDE_ETCH / MAIN`, `运行中`, `已在设备AWOXE01开始执行`, `MES`
- `RC-001`, `13:50:09`, `CLEAN / MAIN`, `TIMEOUT`, `下发请求超过30秒响应窗口`, `System`

## Component Impact

`steps`:

- Owns the local trigger that opens release configuration.
- Should expose release intent via callback or local lab state, not call MES.
- Should reflect whether all releaseable steps are already released.

`runcard`:

- Should model RunCard groups, step membership, collapsed state, selected release step ids, and released step ids.
- Should support group selection, child selection, collapse/expand, add empty RunCard, delete empty RunCard, move step owner, cancel, and confirm.
- Should disable released steps and their owner selectors.
- Should disable submit when no unreleased selected steps exist.

`runcard-history`:

- Should consume event rows as data.
- Should not poll MES or synthesize real MES state.
- Should show statuses with distinct visual states.

## Scenario Candidates

- `initial`: two RunCards, three unreleased steps, no selection.
- `single-step-selected`: one child step selected, submit enabled for one.
- `runcard-selected`: RC-001 selected, two child steps selected.
- `empty-runcard-added`: RC-003 added with no steps.
- `step-moved`: FS-TAPE moved from RC-002 to RC-003.
- `partial-release-submitted`: RC-001 released, remaining step still releasable.
- `all-released`: every release step released, main `下发配置` hidden.
- `unassigned-step`: moved to `未分配`, selection disabled until assigned.

## Open Questions

- Whether `新增RunCard` id sequence should be owned by the component or supplied by the application.
- Whether moving a selected step to another RunCard should preserve selection when the target is still assigned.
- Whether partial release should update the split table row action state visibly in the Domain UI component or remain an app-layer execution status.
- Whether post-release `MES事件记录` should be coupled to RunCard submission scenarios or maintained as an independent event-log component scenario.
