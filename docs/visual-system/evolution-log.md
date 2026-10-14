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

## 2026-10-10 — Report visual repair, first round

Following the second-round seven-tab acceptance audit and user confirmation,
Report table contracts adopt the current Split Table header/body density, muted
header, bounded neutral border and common gutters. Measurement bounds its wide
canvas and places readable identity/axis/reference labels. Wafer Map uses supplied
PASS/FAIL together with Final Bin identity, a neutral base and shared parameter
colour scale legend. Inline uses labelled line tabs and compact supplied statistics;
Fit annotations avoid overlap in screen space without moving evidence points.
Component-specific contracts and scenarios own the details. Missing specs, Mock
provenance, Overlay availability, data calculations and top navigation stay with
their existing owners.

Verification: canonical 69 tests and adopted App 156 tests pass; modified-source
lint and isolated production builds pass in both repositories. Seven actual Report
tabs were visually checked; chart/map/matrix boundaries were checked at 1024,
1280 and 1414px. Wafer inspection tables also adopt the shared report-table
style, while unavailable live inspection facts stay unavailable. Per-finding
outcomes and 39 screenshots are recorded in the App Exec Plan self-test at
`apps/frontend-ds/docs/exec-plans/2026-10-10-report-visual-repair-round1-self-test.md`.

## 2026-10-10 — Report browser comments, second repair round

User approved UI-C01–UI-C07. ReportWorkspaceLayout owns 16px / 24px top spacing and report panes remove their duplicate top padding only within the workspace. Grouped Split and Yield Matrix tables use one tbody per existing group, with merged-cell group hover and ordinary-cell row hover. Yield measures its actual plot viewport, shares its geometry across SVG / three X-axis layers / hit areas, separates the Y title from ticks, and keeps local horizontal scroll below 768px. Yield Detail uses the Split shell; Matrix retains a single scroll owner and sticky header. The Split and Yield component contracts and token fallback meaning record these rules.

Canonical source was adopted by DOE App. App 183 tests and canonical 78 tests pass; modified-source lint, TypeScript and isolated production builds pass. Canonical full lint retains three pre-existing registry errors. The App-owned acceptance table, screenshots and per-item results are at `apps/frontend-ds/docs/acceptance/ui/report-center/records/2026-10-10-report-ui-comments-round2-self-test.md` in the consumer repository. Backend facts, provenance, NULL policy and workflow ownership remain with their existing owners.


## 2026-10-10 · Yield chart Card pilot

Wafer Yield & CP Fail Analysis adopts the explicitly requested Dashboard 01 chart-card layout: 24px inset, 8px title/description gap, 48px header-to-chart space, a neutral border and scoped light shadow, and no header divider. The legend moves into the header. The user subsequently requested permanent expansion, so the collapse control and Collapsible are removed. This is one component pilot; other charts and the global Analytical Surface contract are unchanged. See the yield-analysis component contract and App chart acceptance UI-CH01–05.

## 2026-10-10 — Yield plot edge safety

The approved Yield chart pilot reserves 12px inside each vertical SVG edge while retaining its 220px frame and 0–100% domain. Grid, line, markers, stacked bars and tick centres share the inset mapping. Rendered boundary regressions cover 0%, 100% and near-100% values; long Step text can wrap within narrow columns. This scoped repair preserves the card spacing and removes no further controls.

## 2026-10-10 — Report container alignment pilot

User confirmed Header content edges, measured relative to Main, as the alignment reference. ReportWorkspaceLayout defines a scoped 16px / 24px horizontal gutter; Header, report navigation and the Split Table pilot consume it. Report navigation removes horizontal tab padding/borders and replaces the existing inter-label spacing with 30px right margins. User subsequently approved rollout to all report panes, including Overview and the seven business tabs, through the shared workspace selector.

Verification completed in DOE App: 18 actual-browser measurements across all eight pages at desktop/mobile sizes, plus breakpoint and collapsed-sidebar cases; container deltas 0px. Domain UI 80 tests and App 185 tests, targeted lint and both final isolated builds passed. Evidence remains under App UI acceptance; this does not establish Data acceptance.

## 2026-10-10 — Navigation hierarchy and Block pilot

User annotations establish four semantic navigation levels: existing global Sidebar, existing report-page text tabs, common icon-labelled view tabs aligned left, and unchanged Wafer Map subview line tabs. The earlier diagram is a reference, not a pixel specification. Business Blocks retain header/body without collapse wrappers; BlockTitle with Base UI Tooltip is piloted only by Wafer Split Table. The approved contract is [Navigation and Blocks](../patterns/navigation-and-blocks.md). Validation is recorded by App UI acceptance.

Verification: all four level-3 consumers share identical computed styles and one icon per option; existing level-4 line navigation is unchanged. App actual-browser evidence covers 18 desktop/mobile navigation/layout states, Tooltip keyboard focus/Escape, and always-visible Fit sections. Domain UI 83 tests and App 188 tests, targeted lint, and both final isolated production builds passed. Pure pointer hover was not independently recorded; the component uses native Base UI Tooltip hover/focus behavior. App UI acceptance owns the evidence and screenshots.

## 2026-10-10 — Block 标题推广与导航左边界

用户认可 Split Table 的24px外部/14px标题正文间距。推广至五个报告页面（Yield双Block）；三级/四级导航水平padding与border归零，用16px右margin保持有效间距。Median裸筛选；CP Data选择报告图表容器外观。规范见 `docs/patterns/navigation-and-blocks.md`。

本轮验证：消费端188项、canonical83项测试通过；affected lint与两端最终隔离生产构建通过。桌面1430×984/窄屏390×984关键路径、Inline标题键盘Tooltip及Escape通过，纯鼠标悬浮未独立录制。

2026-10-10补充：CP × Inline候选分析标题接入BlockTitle并移除旧CardHeader分割线。桌面1203×984和窄屏390×984间距、键盘Tooltip通过；两端188/83测试、affected lint与隔离生产构建通过。

2026-10-10：用户将CP × Inline Step / All Steps认可为报告筛选器样式打样，记录于`docs/patterns/report-filters.md`。仅新增规范与实际量测，不修改运行组件；其他Tab尚未按新基准验收。

2026-10-10：用户要求将七类已确认UI标准整理为DS独立文档，新增`docs/patterns/ui-acceptance-standards.md`及Patterns入口。保留专题规范与tokens的权威，明确量测、复用范围和参考边界；仅文档整理。

## 2026-10-13 · Parameter Median CPK legend

User approved CPK bands (<1.33, [1.33,1.67), ≥1.67) for cell background and CPK text, with a wrapping top-right legend. Missing CPK stays neutral with an em dash. OOS and fail-linked facts remain separate badges/text. See the Parameter Median MDX contract and cpkThresholds mock scenario.

2026-10-13 prototype correction: exact colors and hollow 12px rounded-square legend adopted from user-provided single-file Workbench / embedded DOE report.html (CSS lines 2533–2544, renderer 5773). Removed missing-value legend text; CPK uses two decimals with inline OOS badge, preserving source metadata in title.


## 2026-10-14 App UI 回收

仅同步本库：从 doe-overview-ui@7d066b6 采纳 Overview 模块精简、重点/OOS展示、Split/Yield分组标签、Parameter Median Source Spec、无Factor的SplitMatrix和MES JSON预览。数据计算、同Product模板筛选、Oracle/MES请求继续由App负责。
