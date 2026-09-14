# Measurement Uses an Upstream Adapter Boundary

`doe-copilot-hackathon` at port 5173 is a read-only data upstream for the Measurement work. The Domain UI project must neither import from nor modify that application; an application-owned adapter maps its CP or Inline DTO into Measurement's independent UI-facing input before rendering.

**Consequences**

Measurement's schema expresses rendering facts such as groups, full point clouds, precomputed summaries, reference lines, hover comparison cohorts, and inspection fields. Oracle/CP semantics such as source filtering, baseline policy, Cpk calculation, Stage grouping, routing, and endpoint evolution remain upstream or in the consuming application. Changes required to expose richer upstream plot metadata are negotiated and delivered by the upstream owner, never implemented in this repository.
