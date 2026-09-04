# Layout Shell

## Intake

- Component name: Layout Shell
- Sequence: 019
- Source screenshot: none
- Intake status: Raw user request

## User Notes

```text
布局组件 放在 通用组件里面 layout 作为前缀
例如 整体左右布局组件 左侧 nav bar 可以关闭
右侧顶部 有一个 nav link 区域

这个组件 只有布局 没有内容 内容可以用 骨架
https://ui.shadcn.com/docs/components/base/skeleton 来占位
```

## Candidate Domain Boundary

Candidate responsibilities:

- Provide a shared layout-only shell for DOE domain component previews or app
  composition experiments.
- Render a left navigation region.
- Allow the left navigation region to collapse and expand locally.
- Render a right-side top navigation link area.
- Render only skeleton placeholders for page content.

Out of scope during intake:

- No business data rendering.
- No app routing ownership.
- No report, trial, wafer, measurement, MES, Oracle, or backend behavior.
- No final application shell decision.

## Implementation Constraint

```text
Use the layout-* naming prefix.
Use skeleton placeholders for content.
Do not place real business content inside this component.
```

## Open Questions

- Should future versions accept explicit content slots, or remain skeleton-only
  as a layout reference?
- Should nav item clicks emit callbacks, or stay visual-only for V1?
- Does this layout become the base for report pages, trial pages, or only
  component documentation previews?
