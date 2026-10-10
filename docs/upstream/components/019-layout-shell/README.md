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

## 2026-10-10 Report container alignment pilot

用户明确选择 Header 内容容器作为 Main 的左右对齐基准，桌面左右各 24px。公共导航需移除标签左右内边距，以右外边距保留当前文字间隔；Split Table 是首个内容区采用者。尺寸与 slot 规则见 Layout Shell MDX 的 Report container alignment contract，用户随后授权推广其他 Tab；共享工作区 selector 统一处理全部报告面板，业务组件仍保持独立预览的原有留白。


验证：App 的 Overview + 7 个业务 Tab 在 1224×984 与 390×984 逐页实测，另检查 1023px 断点及 Split Table 侧栏收起，共 18 组；容器偏差 0px。DS 80 项 / App 185 项测试、目标 lint 及两端最终隔离构建通过。实际截图和量测由 App 的 `docs/acceptance/ui/report-center/records/2026-10-10-report-container-alignment-self-test.md` 归档，不复制为新的数据验收依据。
