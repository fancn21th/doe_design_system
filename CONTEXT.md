# DOE Domain UI

This context defines the language of a domain UI asset library for DOE interfaces. It is not the language of a DOE application, page workflow, backend service, MES integration, or Oracle gateway.

## Language

**Domain UI Project**:
A project that collects reusable DOE business UI assets: schemas, fixtures, scenarios, domain components, and a component lab. It does not own application workflows or backend integrations.
_Avoid_: Application, app shell, page workflow, design system

**Domain UI Asset**:
A reusable asset that represents DOE business data, business presentation, or local business interaction. Examples include a domain schema, fixture, scenario, component, or business layout fragment.
_Avoid_: Foundation component, page, service

**Domain Component**:
A React component that presents or locally edits DOE business data through props and callbacks. It may use foundation UI internally, but its public purpose is business-facing.
_Avoid_: Button, Input, Dialog, app container

**Domain Layout Component**:
A reusable layout asset for arranging DOE business surfaces, such as a domain workspace, module section, evidence preview pane, or business modal frame. It is a domain asset because it preserves business reading order and evidence context, not because it creates a new foundation layout system.
_Avoid_: App shell, page workflow, CSS framework

**Foundation UI**:
Low-level reusable UI primitives used to build domain components, such as buttons, inputs, badges, and dialogs. In this project, Foundation UI comes from shadcn and is not a local design system owned by the domain UI project.
_Avoid_: Domain asset, public component, local design system

**Shadcn Foundation**:
The design-system-backed foundation layer used for generic UI primitives and interaction patterns. Domain components compose this foundation instead of replacing it.
_Avoid_: Custom primitive library, local design system

**UI-Facing Schema**:
A schema that describes the business data shape consumed by domain UI assets. It is not the backend, MES, Oracle, or gateway contract.
_Avoid_: API contract, database model, service DTO

**Scenario**:
A named, executable rendering case for a domain component. Scenarios make normal, empty, loading, partial, error, readonly, and large-data states concrete when they apply.
_Avoid_: Screenshot, static documentation example

**Component Lab**:
The development, display, and verification environment for domain UI assets. It is not an application and does not own business routing, cross-page state, or real backend submission.
_Avoid_: DOE App, workflow host, production shell

**Public API**:
The stable package boundary that applications use to import supported domain components, schemas, and types. Internal directories, helpers, and foundation UI wrappers are not public API.
_Avoid_: Internal path imports, implementation exports

**Round**:
A DOE iteration with its own experimental boundary. A Round can be shown by domain UI assets without making the component library responsible for the application workflow around it.
_Avoid_: Page flow, submission process

**Product**:
The semiconductor product whose process route and DOE experiment are being studied.
_Avoid_: Generic item, UI product card

**Lot**:
A production or experiment batch containing the wafers used in a DOE round.
_Avoid_: Round, wafer set label

**Wafer**:
A single wafer within a Lot. DOE UI may assign wafers to baseline or split conditions and analyze results per wafer.
_Avoid_: Die, lot

**Step**:
The process execution unit in a DOE Round that can be configured, released, executed, observed, and tracked.
_Avoid_: Stage unless the customer/source relationship has been confirmed

**Stage**:
A process observation frame used to inspect source-backed Inline/SPC data. The exact relationship between Stage, Step, and Sequence still needs customer/RD confirmation.
_Avoid_: Confirmed Step mapping

**Split Table**:
The assignment table that maps wafers to DOE factors, planned conditions, steps, recipes, and baseline/split roles.
_Avoid_: Execution log, analysis verdict

**Split Version**:
A frozen version of the experiment assignment used by execution and analysis surfaces.
_Avoid_: Editable draft after release

**Baseline**:
The standard or reference condition used to compare split conditions within a DOE round.
_Avoid_: Default value, control with no DOE meaning

**Planned Condition**:
The condition planned in the Split Table. It must not be presented as an actual measured process value.
_Avoid_: Actual Condition

**Actual Condition**:
The actual process value observed from source-backed Inline/SPC summary or raw measurement data. Missing actuals remain missing.
_Avoid_: Planned Condition, filled value

**Recipe**:
The MES process recipe used to execute a step for a group of wafers.
_Avoid_: Factor, condition

