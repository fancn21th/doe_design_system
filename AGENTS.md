<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 通用实现规则

- 在完成功能前提下，以精简并删除历史冗余代码为荣以堆砌重复实现为耻

## DOE Domain UI Agent Rules

Before the first Domain UI change in a task or session, read `CONTEXT.md`. If context was compacted, lost, or inherited from another task, read it again. After that, reread only the relevant ADR, component pattern, fixture, scenario, or local primitive source.

For work that spans DOE Domain UI, DOE Backend BFF, and DOE App, use the shared SOP at `/Users/fantianze/Vibe/g-working/g-doe/doe-new-app/docs/refactor/three-upstream-development-sop.md`; this repository owns only the UI Upstream role-specific part described in `content/docs/sop/ai-coding.mdx`. For component updates based on `/Users/fantianze/Vibe/g-working/g-doe/ui`, follow `content/docs/sop/ui-reference-refactor.mdx`.

Hard rules:

- Lock task scope before implementation; inspect only files needed for the requested scope.
- Follow the established Domain UI component pattern: component, schema, fixtures, scenarios, and MDX preview.
- Domain components own local business interaction only; app workflow, app services, gateways, backend calls, and real MES/Oracle submission belong outside Domain UI.
- Demo and test data belong in fixtures and scenarios, not inline inside domain component rendering logic.
- Existing scenarios are the source of truth for known prototype behavior; reopen the prototype only when the user explicitly asks or no scenario/contract exists.
- Compose foundation UI from `src/components/ui` shadcn primitives; check existing local usage before using `Select`, `DropdownMenu`, or other Base UI style primitives in a new way.
- For UI sourced from `/Users/fantianze/Vibe/g-working/g-doe/ui`, follow the source-of-truth and fidelity rules in `content/docs/sop/ui-reference-refactor.mdx`. When the user says “照办” or asks for a named shadcn block, bring in the complete local upstream block without manual redesign, renaming, pruning, or composition changes. Ask for approval before any deviation.
- Validate incrementally: targeted typecheck, targeted lint, relevant tests, then browser verification only for changed interactions.
- Run full build once after implementation is complete; do not restart the full validation ladder after every small edit.

For architecture rationale, glossary, conventions, canonical examples, and the detailed execution protocol, see `CONTEXT.md`.
