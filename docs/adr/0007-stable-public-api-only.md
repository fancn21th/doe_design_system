# Stable Public API Only

The domain UI project should expose a stable public API instead of leaking internal directories, helpers, and implementation details. Application code should import supported components and types from the package boundary.

**Consequences**

The application depends on named exports such as domain components and public schema types, not on the component library's private file layout.

The codebase should establish a package entry point such as `src/index.ts`. Supported domain components, Zod schemas, and public TypeScript types are exported there; helpers, internal folders, and foundation UI wrappers are not.