**Release Configuration**:
The frozen execution-ready configuration used to decide whether a Round or Step can be released, including split version, step, recipe, and wafer scope.
_Avoid_: Component callback, UI-only action

**MES Release**:
The act of submitting a step or round release request to MES and tracking the result.
_Avoid_: Local button click, mock state

**Execution State**:
The combined view of configuration, MES submission, production, and data arrival state for a step.
_Avoid_: Single boolean status

**Action Center**:
The execution workbench that turns release readiness, data lag, wafer holds, or blockers into next actions.
_Avoid_: Generic notification list

**MES Event Log**:
The chronological execution trace of release checks, MES returns, production events, retries, holds, and exceptions.
_Avoid_: Audit-free toast history

**Inline / SPC**:
Process measurement data collected during manufacturing, used to observe what the process actually produced.
_Avoid_: CP result, planned condition

**CP**:
Wafer-level electrical test data used to evaluate final chip performance and parameter distributions.
_Avoid_: Inline/SPC process data

**Final Bin**:
Die-level final CP classification keyed by wafer and die coordinates.
_Avoid_: Standalone pass/fail if source final-bin classification exists

**Yield**:
The pass rate of tested die, generally calculated as pass die divided by tested die.
_Avoid_: Count, score without denominator

**Wafer Map**:
A spatial view of die-level CP, defect, or overlay data across legal die coordinates.
_Avoid_: Generic heatmap

**Data Authenticity Classification**:
The label that distinguishes real, mock-derived, deterministic-template, unavailable, and provisional data.
_Avoid_: Hiding mock data as production fact

**Evaluation State**:
The readiness or validity state of DOE data. `PARTIAL`, `NO_DATA`, `N/A`, `FAILED`, and `INSUFFICIENT_DATA` are distinct meanings and must not be flattened into one state.
_Avoid_: Boolean readiness, missing equals zero

**Source Snapshot**:
The source-backed data package, generation time, and source list or hash that a report or stage view uses for traceability.
_Avoid_: Live database state without version boundary

**Observed Wafer Scope**:
The wafers that appear in a source-backed observation view. It must not be assumed to equal planned, released, executed, or completed wafer scope.
_Avoid_: MES planned wafer scope

**Candidate Step Mapping**:
A review relationship that connects source-backed Stage/SPC evidence to candidate Steps through recipe, chamber, sub-lot, or other source differences. It is not official MES route confirmation.
_Avoid_: Confirmed DOE Step mapping

**Mapping Confidence**:
A UI/domain status that indicates whether a candidate Stage/Step/source relationship is high, medium, conflicting, or still pending confirmation.
_Avoid_: Statistical confidence unless defined by RD/customer

**Mapping Conflict**:
A relationship state where the same wafer or source evidence can belong to multiple candidate variants, steps, or mappings and therefore requires review.
_Avoid_: Silent auto-resolution

**Source Flag**:
A source-level marker that makes raw or summary measurements traceable to source conditions, conflicts, or provisional evaluation rules.
_Avoid_: Final engineering judgment unless confirmed

**Coverage Unknown**:
A data state meaning the source does not prove coverage. Absence of records must not be interpreted as pass.
_Avoid_: Defect pass, no issue

**Source Provisional**:
A source-backed metric state whose upstream source exists but whose formal business definition still needs customer/RD confirmation.
_Avoid_: Final confirmed metric

**Read-only Round Snapshot**:
The immutable or versioned data snapshot consumed by Current Round Report after source validation.
_Avoid_: Live mutable report state

**Round Review**:
The human review process that evaluates report facts, boundaries, engineering interpretation, limitations, and open questions.
_Avoid_: Current Round Report final verdict

**Evidence Level**:
A product-level descriptive label for completeness, consistency, and observed strength of available evidence. It is not a formal statistical significance measure or causal confidence score.
_Avoid_: Root cause confidence

**Deterministic Summary**:
A summary generated from page-computed facts and limitations without model calls, inferred facts, or recommendations.
_Avoid_: AI interpretation, next action

**AI Summary**:
A structured summary generated from validated fact payloads and limitations, without inventing facts or recommendations.
_Avoid_: Root cause, verdict, action, next-round recommendation

**Knowledge Base**:
The future store of reviewed round evidence, engineer annotations, conclusions, and reusable experiment experience.
_Avoid_: Raw unreviewed report dump
