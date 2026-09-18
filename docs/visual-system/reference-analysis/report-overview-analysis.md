# DOE Report Overview Visual Analysis

## Status and scope

**Evidence record only.** This applies the [Visual Rule Extraction Process](../extraction-process.md) to the existing Report Overview. It does not promote a token, Pattern, or Domain asset.

**Primary sources:** [component](../../../src/components/domain/report-overview.tsx#L28-L139); [input schema](../../../src/schemas/domain-component-inputs.ts#L265-L277) and [overview schema](../../../src/schemas/domain-component-inputs.ts#L360-L387); [fixture](../../../src/components/domain/report.fixtures.ts#L14-L57); [scenarios](../../../src/components/domain/report-overview.scenarios.ts#L1-L9); [preview](../../../content/docs/domain/report/overview.mdx#L9-L31); [report helpers](../../../src/components/domain/report-parts.tsx#L13-L96); [Card](../../../src/components/ui/card.tsx#L5-L80); [Table](../../../src/components/ui/table.tsx#L7-L92).

The local preview URL is the MDX component preview, not a complete Report Workspace route. Its outer frame and Overview label are documentation-shell content and excluded.

## Page structure, hierarchy, and composition

When identity and metrics are both absent, the component shows a neutral empty state. Otherwise its compact grid orders: experiment identity, KPI group, conditional yield-exception table, then four supporting summary panels. [Component](../../../src/components/domain/report-overview.tsx#L38-L93) This creates a DOE diagnostic funnel: identify the report subject, evaluate aggregates, inspect attributable exceptions, then read supporting evidence. The fixture connects product/lot context with low yield, CP OOS, failures, wafers, and split rows. [Fixture](../../../src/components/domain/report.fixtures.ts#L18-L55)

The composition uses shadcn-based Card and Table primitives, plus report-specific ReportBadge and EmptyState helpers. [Component](../../../src/components/domain/report-overview.tsx#L3-L21) This confirms composition, not visual authority of the primitive implementations.

## Candidate inventory

### F001 — Compact analytical surface rhythm

- **Name:** Compact analytical surface rhythm.
- **Current implementation:** The page uses p-4/gap-4 outer spacing; the exception table has a rounded, bordered boundary; Cards bring their own spacing and radius. [Component](../../../src/components/domain/report-overview.tsx#L42-L58) [Card](../../../src/components/ui/card.tsx#L14-L17)
- **Layer:** Foundation candidate.
- **Why it belongs to this layer:** Density, separation, radius, and surface treatment can govern many compositions independently of report semantics.
- **Reusable contract:** Analytical modules should use compact, readable grouping and neutral borders; elevation needs a stated relationship.
- **What should NOT be extracted:** Literal Tailwind values or a default metric gradient/shadow. One page cannot establish exact token values.
- **Promotion status:** Candidate.

### F002 — Scan-oriented typography and numbers

- **Name:** Scan-oriented typography and numeric treatment.
- **Current implementation:** Metric labels are muted; values are semibold tabular numerals that grow only at a 250px card container; details are muted supporting text. [Component](../../../src/components/domain/report-overview.tsx#L47) Table headers/cells are compact, left-aligned, and nowrap. [Table](../../../src/components/ui/table.tsx#L68-L90)
- **Layer:** Foundation candidate.
- **Why it belongs to this layer:** Numeric alignment and hierarchy could serve more than this report.
- **Reusable contract:** Repeated analytical values should scan as label → comparable value → qualifying evidence; use tabular numerals where comparison matters.
- **What should NOT be extracted:** Exact type sizes, the 250px breakpoint, or a unit placement rule. Values are free strings, so unit handling is unproven.
- **Promotion status:** Candidate.

### U001 — Card, Table, and Badge primitives

- **Name:** Card, Table, and Badge primitive implementation.
- **Current implementation:** OverviewCard composes Card slots; the exception surface composes Table slots; ReportBadge composes outline Badge. [Component](../../../src/components/domain/report-overview.tsx#L57-L84) [Component](../../../src/components/domain/report-overview.tsx#L121-L138) [Report helpers](../../../src/components/domain/report-parts.tsx#L20-L35)
- **Layer:** UI implementation.
- **Why it belongs to this layer:** These are generic structural building blocks, not DOE product hierarchy or business meaning.
- **Reusable contract:** Expose primitive slots to Patterns and Domain assets; semantic meaning is provided above this layer.
- **What should NOT be extracted:** The full shadcn variant set or a claim that generic Badge is a DOE status taxonomy.
- **Promotion status:** Evidence only.

### P001 — Metric snapshot group

- **Name:** Metric snapshot group, with MetricCard as a subcomposition.
- **Current implementation:** A two-column-at-md, four-column-at-xl group repeats label, value, action-region tone badge, and evidence detail. [Component](../../../src/components/domain/report-overview.tsx#L46-L48) The fixture supplies Fail Die, Defect Wafers, Low Yield, and CP OOS as one report-round set. [Fixture](../../../src/components/domain/report.fixtures.ts#L26-L31)
- **Layer:** Pattern candidate.
- **Why it belongs to this layer:** Its repeated hierarchy and responsive arrangement are product composition; metric names and thresholds are domain data.
- **Reusable contract:** A candidate card has measure label, comparable value, optional explicit semantic state, and adjacent scope/threshold/population evidence. A group supplies stable scan order, not metric meaning.
- **What should NOT be extracted:** The primary gradient and shadow-xs have no stated DOE semantic role. [Component](../../../src/components/domain/report-overview.tsx#L129-L134) Do not preserve the current bad-to-需关注, all-other-tones-to-已就绪 mapping: it collapses good/watch/neutral. [Component](../../../src/components/domain/report-overview.tsx#L47)
- **Promotion status:** Candidate.

### D001 — Report experiment identity summary

- **Name:** Report experiment identity summary.
- **Current implementation:** 实验基础信息, product title, Lot/Step/Wafer identity line, and round narrative are presented together. [Component](../../../src/components/domain/report-overview.tsx#L43-L45) The DTO requires product, lot ID, step count, wafer count, and summary when identity is provided. [Schema](../../../src/schemas/domain-component-inputs.ts#L364-L372)
- **Layer:** Domain asset candidate.
- **Why it belongs to this layer:** It represents the DOE report subject, not a generic PageHeader.
- **Reusable contract:** Render report subject/context without asserting performance or causality beyond supplied evidence.
- **What should NOT be extracted:** Fixture product, lot ID, Chinese wording, or a rule that this must always be a Card.
- **Promotion status:** Candidate.

### D002 — Yield exception summary table

- **Name:** Yield exception summary table.
- **Current implementation:** A titled explanatory section contains Split Group, Variant, Wafer ID, Yield, Δ vs BSL, and CP summary. Wafer ID is monospace; yield is a two-decimal tone badge; unavailable optional evidence is an em dash. [Component](../../../src/components/domain/report-overview.tsx#L50-L85)
- **Layer:** Domain asset candidate.
- **Why it belongs to this layer:** Split context, baseline comparison, wafer identity, yield, and CP evidence are DOE report semantics. The asset composes a Table; it is not a generic DataTable.
- **Reusable contract:** Each exception must keep split/variant context, wafer identity, quantitative yield, available baseline comparison, CP evidence, and semantic assessment attributable to the same row.
- **What should NOT be extracted:** Fixture threshold 99.5%, specific split names, or an inference that absent delta/CP data passes. The component has no sort, selection, drill-in, or pagination contract.
- **Promotion status:** Candidate.

### P002 — Evidence list panel

- **Name:** Evidence list panel.
- **Current implementation:** Four repeated ItemPanels use a title, vertically divided records, monospace label, optional tone badge, supporting detail, and per-panel 暂无记录 state. [Component](../../../src/components/domain/report-overview.tsx#L87-L118)
- **Layer:** Pattern candidate.
- **Why it belongs to this layer:** This compact evidence-reading arrangement can serve multiple data categories.
- **Reusable contract:** A panel accepts title, finite labelled records, optional semantic value/status, supporting evidence, and local empty state.
- **What should NOT be extracted:** Present titles (focus, failure groups, low-yield wafers, alerts) as generic labels, or an assumption that every label uses monospace.
- **Promotion status:** Candidate.

### D003 — Report analytical-status badge

- **Name:** Report analytical-status badge.
- **Current implementation:** ReportBadge maps good/watch/bad/neutral to outlined tonal treatments; it qualifies metrics, yields, and list values. [Report helpers](../../../src/components/domain/report-parts.tsx#L13-L35) [Schema](../../../src/schemas/domain-component-inputs.ts#L265-L276)
- **Layer:** Domain asset candidate.
- **Why it belongs to this layer:** The tone enum is an analytical assessment vocabulary applied to report evidence, not decorative Badge styling.
- **Reusable contract:** It must receive explicit semantic status and appear beside the evidence it qualifies; colour cannot carry state alone.
- **What should NOT be extracted:** Literal emerald/amber/red classes or an assumption that all DOE reports share this exact taxonomy.
- **Promotion status:** Candidate.

### A001 — Report overview diagnostic funnel

- **Name:** Report overview diagnostic funnel.
- **Current implementation:** Identity → KPI group → exceptions → focus/fail/wafer/parameter panels. [Component](../../../src/components/domain/report-overview.tsx#L42-L92)
- **Layer:** Application-only.
- **Why it belongs to this layer:** It decides which assets coexist and their reading order for this report workflow.
- **Reusable contract:** None in the design system; applications compose approved assets for their workflow.
- **What should NOT be extracted:** Routing, exact responsive grids, or a universal requirement for all four panels.
- **Promotion status:** Evidence only.

### A002 — Documentation preview shell

- **Name:** Documentation preview shell.
- **Current implementation:** MDX wraps the component in an overflow-hidden rounded frame and adds a title strip. [Preview](../../../content/docs/domain/report/overview.mdx#L11-L16)
- **Layer:** Application-only (documentation shell).
- **Why it belongs to this layer:** It exists to display a component in documentation, not a DOE product workflow.
- **Reusable contract:** None.
- **What should NOT be extracted:** Its frame, heading strip, radius, or documentation typography.
- **Promotion status:** Evidence only.

## Required special analysis

### Metric cards

The source proves label → value → state → evidence hierarchy, but not a complete metric contract. ReportMetric provides string value plus optional detail, so units, thresholds, periods, trends, abnormal reason, and provenance are not typed. [Schema](../../../src/schemas/domain-component-inputs.ts#L266-L271) The fixture places tested population and threshold language in detail. [Fixture](../../../src/components/domain/report.fixtures.ts#L26-L30) A future contract must resolve this rather than infer it from display strings.

### Summary table

The surface is intentionally dense: a sticky muted header, bordered rounded boundary, primitive horizontal overflow, compact cells, and generic hover treatment. [Component](../../../src/components/domain/report-overview.tsx#L57-L84) [Table](../../../src/components/ui/table.tsx#L7-L18) [Table](../../../src/components/ui/table.tsx#L55-L65) There is no table empty state: when anomalyRows is empty, the entire section is omitted. [Component](../../../src/components/domain/report-overview.tsx#L49-L86) Per-panel empty text must not be mistaken for table behaviour.

### DOE visualization and semantic panels

ReportOverview renders no wafer map or scientific chart; those are separate components and outside this page’s evidence. Its DOE-specific visual assets are semantic panels: report identity, yield exceptions, and evidence lists. The fixture ties tones to low yield, CP OOS, failures, wafer IDs, and process focus, so status must remain adjacent to text/count/wafer/CP evidence—not decorative colour. [Fixture](../../../src/components/domain/report.fixtures.ts#L32-L55)

## Decision

No source code or normative design document changes are proposed. The strongest candidates are the Metric snapshot group, yield exception summary table, and analytical-status badge; each remains evidence-derived until it proves reusable in another DOE context and receives an owning-layer contract.

