# Use Shadcn As The Foundation UI System

Domain UI assets must be built by composing native shadcn components for foundation UI concerns. Shadcn is the design-system-backed foundation for this project; the domain UI project must not build its own local design system or create replacement React components for generic controls such as Button, Input, Select, Dialog, Table, Tabs, Badge, Switch, Tooltip, Card, or Dropdown Menu.

**Consequences**

Custom React code is allowed only where it expresses DOE business UI behavior or composes shadcn primitives into a domain asset. When a needed foundation control exists in shadcn, install or use that shadcn component instead of hand-writing an equivalent local component, variant system, styling API, or primitive abstraction.
