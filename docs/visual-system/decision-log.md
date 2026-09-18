# DOE Visual System Decision Log

## V001 — Design-system authority

**Decision:** `DESIGN.md` and its referenced `docs/` tree are the sole
normative source for DOE product visual rules.

**Why:** Repeated design-system guidance in consumer, documentation, and coding
pages made it unclear which text Codex should follow.

**Consequence:** Other documents link to the system instead of reproducing its
rules. Component contracts may still record scoped facts.

## V002 — Documentation shell boundary

**Decision:** Fumadocs is a documentation shell, not a DOE product-design
layer. shadcn primitives are implementation dependencies, not the DOE product
visual-language authority.

**Why:** The project needs a DOE-specific visual language without accidentally
promoting documentation styling or generic primitive defaults into product
rules.
