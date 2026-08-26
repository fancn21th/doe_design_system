# Upstream Inputs

This directory stores raw upstream inputs provided by the user before they are
distilled into domain glossary, ADRs, schemas, scenarios, or component docs.

Upstream files are evidence, not implementation instructions. Treat screenshots
and notes here as source material that still needs modeling before it changes
the Domain UI public API.

## Structure

```text
docs/upstream/
  README.md
  components/
    README.md
    001-component-slug/
      README.md
      screenshot.png
  interactions/
    001-interaction-slug/
      README.md
      screenshot-or-state.png
```

## Intake Rule

Each user-provided business component input should become one folder under
`docs/upstream/components/`.

Each folder should contain:

- `README.md`: component name, source note, observed boundary, and open questions.
- screenshot file: the exact image supplied by the user.

Do not merge multiple candidate components into one folder unless the user says
they are the same component.

Prototype interaction observations should become one folder under
`docs/upstream/interactions/`.

Each interaction folder should contain:

- `README.md`: trigger, state model, user actions, visible feedback, downstream component impact, and scenario candidates.
- screenshot files: key interaction states when available.

Once an interaction is distilled into fixtures, scenarios, schemas, component
contracts, or ADRs, prefer those distilled assets over re-observing the
prototype.
