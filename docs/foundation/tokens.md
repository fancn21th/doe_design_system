# DOE Foundation Tokens

This document is the canonical contract for DOE-owned visual tokens. Runtime
values live in `src/app/globals.css`; that file implements this contract and
does not independently define design policy.

## Scope

DOE foundation owns semantic density, business-surface dimensions, and related
visual contracts. Generic shadcn/Fumadocs colour variables and documentation
shell tokens are outside this scope.

## Current Token Families

| Family | Purpose |
| --- | --- |
| `--doe-font-*` | Metadata, labels, body, module, modal, and workspace text roles |
| `--doe-control-*` | DOE control-height roles |
| `--doe-radius-*` | DOE control and business-card radius roles |
| `--doe-*-padding`, `--doe-*-gap` | Semantic spacing for DOE business surfaces |
| `--doe-*-min-width`, `--doe-*-column` | Readable wide-table and inspection-layout contracts |
| `--doe-*-height`, `--doe-*-width` | Named reusable dimensions for DOE business surfaces |

## Current Contract Values

| Token | Value | Semantic role |
| --- | ---: | --- |
| `--doe-font-meta` | `12px` | Dense table and metadata text |
| `--doe-font-label` | `13px` | Form and secondary labels |
| `--doe-font-body` | `14px` | Default business reading text |
| `--doe-font-body-lg` | `15px` | Elevated business reading text |
| `--doe-font-module-title` | `16px` | Business module title |
| `--doe-font-modal-title` | `20px` | Modal title |
| `--doe-font-workspace-title` | `28px` | Workflow-start title |
| `--doe-control-sm` | `32px` | Compact/icon control |
| `--doe-control-md` | `36px` | Default compact control |
| `--doe-control-lg` | `40px` | Form and primary-action control |
| `--doe-control-xs` | `28px` | Smallest compact control |
| `--doe-section-gap` | `16px` | Adjacent DOE section gap |
| `--doe-table-row-height` | `52px` | Split-table row rhythm |
| `--doe-module-padding` | `20px` | Module interior |
| `--doe-component-preview-wide-width` | `1248px` | Component Lab wide preview |
| `--doe-related-component-gap` | `16px` | Related local-result stack |
| `--doe-split-table-min-width` | `1776px` | Step × Wafer readable width |
| `--doe-inline-matrix-min-width` | `3372px` | Inline matrix readable width |
| `--doe-inline-matrix-parameter-column` | `272px` | Inline matrix parameter column |
| `--doe-inline-matrix-wafer-column` | `124px` | Inline matrix wafer column |
| `--doe-inline-matrix-cell-width` | `100px` | Inline matrix measurement cell |
| `--doe-inline-matrix-cell-min-height` | `50px` | Inline matrix measurement cell |
| `--doe-release-modal-width` | `780px` | Release modal width |
| `--doe-release-tree-min-width` | `672px` | Release tree readable width |
| `--doe-release-owner-width` | `192px` | Release owner column |
| `--doe-wafer-parameter-column` | `248px` | Wafer parameter selector column |
| `--doe-wafer-panel-min-height` | `520px` | Wafer inspection panel |
| `--doe-wafer-kpi-width` | `92px` | Wafer KPI column |
| `--doe-wafer-chart-height` | `416px` | Wafer chart |
| `--doe-defect-wafer-column` | `216px` | Defect wafer selector column |
| `--doe-defect-map-column-min` | `544px` | Defect-map readable column |
| `--doe-defect-detail-column-min` | `352px` | Defect-detail readable minimum |
| `--doe-defect-detail-column-max` | `480px` | Defect-detail readable maximum |
| `--doe-defect-image-height` | `252px` | Defect evidence preview |
| `--doe-defect-panel-min-height` | `560px` | Defect inspection panel |
| `--doe-defect-grid-size` | `22px` | Defect map background grid |
| `--doe-defect-map-size` | `464px` | Defect map drawing surface |
| `--doe-defect-dialog-width` | `760px` | Defect evidence dialog |
| `--doe-defect-modal-image-height` | `430px` | Defect modal evidence image |
| `--doe-radius-control` | `10px` | Control radius |
| `--doe-radius-card` | `14px` | Business-card radius |
| `--doe-radius-cell` | `7px` | Dense business-cell radius |

The semantic split-table columns, surface padding, list gaps, responsive
layouts, and dialog-height tokens in the same families are owned by their named
surface. When one changes, add its stable semantic contract to this table
before changing the runtime value.

## Rules

- Start with the semantic surface: for example, a wafer selector, release
  modal, or inline matrix—not a generic `large` size.
- Prefer existing tokens. Add one only after the semantic role is stable and
  reusable.
- Use a semantic utility class when a shadcn primitive represents a business
  surface whose size differs from its ordinary control size.
- Keep wide table and inspection scrolling inside the relevant business module.
- Fumadocs theme variables and generic shadcn defaults cannot be repurposed as
  DOE tokens without recording the DOE semantic contract here.

For the component-level sizing method, see `docs/practices/domain-ui-sizing.md`.
For the selected neutral Card boundary, radius, background, and decoration
rules, see `docs/foundation/analytical-surfaces.md`.
