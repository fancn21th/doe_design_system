# Schema Independent From Components

DOE business schemas are defined independently from the components that render them. Components consume UI-facing schemas through props and callbacks, rather than inventing private business models inside component files.

**Consequences**

A single business object can have multiple UI representations, such as a table, selector, or map. The schema remains UI-facing and does not claim to be the backend, MES, Oracle, or gateway contract.

Public schema modules should export both the runtime Zod schema and the TypeScript type derived from it, so fixtures, scenarios, docs, tests, and components share one verifiable shape.
