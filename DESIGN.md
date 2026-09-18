# DOE Product Design System

## Status

This is the v0.1 entry point and the required starting context for every DOE
product visual decision. The design system is the document set rooted here:

- `DESIGN.md` defines ownership, reading order, and non-negotiable rules.
- `docs/visual-system/` defines the DOE visual language and how it evolves.
- `docs/foundation/` defines DOE-owned visual tokens and density contracts.
- `docs/patterns/` defines reusable product compositions when they are proven.
- `docs/domain/` defines reusable DOE business visual assets when they are
  proven.

No other document may restate these rules as an authority. It may only link to
this system or record a component-specific contract.

## Vision

Define a visual language for DOE applications that is industrial, precise,
analytical, consistent, and dense without becoming hard to read.

## Reading Order for People and Codex

1. Read this file for any UI, visual, token, component, or layout decision.
2. Read `docs/visual-system/principles.md` and
   `docs/visual-system/architecture.md` before introducing a new visual rule
   or asset.
3. Read `docs/foundation/tokens.md` before changing density, typography,
   spacing, colour, or radius.
4. Reuse a documented pattern or domain asset if one exists. If none exists,
   implement the smallest scoped solution and promote it only after it has
   proved reusable.

## Product Visual Architecture

```text
DOE visual language
  -> Foundation (DOE-owned tokens and density contracts)
  -> UI implementation (shadcn primitives)
  -> Patterns (reusable product compositions)
  -> Domain assets (DOE business visuals)
  -> Application (workflow and page composition)
```

Ownership is defined in `docs/visual-system/architecture.md`.

## Boundary Rules

- DOE owns its visual language, its DOE-specific tokens, proven patterns, and
  DOE domain visual assets.
- `src/components/ui` contains shadcn-based implementation primitives. It is
  an implementation dependency, not the DOE visual system's source of truth.
- Fumadocs supplies the documentation site's shell and presentation. Its
  navigation, theme presets, and demo styling are not DOE product rules.
- The app consumes the design system. It owns workflow, routing, services,
  backend calls, and page-specific composition; it must not invent competing
  visual language. DOE App's current consumption mode is local-source adoption,
  not a runtime package; its consumer boundary is documented in
  [`doe-new-app/docs/frontend/design-system-consumer-contract.md`](../doe-new-app/docs/frontend/design-system-consumer-contract.md).
- A source template or screenshot is evidence. It becomes a DOE rule only
  after its distilled rule is recorded in this design system.

## Change Rules

- Add a token only for a named, reusable DOE semantic need; do not encode a
  one-off component adjustment as a foundation token.
- Do not add a Pattern or Domain entry until it has a concrete, reusable
  contract.
- Record visual decisions and meaningful revisions in the visual-system logs.
- Update implementation only after its governing design-system document is
  clear. Keep implementation paths out of the normative rule where possible.

## Authority Order

For product visual decisions: this design system > component/domain contract >
upstream evidence. ADRs explain architectural boundaries; they do not replace
this system's visual rules. If sources disagree, stop and resolve the design
system first.
