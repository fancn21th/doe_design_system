# DOE Domain UI Design System

This repository uses shadcn as the foundation UI system and adds a DOE Domain
UI density layer for business components.

Application projects that consume these domain components should start here
before integrating the package.

## Consumer Contract

1. Use the package's public domain component API. Do not import internal
   component files, fixtures, scenarios, or shadcn primitive wrappers.
2. Include the DOE Domain UI styles and tokens from this package.
3. Render DOE domain component areas under `.domain-ui-typography`.
4. Keep application workflow, services, gateways, MES/Oracle calls, and real
   submission logic outside the domain component package.

## Required UI Scope

Wrap the application area that hosts DOE domain components:

```tsx
<main className="domain-ui-typography">
  <Lot />
  <Steps />
  <RunCard />
</main>
```

The scope applies DOE density tokens to shadcn slots such as:

- `Card`
- `Button`
- `Input`
- `Select`
- `Textarea`
- `Table`
- `Badge`

## Density Tokens

The source of truth is `src/app/globals.css`.

Current DOE workstation density:

| Token | Value | Meaning |
| --- | ---: | --- |
| `--doe-font-meta` | `12px` | Metadata and dense table text |
| `--doe-font-label` | `13px` | Form labels and secondary labels |
| `--doe-font-body` | `14px` | Default business reading size |
| `--doe-font-module-title` | `16px` | Module and card titles |
| `--doe-font-modal-title` | `20px` | Modal titles |
| `--doe-font-workspace-title` | `28px` | Workflow start title |
| `--doe-control-sm` | `32px` | Small/icon controls |
| `--doe-control-md` | `36px` | Default controls |
| `--doe-control-lg` | `40px` | Forms and primary actions |
| `--doe-table-row-height` | `52px` | Split table row rhythm |
| `--doe-module-padding` | `20px` | Module body/header padding |
| `--doe-related-component-gap` | `16px` | Gap between a source component and its related result component |
| `--doe-split-table-min-width` | `1776px` | Minimum readable width for Step x Wafer assignment tables |
| `--doe-split-table-*-column` | varies | Semantic column widths for stage, step, condition, recipe, action, and wafer cells |
| `--doe-release-modal-width` | `780px` | RunCard release modal width |
| `--doe-release-modal-max-height` | `760px / viewport-safe` | Release modal height cap |
| `--doe-release-tree-min-width` | `672px` | Release tree readable minimum |
| `--doe-release-owner-width` | `192px` | RunCard owner selector column |
| `--doe-wafer-parameter-column` | `248px` | Wafer capability parameter selector column |
| `--doe-wafer-parameter-padding` | `16px` | Parameter selector panel padding |
| `--doe-wafer-parameter-list-gap` | `10px` | Gap between parameter selector items |
| `--doe-defect-wafer-column` | `216px` | Wafer defect selector column |
| `--doe-defect-map-column-min` | `544px` | Minimum readable wafer map column |
| `--doe-defect-detail-column-min` | `352px` | Minimum readable defect detail column |
| `--doe-defect-detail-column-max` | `480px` | Maximum defect detail column before map gets the remaining width |
| `--doe-defect-image-height` | `252px` | Inline defect evidence preview height |
| `--doe-radius-control` | `10px` | Button/input/select radius |
| `--doe-radius-card` | `14px` | Business module card radius |

## Shadcn Foundation Rule

Domain components must compose shadcn primitives from this package's
`src/components/ui` layer. Do not create a second Button, Input, Select,
Dialog, Table, Badge, or Card system in the application.

For architecture rationale, see:

- `docs/adr/0008-use-shadcn-for-foundation-ui.md`
- `docs/adr/0009-layout-components-are-domain-assets.md`
- `content/docs/domain/design-system.mdx`
- `content/docs/domain/coding-rules.mdx`

## Related Component Stack

When one domain component renders another component as a related result, use
the semantic stack utility instead of local margin:

```tsx
<div className="domain-ui-related-stack">
  <Steps />
  <RunCardHistory />
</div>
```

The spacing is controlled by `--doe-related-component-gap`, which currently
matches the prototype module gap of 16px.

## Wide Domain Tables

Step x Wafer assignment tables are wider than many application containers.
Keep the page width stable and let the table scroll inside its own module:

```tsx
<div className="domain-ui-split-table-shell">
  <Table className="domain-ui-split-table" />
</div>
```

Column rhythm is controlled by:

- `--doe-split-table-min-width`
- `--doe-split-table-stage-column`
- `--doe-split-table-step-column`
- `--doe-split-table-baseline-column`
- `--doe-split-table-condition-column`
- `--doe-split-table-factor-column`
- `--doe-split-table-recipe-column`
- `--doe-split-table-action-column`
- `--doe-split-table-wafer-column`
