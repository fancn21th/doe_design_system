# Layout Components Are Domain Assets

The domain UI project should treat reusable DOE layout structures as first-class domain assets. Layout components such as a domain workspace, module section, evidence preview pane, and business modal frame should be named and tested separately because they preserve business reading order, evidence context, and local interaction boundaries.

**Consequences**

Layout components must compose shadcn foundation components when a foundation primitive exists, and they must not become application shells, routers, or workflow hosts. The application still owns page navigation, service calls, and cross-component workflow state.
