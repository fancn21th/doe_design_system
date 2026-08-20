# DOE UI

A small, AI-readable UI and domain foundation for DOE applications.

## Getting Started

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the showcase and [http://localhost:3000/docs](http://localhost:3000/docs) for documentation.

## MVP Scope

- `Button`: validates the UI foundation.
- `DataState`: validates DOE business semantics.
- `RoundContext`: validates DOE domain composition.

## Registry

Build the local shadcn registry:

```bash
pnpm exec shadcn build
```

The generated registry is served from `public/r`.

## AI Coding Rule

Reuse existing domain components before creating new ones. Do not convert `NO_DATA`, `N/A`, or missing values to zero.
