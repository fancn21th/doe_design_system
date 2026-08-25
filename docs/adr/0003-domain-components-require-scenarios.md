# Domain Components Require Scenarios

Every domain component needs executable scenarios so it can be rendered and checked in isolation. Normal, empty, loading, partial, error, readonly, and large-data states should be covered when they apply.

**Consequences**

MDX examples may present scenarios, but the scenario itself should be a reusable asset that component lab, tests, and AI-assisted changes can exercise.

Scenario files should live next to the domain component they exercise, for example `split-table.scenarios.ts`. Documentation demos should import scenarios instead of redefining sample states.
