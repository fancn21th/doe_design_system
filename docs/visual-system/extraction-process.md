# Visual Rule Extraction Process

DOE visual language is distilled from evidence; it is not inferred from a
single implementation or copied wholesale from a template.

```text
Reference
  -> Observation
  -> Extraction
  -> Normalisation
  -> Pattern or Domain contract
  -> Implementation
```

## 1. Reference

Start with an identifiable template, screenshot, prototype, or existing
implementation. Record its path, URL, commit, or source context in
`references/`. A reference is evidence, never a DOE rule by itself.

## 2. Observation

Capture only observable facts: hierarchy, grouping, density, spacing, border
treatment, colour role, responsive behaviour, and interaction structure. Do
not infer DOE business meaning from example copy or mock data.

## 3. Extraction

State the candidate rule in DOE terms. For example: “a compact summary group
uses semantic status colour and a consistent scan order,” not “copy dashboard
card 01.” Also state what is deliberately rejected.

## 4. Normalisation

Classify the candidate by its stable responsibility:

- Foundation: a reusable DOE semantic token or density rule;
- Pattern: repeated product composition, hierarchy, or interaction structure;
- Domain: DOE business visual with a reusable data and local-interaction
  contract;
- Application: one page's workflow composition; do not promote it yet.

## 5. Promotion and Implementation

Record the approved rule in the owning document before changing shared
implementation. Implement it with documented tokens and shadcn primitives.
If the rule is only needed once, keep it in the scoped domain contract and
review it after another use case appears.

## Evidence Test

Before treating a rule as canonical, answer:

1. What source evidence supports it?
2. What DOE semantic need does it serve?
3. Which layer owns it?
4. What would be harmed if every application invented a different version?

If these cannot be answered, the rule is not ready for promotion.
