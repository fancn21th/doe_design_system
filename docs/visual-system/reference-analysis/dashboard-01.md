# Dashboard 01 Visual Inventory

## Status

**Evidence record, not a DOE rule.** This inventory applies the extraction
process in [`../extraction-process.md`](../extraction-process.md) to one local
upstream reference. Its classifications are hypotheses for review; nothing in
this file promotes a token, Pattern, or Domain asset.

## Source and scope

- **Reference page:** `http://localhost:4000/view/new-york-v4/dashboard-01`
- **Primary source:**
  [`page.tsx`](../../../../ui/apps/v4/registry/new-york-v4/blocks/dashboard-01/page.tsx#L1-L39)
  and the components it imports directly.
- **Styling/primitive evidence:** the directly consumed New York registry UI
  primitives and its token definitions, cited per observation below.
- **Excluded from interpretation:** the generic documents dashboard copy,
  placeholder data, account identity, and application workflow. They are
  upstream example content, not DOE business evidence.

## Page-level observation

The reference composes an inset, collapsible sidebar; a bordered compact
header; a four-to-one responsive summary grid; an analysis card; and a tabbed,
interactive table. The page sets the sidebar width to `72 × --spacing` and the
header height to `12 × --spacing`; its main content uses `gap-4`/`py-4`, rising
to `gap-6`/`py-6` at `md`, and gutters of `px-4`/`lg:px-6`. [Source:
`page.tsx` lines 15-34](../../../../ui/apps/v4/registry/new-york-v4/blocks/dashboard-01/page.tsx#L15-L34)

This is evidence of a compact, neutral, information-first composition. It is
*not* evidence that DOE should adopt this sidebar, dashboard navigation, or
documents workflow.

## Visual inventory

| Observed element | Observable implementation fact | Proposed layer | Action | Extraction note |
| --- | --- | --- | --- | --- |
| Inset workspace shell | `SidebarProvider` hosts an `AppSidebar variant="inset"` and `SidebarInset`; the sidebar implementation makes an inset/floating sidebar padded and gives its inner surface a background, while mobile switches to a sheet. [Page lines 15-38](../../../../ui/apps/v4/registry/new-york-v4/blocks/dashboard-01/page.tsx#L15-L38); [sidebar lines 183-250](../../../../ui/apps/v4/registry/new-york-v4/ui/sidebar.tsx#L183-L250) | Application-only | Reject | Navigation structure, persistence, and mobile sheet behaviour are application-shell concerns. Retain only as evidence that a stable workbench frame can support dense analysis. |
| Compact utility header | The header is a single `--header-height` row with a bottom border, `px-4`/`lg:px-6` gutters, sidebar trigger, vertical separator, title, and a right-aligned ghost action. [Source: `site-header.tsx` lines 5-28](../../../../ui/apps/v4/registry/new-york-v4/blocks/dashboard-01/components/site-header.tsx#L5-L28) | Pattern candidate | Candidate | Test as a DOE `PageHeader` only after a DOE page proves the same title/action/reading-order contract. GitHub navigation is rejected. |
| Neutral surface and border vocabulary | The registry defines white cards/background, a near-white sidebar and muted surface, black primary, and a light neutral border; its shared radius is `0.625rem`. [Source: `globals.css` lines 44-89 and 99-133](../../../../ui/apps/v4/app/globals.css#L44-L133) | Foundation candidate | Candidate | Verify against DOE semantic colour, dark-mode, and density needs before recording a DOE token. Do not copy exact values from one template. |
| Card primitive | The primitive is a vertical surface with `gap-6`, `rounded-xl`, border, card background, `py-6`, and `shadow-sm`; header/content/footer use consistent horizontal `px-6` padding. [Source: `card.tsx` lines 4-79](../../../../ui/apps/v4/registry/new-york-v4/ui/card.tsx#L4-L79) | UI implementation | Keep | Continue consuming a shadcn-based Card primitive. Its implementation is not DOE visual authority. |
| Summary metric group | Four cards use label, tabular numeric value, outline trend badge, and two-line explanatory footer; the group is one column by default, two at `@xl/main`, and four at `@5xl/main`. The group applies a low-contrast primary-to-card gradient and `shadow-xs` to every card. [Source: `section-cards.tsx` lines 13-100](../../../../ui/apps/v4/registry/new-york-v4/blocks/dashboard-01/components/section-cards.tsx#L13-L100) | Pattern candidate | Candidate | This is the strongest candidate for a future `MetricCard`/`MetricCardGroup`: label → value with unit → semantic delta/status → evidence note. Reject the generic revenue/customer copy and defer gradients until DOE evidence demonstrates an analytical—not decorative—role. |
| Metric numeric treatment | Values use `font-semibold`, `text-2xl`, `tabular-nums`, and grow to `text-3xl` only when the card container is at least 250px. [Source: `section-cards.tsx` lines 17-27](../../../../ui/apps/v4/registry/new-york-v4/blocks/dashboard-01/components/section-cards.tsx#L17-L27) | Foundation candidate | Candidate | Numeric alignment and container-aware escalation are candidates for a named data-density/measurement rule, not a one-off metric-card override. Validate with units, uncertainty, and scientific notation. |
| Delta/status chip | The summary cards use `Badge variant="outline"` with an icon and percentage, while the primitive makes outline badges bordered, foreground-coloured, compact pills. [Source: `section-cards.tsx` lines 22-27](../../../../ui/apps/v4/registry/new-york-v4/blocks/dashboard-01/components/section-cards.tsx#L22-L27); [badge lines 6-25](../../../../ui/apps/v4/registry/new-york-v4/ui/badge.tsx#L6-L25) | UI implementation | Keep | Use the primitive only after a DOE component establishes the meaning of the status/delta. The green/red-like trend implication and percentage wording are not a DOE status taxonomy. |
| Analysis card with responsive controls | One card holds a title, contextual time-range description, and a card action that is an outline toggle group above 767px but a small select below it. [Source: `chart-area-interactive.tsx` lines 167-211](../../../../ui/apps/v4/registry/new-york-v4/blocks/dashboard-01/components/chart-area-interactive.tsx#L167-L211) | Pattern candidate | Candidate | Potential `AnalysisPanel`: title + scope/context + local control + evidence visual. The exact 767px threshold and time-range labels remain upstream details to validate, not tokens. |
| Chart evidence treatment | The card's chart area is full width and fixed at 250px; it removes vertical gridlines and axis/tick lines, uses date formatting and a dot tooltip, and draws two stacked natural areas with primary-colour gradients. [Source: `chart-area-interactive.tsx` lines 211-287](../../../../ui/apps/v4/registry/new-york-v4/blocks/dashboard-01/components/chart-area-interactive.tsx#L211-L287) | Domain candidate | Reject | DOE needs evidence-specific charts, units, baselines, uncertainty, provenance, and potentially wafer context. The generic visitors chart and decorative filled gradient must not become a shared DOE chart rule. |
| Responsive control substitution | The chart defaults the range to 90 days but changes it to seven days on mobile; the selection filters the displayed series locally. [Source: `chart-area-interactive.tsx` lines 143-165](../../../../ui/apps/v4/registry/new-york-v4/blocks/dashboard-01/components/chart-area-interactive.tsx#L143-L165) | Application-only | Reject | This is page example behaviour. Any DOE time-window policy belongs to the relevant evidence/domain contract, not the visual system. |
| Data workbench toolbar | The table region combines a select-or-tabs view selector, column-visibility menu, and add action; wide layouts show tabs, while smaller layouts substitute a select. [Source: `data-table.tsx` lines 418-490](../../../../ui/apps/v4/registry/new-york-v4/blocks/dashboard-01/components/data-table.tsx#L418-L490) | Pattern candidate | Candidate | Potential `DataTable` pattern evidence: a compact view switcher plus adjacent table controls. Promote only after DOE defines its view modes, available actions, and permissions. |
| Dense tabular surface | The table is enclosed by `rounded-lg border`, has a sticky muted header, horizontal overflow support, 40px header cells, `p-2` cells, row separators, muted hover/selected state, and a no-results state. [Source: `data-table.tsx` lines 492-543](../../../../ui/apps/v4/registry/new-york-v4/blocks/dashboard-01/components/data-table.tsx#L492-L543); [table lines 6-90](../../../../ui/apps/v4/registry/new-york-v4/ui/table.tsx#L6-L90) | Pattern candidate | Candidate | Strong evidence for a DOE `DataTable` pattern focused on readable density, stable headers, selection, and empty states. The schema's document fields are explicitly rejected. |
| Table management interactions | The table registers filtering, visibility, pagination, selection, sorting, and drag sorting; it also exposes pagination and rows-per-page controls. [Source: `data-table.tsx` lines 112-123, 387-405, and 544-618](../../../../ui/apps/v4/registry/new-york-v4/blocks/dashboard-01/components/data-table.tsx#L112-L123) | Application-only | Reject | Interaction capabilities depend on the domain's data contract. Do not make row drag/reorder, column customisation, or pagination universal visual-system requirements. |
| Detail drawer | Clicking a row header opens a drawer from the bottom on mobile and right on larger screens, with a header, optional chart evidence, a form, and primary/outline footer actions. [Source: `data-table.tsx` lines 659-815](../../../../ui/apps/v4/registry/new-york-v4/blocks/dashboard-01/components/data-table.tsx#L659-L815) | Pattern candidate | Candidate | Potential detail-inspection composition, but not yet a DOE pattern. Any eventual version must specify DOE evidence, editability, and action semantics. |
| Sidebar navigation grouping | The sidebar combines a branded header, quick action, icon-and-label primary navigation, a labelled document group, utility links, and an account footer. [Source: `app-sidebar.tsx` lines 153-180](../../../../ui/apps/v4/registry/new-york-v4/blocks/dashboard-01/components/app-sidebar.tsx#L153-L180); [nav-main lines 24-56](../../../../ui/apps/v4/registry/new-york-v4/blocks/dashboard-01/components/nav-main.tsx#L24-L56); [nav-documents lines 39-90](../../../../ui/apps/v4/registry/new-york-v4/blocks/dashboard-01/components/nav-documents.tsx#L39-L90) | Application-only | Reject | Information architecture, user menu, quick-create and document management are not portable DOE visual rules. |

## Normalisation candidates for review

These candidates satisfy only the *observation* stage. They have not passed the
evidence test for promotion.

1. **P001 — MetricCard / MetricCardGroup (Pattern candidate):** a compact
   summary composition with an explicit measure label, aligned numeric value
   and unit, semantic evaluation state or delta, and a concise evidence note.
   Its source evidence is the repeated four-card composition above; a DOE
   contract still needs measurement semantics and states.
2. **P002 — PageHeader (Pattern candidate):** a restrained page identity row
   with a clear title, optional context, and bounded local actions. Its source
   evidence is the compact bordered header; navigation-shell coupling must be
   removed before reuse.
3. **P003 — AnalysisPanel (Pattern candidate):** a card-framed evidence area
   that co-locates title, scope, one local control, and the visual evidence.
   Its source evidence is the interactive chart card; DOE needs to define
   chart, baseline, units, and provenance requirements.
4. **P004 — DataTable (Pattern candidate):** a dense data-workbench
   composition with a stable header, scoped controls, readable rows and a
   defined empty state. Its source evidence is the tabbed table; feature
   selection remains a domain/application decision.
5. **F001 — Neutral structural surface (Foundation candidate):** a semantic
   surface/border/radius/density contract derived from the registry's neutral
   token roles, not from its literal colour values. It requires comparison with
   another accepted DOE surface before promotion.

## Deliberately rejected evidence

- Marketing-like card gradients, area-fill gradients, and extra shadow are not
  DOE rules: they appear as local class composition in the source, not as a
  demonstrated DOE semantic need. [Sources: `section-cards.tsx` line 15](../../../../ui/apps/v4/registry/new-york-v4/blocks/dashboard-01/components/section-cards.tsx#L15); [`chart-area-interactive.tsx` lines 217-241](../../../../ui/apps/v4/registry/new-york-v4/blocks/dashboard-01/components/chart-area-interactive.tsx#L217-L241)
- Revenue, customer, visitor, document, proposal, and account copy/data are
  example content, including the hard-coded dashboard summary and chart data.
  [Sources: `section-cards.tsx` lines 17-98](../../../../ui/apps/v4/registry/new-york-v4/blocks/dashboard-01/components/section-cards.tsx#L17-L98); [`chart-area-interactive.tsx` lines 35-141](../../../../ui/apps/v4/registry/new-york-v4/blocks/dashboard-01/components/chart-area-interactive.tsx#L35-L141); [`app-sidebar.tsx` lines 36-150](../../../../ui/apps/v4/registry/new-york-v4/blocks/dashboard-01/components/app-sidebar.tsx#L36-L150)
- Drag reordering, generic “Add Section”, user/account menus, and sidebar
  state persistence are application behaviours, not visual-system evidence.
  [Sources: `data-table.tsx` lines 407-415 and 486-489](../../../../ui/apps/v4/registry/new-york-v4/blocks/dashboard-01/components/data-table.tsx#L407-L415); [`sidebar.tsx` lines 72-110](../../../../ui/apps/v4/registry/new-york-v4/ui/sidebar.tsx#L72-L110)

## Decision

No shared implementation or normative document changes are proposed. The next
safe validation step is to choose one concrete DOE use case for **P001
MetricCard**, write its business/visual contract, and compare it against this
evidence before promotion.
