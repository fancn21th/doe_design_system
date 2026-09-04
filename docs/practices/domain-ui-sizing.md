# Domain UI Sizing Practice

Use this practice when a DOE domain component composes shadcn primitives into a business surface whose size is not the primitive's ordinary control size.

## When To Read

Read this file before changing domain component layout, dense business tables, evidence previews, selector cards, chart panels, or any shadcn `Button` that visually behaves like a card, tab, tile, or image trigger.

## Method

1. Name the business surface first.
   Examples: wafer selector card, defect evidence preview, split table, release modal, related component stack.

2. Add semantic DOE tokens in `src/app/globals.css`.
   Prefer names such as `--doe-defect-image-height` over local one-off width or height classes.

3. Keep shadcn as the foundation primitive.
   Compose `Button`, `Card`, `Table`, `Dialog`, and other local primitives from `src/components/ui`.

4. If a shadcn primitive represents a business surface, add a semantic utility class.
   Examples:

   ```text
   domain-ui-defect-wafer-item
   domain-ui-defect-image-trigger
   domain-ui-split-table-shell
   domain-ui-split-table
   ```

5. Override primitive slot sizing with a selector at least as specific as the global slot rule.
   Use this pattern when a `Button` should not inherit normal button height:

   ```css
   .domain-ui-typography [data-slot="button"].domain-ui-defect-image-trigger {
     height: var(--doe-defect-image-height);
     min-height: var(--doe-defect-image-height);
   }
   ```

6. Keep scroll boundaries local to the business surface.
   Wide tables or wide inspection panels should scroll inside their module or lab preview, not expand the whole page.

7. Record the token in `DESIGN_SYSTEM.md` and `content/docs/knowledge/design-system.mdx`.

## Acceptance Checks

- The page `body.scrollWidth` does not grow beyond the viewport because of the component.
- Business selector cards can show their intended content without being forced to normal button height.
- Evidence image triggers keep their semantic preview height.
- Animations use centered scale/opacity when the interaction is a selection highlight.
- The implementation still uses shadcn primitives from `src/components/ui`.
