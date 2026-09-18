# DOE App Local-Source Consumption

## Status

Accepted — 2026-09-18

## Decision

DOE App consumes DOE Design System assets through shadcn-style local-source
adoption. Canonical Domain UI components, UI-facing schemas, scenarios, and
documented visual rules are compared and adopted into DOE App's local source
for compilation and local development. DOE App does not consume a runtime
component package.

The Design System remains the authority for DOE visual language and reusable
visual contracts. DOE App retains ownership of BFF integration, mapper logic,
XState, routing, application state, and page composition. Its mapper translates
representations into schema-shaped component input; it must not invent domain
truth.

## Consequences

- A local App file is not permission to create a competing visual convention.
- Future asset updates compare the canonical component/schema/scenario with the
  adopted App source before visual implementation changes.
- This decision supersedes ADR-0007's package-import implication for DOE App
  only. ADR-0007 remains applicable if the Design System later makes a separate
  supported distribution decision for another consumer.
- The consumer procedure and current asset map live in
  [`doe-new-app/docs/frontend/design-system-consumer-contract.md`](../../../doe-new-app/docs/frontend/design-system-consumer-contract.md).
