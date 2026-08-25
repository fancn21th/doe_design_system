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
```

## Intake Rule

Each user-provided business component input should become one folder under
`docs/upstream/components/`.

Each folder should contain:

- `README.md`: component name, source note, observed boundary, and open questions.
- screenshot file: the exact image supplied by the user.

Do not merge multiple candidate components into one folder unless the user says
they are the same component.
