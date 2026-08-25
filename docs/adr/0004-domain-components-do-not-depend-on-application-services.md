# Domain Components Do Not Depend On Application Services

Domain components must not call application services, gateways, `fetch`, Oracle, MES, or real backend APIs directly. They accept data, callbacks, and UI-facing schemas; application code decides when data is loaded, persisted, or submitted.

**Consequences**

A component can expose `onChange`, `onConfirm`, or similar callbacks, but it should not contain operations such as `saveSplitPlan()`.
