# Domain Components Own Only Local Interaction State

Domain components may own local interaction state such as cell editing, row selection, expand or collapse state, inline validation, and local filters. They must not own cross-component workflows such as Lot to Split to Recipe to Submit.

**Consequences**

Workflow state belongs in the DOE application. Domain UI assets stay focused on local behavior and presentation.
