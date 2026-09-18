# DOE Visual Architecture

## Layers and Ownership

| Layer | Owns | Does not own |
| --- | --- | --- |
| Foundation | DOE semantic tokens and density contracts | Generic primitive implementation or a page layout |
| UI implementation | shadcn-based Button, Input, Table, Dialog and similar primitives | DOE visual-language authority or domain behaviour |
| Patterns | Proven reusable product composition and visual hierarchy | Backend workflow or a specific domain model |
| Domain | Reusable DOE business visual assets and their local interaction | App routing, services, or cross-page workflow |
| Application | Page composition, workflow, navigation, data loading, and submission | A competing DOE visual language |

## Patterns Are the Primary Visual Expression

Patterns are the main expression of DOE product visual language. Foundation
tokens make surfaces coherent and shadcn provides generic primitives, but
Patterns encode the repeated composition, hierarchy, density, and interaction
structure that make a DOE product recognisable.

A Pattern may own layout rhythm, information hierarchy, responsive composition,
and repeated interaction structure. It does not own DOE business semantics,
backend logic, or page workflow. Examples are deliberately absent in v0.1 until
they are proven in more than one product context.

## Application Styling Constraint

Application code may define page layout, grid placement, positioning, and the
responsive composition of documented assets. It must not create a new colour,
typography hierarchy, card treatment, spacing rhythm, or control variant.

For example, a local `rounded-xl shadow-md p-6 bg-white` container is a new
card treatment unless it consumes a documented token, Pattern, or Domain asset.

## Forbidden Application Patterns

Application code must not:

- create a page-local Card style or Button/control variant;
- introduce arbitrary colour, typography, radius, shadow, or spacing values as
  product visual language;
- duplicate a documented Pattern or bypass a suitable Domain asset;
- promote a one-page workflow composition into a shared visual rule without
  the extraction and promotion process.

## Documentation Shell Is Separate

Fumadocs is the documentation shell. Its layout, navigation, prose styles,
theme presets, and component demos serve documentation only. They must not be
used as evidence for DOE product layouts, tokens, density, or patterns.

The shadcn primitives shown in Fumadocs demos are implementation examples.
Their generic styling is adopted only where the DOE foundation or a recorded
reference explicitly accepts it.

## Source Distillation

```text
Template, screenshot, prototype, or existing implementation
  -> reference analysis
  -> DOE visual rule, token, pattern, or domain contract
  -> implementation
```

Do not reverse this direction: implementation, a Fumadocs page, or an isolated
screen does not silently become a design-system rule.

The detailed operating process is in
`docs/visual-system/extraction-process.md`.

## Promotion Rules

- A repeated visual value becomes a Foundation token only when its DOE semantic
  role is stable.
- A repeated composition becomes a Pattern only when it is useful in more than
  one product context.
- A business-specific visual becomes a Domain asset only when its data and
  interaction contract is reusable.
- Until promoted, a scoped component contract owns the decision.
