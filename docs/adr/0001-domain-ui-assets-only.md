# Domain UI Assets Only

This repository is a DOE domain UI asset library and the home of the DOE
product design system; it is not a generic primitive library or a DOE
application. It records schemas, fixtures, scenarios, domain components, and
business UI fragments. It also records DOE visual language, DOE-owned tokens,
and proven product patterns. Foundation components such as Button, Input, and
Dialog come from shadcn rather than from a local component system.

**Consequences**

Foundation UI can be used internally, but it should not become the public reason
this project exists. Public assets are DOE business assets and the DOE product
visual contracts that govern them.

Existing foundation components such as `Button` should be removed from the public registry and public API. They can remain as internal implementation support only when they are shadcn components used by domain components.
