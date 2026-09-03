# Wafer Component V1 详细设计文档

> 用途：作为 AI Coding 的实现输入  
> 范围：纯前端 Wafer 基础渲染组件 V1  
> 技术方向：React + TypeScript + Canvas 2D  
> 核心目标：稳定渲染单片 Wafer 的 4,099 个 Die，并建立后续多 Layer、RenderPolicy、Interaction、Viewport 的可演进架构

---

## 1. 背景

DOE Wafer Map 是一个高密度二维可视化组件。

当前 POC 已经验证了以下事实：

1. 单片 Wafer 使用约 4,099 个真实 Die 坐标进行展示。
2. 原始 Die 数据以 `[x, y, bin]` 记录为基础。
3. POC 会把原始记录转换为 Die Model，并建立 `x|y -> die` 的坐标索引。
4. 坐标通过统一投影函数转换为屏幕坐标。
5. 实际绘制使用单个 Canvas，遍历所有 Die 并执行 `fillRect()`。
6. Hover / Click 等交互也是 Canvas 级集中处理，而不是 4,099 个独立 DOM 事件。
7. POC 当前已经包含 Final Bin、Parameter Heatmap、Defect、Overlay、Selected Die、Neighborhood、Zoom/Pan 等能力，但这些逻辑大量集中在同一个 renderer 中。

V1 不复制 POC 的全部功能。

V1 的目标是先把 POC 中最基础、最稳定的 Geometry Rendering 能力抽出来，形成可复用的独立 Wafer Component。

---

# 2. V1 目标

V1 只解决一个问题：

> 输入一片 Wafer 的 Die 坐标数据，根据 X/Y 坐标关系计算所有 Die 的屏幕位置，并通过 Canvas 一次性绘制 4,099 个 Die。

V1 的核心链路：

```text
WaferData
   ↓
DieData[]
   ↓
WaferLayout
   ↓
DieGeometry[]
   ↓
RenderPolicy
   ↓
DieAppearance[]
   ↓
DieVisualState[]
   ↓
BaseDieLayer
   ↓
CanvasDieRenderer
   ↓
4,099 × fillRect()
```

---

# 3. V1 Non-Goals

V1 明确不实现以下能力：

```text
Final Bin 业务着色
Parameter Heatmap
Defect
Overlay
Hover
Click
Tooltip
Selected Die
Neighborhood
Zoom
Pan
ROI
Annotation
XState
DOE Workflow
API
BFF
Backend DTO
数据加载
异步状态
业务筛选
多 Wafer 联动
WebGL
OffscreenCanvas
```

不要因为 POC 已经存在这些功能，就在 V1 中提前实现。

---

# 4. 核心设计原则

## 4.1 Container / Presentation 分离

本组件遵循 Container / Presentation Pattern。

但这里的 Container 不负责后端数据加载或 DOE 业务状态，而是负责：

```text
Raw Data
+
Render Config
+
Layout Rule
+
Render Policy

↓

Visual Model
```

Presentation 只负责：

```text
Visual Model

↓

Render
```

即：

```text
Container
    │
    │ 决定“应该画成什么”
    ▼
Visual Model
    │
    │
    ▼
Presentation
    │
    │ 负责“把它画出来”
    ▼
Canvas
```

---

## 4.2 Die 是最小逻辑渲染单元

一个 Wafer 有 4,099 个 Die。

但：

```text
Die ≠ React Stateful Component
Die ≠ 独立 DOM Node
Die ≠ 独立事件监听器
```

正确理解：

> Die 是 Wafer 中最小的逻辑渲染单元和 Render Model 单元。

运行时不应该创建：

```tsx
<Die />
<Die />
<Die />
...
× 4099
```

而应该：

```text
DieData[] × 4099
      ↓
DieVisualState[] × 4099
      ↓
CanvasDieRenderer
      ↓
fillRect() × 4099
```

---

## 4.3 复杂度通过 Layer 增长

未来不要不断给单个 Die 增加状态：

```text
Die
├── finalBin
├── parameter
├── hover
├── selected
├── defect
├── neighborhood
└── ...
```

而应该通过 Layer 增长：

```text
Wafer
│
├── BaseDieLayer
├── ValueLayer
├── DefectLayer
├── InteractionLayer
├── AnnotationLayer
└── BoundaryLayer
```

V1 只实现：

```text
BaseDieLayer
```

---

## 4.4 Geometry 与 Appearance 分离

必须严格区分：

```text
Geometry
=
在哪里画
```

和：

```text
Appearance
=
画成什么样
```

最终：

```text
DieData
   │
   ├── WaferLayout
   │       ↓
   │   DieGeometry
   │
   └── RenderPolicy
           ↓
       DieAppearance

           ↓

      DieVisualState
```

---

## 4.5 RenderPolicy 是可注入的

RenderPolicy 决定：

```text
DieData
   ↓
Appearance
```

Renderer 不理解：

```text
Final Bin
PASS / FAIL
Parameter
Defect
DOE
```

V1 只提供一个最基础的 `BaseDiePolicy`。

以后可以新增：

```text
FinalBinPolicy
ParameterHeatmapPolicy
DefectPolicy
SelectedPolicy
```

而不修改 Layout 或 Renderer。

---

## 4.6 Visual State 必须是 Derived State

不要保存：

```ts
useState<DieVisualState[]>(...)
```

应该：

```text
WaferData
+
RenderConfig
+
Layout
+
Policy

↓

DieVisualState[]
```

即时计算。

V1 没有独立业务状态。

---

# 5. 总体架构

```text
                         Wafer
                           │
                           ▼
                   WaferContainer
                           │
            ┌──────────────┴──────────────┐
            │                             │
        WaferData                 WaferRenderConfig
            │                             │
            └──────────────┬──────────────┘
                           ▼
                     WaferLayout
                           │
                           ▼
                    DieGeometry[]
                           │
                           │
                     RenderPolicy
                           │
                           ▼
                   DieAppearance[]
                           │
                           ▼
                  DieVisualState[]
                           │
                           ▼
                 BaseDieLayerView
                           │
                           ▼
                CanvasDieRenderer
                           │
                           ▼
                 Browser Canvas
```

---

# 6. 数据模型

## 6.1 DieId

```ts
export type DieId = string
```

推荐生成规则：

```ts
function createDieId(x: number, y: number): DieId {
  return `${x}|${y}`
}
```

保持与 POC `x|y` 坐标索引概念一致。

---

## 6.2 DieData

V1 极简定义：

```ts
export interface DieData {
  id: DieId
  x: number
  y: number
}
```

注意：

V1 不包含：

```ts
bin
pass
parameter
defects
selected
hovered
color
screenX
screenY
```

其中：

- `bin / parameter / defect` 属于更高层领域数据。
- `selected / hovered` 属于未来 InteractionState。
- `color` 属于 Appearance。
- `screenX / screenY` 属于 Geometry。

---

## 6.3 WaferBounds

```ts
export interface WaferBounds {
  minX: number
  maxX: number

  minY: number
  maxY: number
}
```

---

## 6.4 WaferData

```ts
export interface WaferData {
  id: string

  dies: readonly DieData[]

  bounds: WaferBounds
}
```

`bounds` 可以由外部准备，也可以提供纯函数：

```ts
export function calculateWaferBounds(
  dies: readonly DieData[]
): WaferBounds
```

V1 推荐在 Wafer model 创建阶段计算一次，不要在每次 Canvas draw 时重复计算。

---

# 7. Rendering Configuration

## 7.1 WaferRenderConfig

```ts
export interface WaferRenderConfig {
  width: number
  height: number

  padding: number

  dieScale: number

  background: string
}
```

推荐默认值：

```ts
export const DEFAULT_WAFER_RENDER_CONFIG: WaferRenderConfig = {
  width: 720,
  height: 720,

  padding: 48,

  dieScale: 0.82,

  background: '#f5faf9',
}
```

说明：

### width / height

Canvas 逻辑尺寸。

### padding

Wafer footprint 与 Canvas 边界之间的留白。

### dieScale

Die 占一个坐标单位大小的比例。

例如：

```text
1 coordinate unit = 10 px

dieScale = 0.82

Die width ≈ 8.2 px
```

剩余部分形成 Die 之间的视觉间距。

### background

Canvas 背景颜色。

---

# 8. WaferLayout

`WaferLayout` 是 V1 最核心的纯逻辑模块。

它只负责：

> Die Domain Coordinate → Screen Geometry

不允许：

- 读取 Canvas Context
- 设置颜色
- 判断 Final Bin
- 判断 PASS / FAIL
- 处理 hover
- 处理 click
- 管理 React State

---

## 8.1 Layout Interface

```ts
export interface WaferLayout {
  compute(
    wafer: WaferData,
    config: WaferRenderConfig
  ): WaferLayoutResult
}
```

---

## 8.2 DieGeometry

```ts
export interface DieGeometry {
  id: DieId

  x: number
  y: number

  width: number
  height: number
}
```

这里的：

```ts
x
y
```

必须定义为：

> Canvas screen coordinate，表示矩形左上角坐标。

不要和 Domain Coordinate 混淆。

Domain Coordinate 始终保存在：

```ts
DieData.x
DieData.y
```

---

## 8.3 WaferLayoutResult

```ts
export interface WaferLayoutResult {
  width: number
  height: number

  unitX: number
  unitY: number

  cellWidth: number
  cellHeight: number

  dies: readonly DieGeometry[]
}
```

---

# 9. Layout Algorithm

V1 直接继承 POC 已验证的基本坐标思想。

---

## 9.1 Span

```ts
const spanX =
  wafer.bounds.maxX -
  wafer.bounds.minX +
  1

const spanY =
  wafer.bounds.maxY -
  wafer.bounds.minY +
  1
```

---

## 9.2 Plot Area

```ts
const plotWidth =
  config.width -
  config.padding * 2

const plotHeight =
  config.height -
  config.padding * 2
```

---

## 9.3 Unit

为保持 X/Y 比例一致：

```ts
const unit =
  Math.min(
    plotWidth / spanX,
    plotHeight / spanY
  )
```

推荐：

```ts
const unitX = unit
const unitY = unit
```

不要在 V1 中分别拉伸 X/Y。

这样更利于保证 Wafer footprint 不发生形变。

---

## 9.4 Center

```ts
const centerX = config.width / 2
const centerY = config.height / 2

const midX =
  (bounds.minX + bounds.maxX) / 2

const midY =
  (bounds.minY + bounds.maxY) / 2
```

---

## 9.5 Coordinate Projection

Die 中心点：

```ts
const centerScreenX =
  centerX +
  (die.x - midX) * unitX

const centerScreenY =
  centerY -
  (die.y - midY) * unitY
```

注意 Y：

```text
Domain Y 增大
       ↑

Screen Y 增大
       ↓
```

所以必须：

```ts
centerY - (...)
```

这与 POC 当前行为保持一致。

---

## 9.6 Die Size

```ts
const width =
  Math.max(
    1,
    unitX * config.dieScale
  )

const height =
  Math.max(
    1,
    unitY * config.dieScale
  )
```

---

## 9.7 Convert Center To Top-left

```ts
const x =
  centerScreenX -
  width / 2

const y =
  centerScreenY -
  height / 2
```

最终：

```ts
return {
  id: die.id,
  x,
  y,
  width,
  height,
}
```

---

# 10. Layout 必须是纯函数

推荐实现：

```ts
export function createWaferLayout(
  wafer: WaferData,
  config: WaferRenderConfig
): WaferLayoutResult
```

不要一开始写 class。

V1 优先 pure function。

原因：

```text
容易测试
容易 memoize
容易替换
容易 AI Coding 理解
不依赖 React
不依赖 Canvas
```

---

# 11. RenderPolicy

## 11.1 DieAppearance

```ts
export interface DieAppearance {
  fill: string

  stroke?: string
  strokeWidth?: number

  opacity?: number

  visible?: boolean
}
```

---

## 11.2 Policy Contract

```ts
export interface DieRenderPolicy<
  TDie extends DieData = DieData,
  TContext = unknown
> {
  resolve(
    die: TDie,
    context: TContext
  ): DieAppearance
}
```

---

## 11.3 BaseDiePolicy

V1：

```ts
export const baseDiePolicy: DieRenderPolicy<
  DieData,
  void
> = {
  resolve() {
    return {
      fill: '#d9e8e4',
      opacity: 1,
      visible: true,
    }
  },
}
```

V1 所有 Die 使用相同 Appearance。

---

# 12. DieVisualState

```ts
export interface DieVisualState {
  id: DieId

  geometry: DieGeometry

  appearance: DieAppearance
}
```

Renderer 只消费这个对象。

Renderer 不允许消费：

```ts
DieData
WaferData
WaferBounds
RenderPolicy
```

这是非常重要的边界。

---

# 13. Visual Model Builder

推荐提供一个纯函数：

```ts
export function createDieVisualStates(
  dies: readonly DieData[],
  geometries: readonly DieGeometry[],
  policy: DieRenderPolicy<DieData, void>
): readonly DieVisualState[]
```

实现约束：

- DieData 和 Geometry 通过 `id` 对齐。
- 不依赖 React。
- 不修改输入数组。
- 返回 readonly 数据。
- 不产生副作用。

---

# 14. BaseDieLayer

V1 只有一个 Layer：

```text
BaseDieLayer
```

职责：

> 组织全部 Die 的基础视觉表示，并交给 Renderer 绘制。

---

# 15. BaseDieLayerContainer

推荐 Props：

```ts
export interface BaseDieLayerContainerProps {
  wafer: WaferData

  config: WaferRenderConfig

  policy: DieRenderPolicy<DieData, void>
}
```

示例：

```tsx
export function BaseDieLayerContainer({
  wafer,
  config,
  policy,
}: BaseDieLayerContainerProps) {

  const layout = useMemo(
    () =>
      createWaferLayout(
        wafer,
        config
      ),
    [wafer, config]
  )

  const visuals = useMemo(
    () =>
      createDieVisualStates(
        wafer.dies,
        layout.dies,
        policy
      ),
    [
      wafer.dies,
      layout.dies,
      policy,
    ]
  )

  return (
    <BaseDieLayerView
      width={layout.width}
      height={layout.height}
      visuals={visuals}
      background={config.background}
    />
  )
}
```

Container 负责：

```text
Data
+
Config
+
Layout
+
Policy

↓

Visual Model
```

Container 不调用 Canvas API。

---

# 16. BaseDieLayerView

Presentation Component：

```ts
export interface BaseDieLayerViewProps {
  width: number
  height: number

  background: string

  visuals:
    readonly DieVisualState[]
}
```

实现：

```tsx
export function BaseDieLayerView(
  props: BaseDieLayerViewProps
) {
  return (
    <CanvasDieRenderer
      {...props}
    />
  )
}
```

V1 即使这一层很薄，也保留它。

因为未来：

```text
BaseDieLayer
ValueLayer
InteractionLayer
...
```

会在 Presentation Tree 中形成明确结构。

---

# 17. CanvasDieRenderer

这是 V1 唯一真正接触 Canvas API 的模块。

---

## 17.1 Props

```ts
export interface CanvasDieRendererProps {
  width: number
  height: number

  background: string

  visuals:
    readonly DieVisualState[]
}
```

---

## 17.2 Rendering Rules

Canvas Renderer 必须：

1. 设置正确 DPR。
2. 清空 Canvas。
3. 绘制 background。
4. 顺序遍历 `visuals`。
5. 忽略 `visible === false` 的 Die。
6. 设置 opacity。
7. 设置 fill。
8. 执行 `fillRect()`。
9. 如存在 stroke，再执行 `strokeRect()`。
10. 绘制完成恢复 globalAlpha。

---

## 17.3 Device Pixel Ratio

推荐：

```ts
const dpr =
  Math.min(
    window.devicePixelRatio || 1,
    2
  )
```

Canvas backing store：

```ts
canvas.width =
  Math.round(width * dpr)

canvas.height =
  Math.round(height * dpr)
```

CSS size：

```ts
canvas.style.width =
  `${width}px`

canvas.style.height =
  `${height}px`
```

Context：

```ts
ctx.setTransform(
  dpr,
  0,
  0,
  dpr,
  0,
  0
)
```

不要直接把绘制坐标乘 DPR。

Renderer 的 Geometry 始终使用 CSS logical pixels。

---

# 18. Wafer 顶层组件

## 18.1 Public API

V1 保持极简：

```ts
export interface WaferProps {
  data: WaferData

  width?: number
  height?: number

  padding?: number
  dieScale?: number

  renderPolicy?:
    DieRenderPolicy<DieData, void>

  className?: string
}
```

---

## 18.2 Usage

最简单：

```tsx
<Wafer
  data={wafer}
/>
```

指定尺寸：

```tsx
<Wafer
  data={wafer}
  width={720}
  height={720}
/>
```

注入 Policy：

```tsx
<Wafer
  data={wafer}
  renderPolicy={baseDiePolicy}
/>
```

---

# 19. React Component Tree

实际 React Tree：

```text
Wafer
│
└── WaferContainer
      │
      └── BaseDieLayerContainer
            │
            └── BaseDieLayerView
                  │
                  └── CanvasDieRenderer
                        │
                        └── <canvas>
```

不要出现：

```text
Die × 4099 React components
```

---

# 20. 推荐目录结构

```text
components/
└── wafer/
    │
    ├── Wafer.tsx
    ├── WaferContainer.tsx
    ├── types.ts
    ├── constants.ts
    ├── index.ts
    │
    ├── model/
    │   ├── createDieId.ts
    │   └── calculateWaferBounds.ts
    │
    ├── layout/
    │   └── createWaferLayout.ts
    │
    ├── visual/
    │   └── createDieVisualStates.ts
    │
    ├── policy/
    │   └── baseDiePolicy.ts
    │
    ├── layers/
    │   └── base/
    │       ├── BaseDieLayerContainer.tsx
    │       └── BaseDieLayerView.tsx
    │
    ├── renderers/
    │   └── CanvasDieRenderer.tsx
    │
    └── __tests__/
        ├── calculateWaferBounds.test.ts
        ├── createWaferLayout.test.ts
        └── createDieVisualStates.test.ts
```

不要进一步拆文件。

避免 Pattern 导致文件爆炸。

---

# 21. POC → V1 映射关系

当前 POC 中已经存在类似职责：

| POC | V1 |
|---|---|
| `[x,y,bin] records` | `DieData[]` |
| `x|y` key | `DieId` |
| `bounds` | `WaferBounds` |
| `unifiedProjection()` | `createWaferLayout()` |
| `projection.position(die)` | `DieGeometry` |
| `cpFill()` | Future RenderPolicy |
| `drawUnifiedMap()` | 被拆分 |
| `fillRect()` | `CanvasDieRenderer` |
| `viewport` | Future `WaferRenderState` |
| `hitPoints[]` | Future `HitTestIndex` |
| `nearestUnifiedDie()` | Future `HitTest` |

V1 的目标不是重写所有 POC 功能，而是：

> 把 POC procedural renderer 中最基础的 Geometry Rendering 职责抽成独立、可测试、可复用组件。

---

# 22. 为什么 V1 继续选择 Canvas

已经有 POC 验证：

```text
4099 records
   ↓
forEach
   ↓
4099 fillRect()
   ↓
single canvas
```

这是一个已经工作过的实现模型。

所以 V1 不需要为了“组件化”切换成：

```text
4099 div
```

也不需要：

```text
4099 SVG rect
```

也不需要：

```text
WebGL
```

组件化发生在：

```text
Data
Layout
Policy
Layer
Renderer
```

职责边界，而不是要求每个 Die 都成为 DOM Component。

---

# 23. 状态设计

V1 不需要 `WaferRenderState`。

因为暂时没有：

```text
hover
selection
zoom
pan
interaction mode
```

V1 只有：

```text
WaferRenderConfig
```

即静态渲染配置。

未来 V3/V4 再引入：

```ts
export interface WaferRenderState {
  viewport: {
    scale: number
    panX: number
    panY: number
  }

  hoveredDieId?: DieId

  selectedDieId?: DieId
}
```

不要在 V1 提前实现。

---

# 24. Memoization

V1 可以使用：

```ts
useMemo()
```

缓存：

```text
WaferLayoutResult
DieVisualState[]
```

依赖：

```text
wafer
render config
render policy
```

但不要：

```text
premature cache system
WeakMap cache
custom memo library
worker
```

V1 先保持简单。

---

# 25. Error Handling

组件至少需要处理：

## Empty wafer

```ts
wafer.dies.length === 0
```

Renderer 可以只画 background。

## Invalid coordinates

如果：

```ts
!Number.isFinite(die.x)
||
!Number.isFinite(die.y)
```

建议在 Model 创建阶段过滤。

不要在 Renderer 中处理业务数据错误。

## Invalid bounds

如果：

```text
minX > maxX
minY > maxY
```

`createWaferLayout()` 应抛出明确错误。

---

# 26. Accessibility

V1 Canvas 没有单 Die keyboard interaction。

Canvas 至少提供：

```tsx
<canvas
  role="img"
  aria-label={`Wafer ${data.id}, ${data.dies.length} dies`}
/>
```

V1 不需要把 4,099 个 Die 暴露成 4,099 个可访问节点。

未来 Interaction Layer 再设计 keyboard navigation。

---

# 27. Testing Strategy

V1 测试重点不是 Canvas pixel-by-pixel。

核心测试 pure functions。

---

## 27.1 calculateWaferBounds

输入：

```ts
[
  { x: -2, y: 3 },
  { x: 4, y: 8 },
]
```

期望：

```ts
{
  minX: -2,
  maxX: 4,
  minY: 3,
  maxY: 8,
}
```

---

## 27.2 createWaferLayout

重点验证：

### Center

中心 Die 应接近 Canvas 中心。

### Orientation

更大的 Domain Y 应出现在更靠上的 Screen Y。

### Relative Position

若：

```text
A.x < B.x
```

应满足：

```text
A.screenX < B.screenX
```

### Count

```ts
expect(
  layout.dies.length
).toBe(
  wafer.dies.length
)
```

真实 fixture：

```ts
expect(
  layout.dies.length
).toBe(4099)
```

---

## 27.3 createDieVisualStates

确保：

```text
Geometry
+
Policy
→
VisualState
```

并且：

```text
input length
=
output length
```

---

## 27.4 Renderer smoke test

验证：

```text
canvas exists
```

以及：

```text
Canvas Rendering Context 可调用
```

不要把大量时间放在 Canvas 像素单测。

---

# 28. Storybook

建议至少提供：

```text
Wafer / Base
Wafer / 4099 Dies
Wafer / Small Size
Wafer / Large Size
Wafer / Empty
```

如果有 POC fixture：

```text
Wafer / POC Geometry
```

这个 Story 最重要。

目标：

> 用同一组 X/Y 数据验证新组件的 footprint 与 POC 保持一致。

---

# 29. Performance Acceptance

V1 必须验证：

```text
4099 DieData
```

情况下：

### Initial Render

可以流畅完成。

### Parent Rerender

不创建 4,099 个 React component updates。

### Resize / Config Change

只重新：

```text
layout calculation
+
visual model
+
canvas draw
```

### React Profiler

Component tree 应保持固定数量级。

不能看到：

```text
4099 Die React Fibers
```

---

# 30. V1 Definition of Done

满足以下条件才算 V1 完成：

- [ ] 输入 WaferData 可以绘制全部 Die。
- [ ] 使用真实 fixture 时 Die 数量为 4,099。
- [ ] Die 相对 X/Y 空间关系与 POC 一致。
- [ ] Y 轴方向与 POC 一致。
- [ ] 所有 Die 使用一个 Canvas 批量绘制。
- [ ] 没有 4,099 个 React Die Components。
- [ ] Layout 不依赖 Canvas。
- [ ] Layout 不依赖 React。
- [ ] Renderer 不理解 Domain Coordinate。
- [ ] Renderer 不理解 Final Bin。
- [ ] Renderer 不理解 DOE。
- [ ] Geometry 与 Appearance 分离。
- [ ] RenderPolicy 可以注入。
- [ ] V1 只实现 BaseDiePolicy。
- [ ] Layout 有 unit test。
- [ ] Bounds 有 unit test。
- [ ] Visual Model 有 unit test。
- [ ] Storybook 可以独立运行。
- [ ] 真实 4,099 Die fixture 可以稳定展示。

---

# 31. AI Coding 强制约束

下面这些规则请 Coding Agent 严格遵循。

## MUST

```text
MUST use React + TypeScript.
MUST use Canvas 2D for Die rendering.
MUST render all dies through a single Canvas renderer.
MUST keep WaferLayout as pure TypeScript logic.
MUST keep Renderer independent from DOE business concepts.
MUST keep Geometry and Appearance separated.
MUST implement Container / Presentation separation.
MUST keep Die as logical render unit, not stateful React component.
MUST preserve POC X/Y orientation semantics.
MUST provide tests for layout and bounds.
MUST keep public API minimal.
```

## MUST NOT

```text
MUST NOT create 4099 React Die components.
MUST NOT create 4099 DOM nodes.
MUST NOT attach event listeners to individual Die.
MUST NOT implement hover in V1.
MUST NOT implement selection in V1.
MUST NOT implement zoom or pan in V1.
MUST NOT implement Final Bin coloring in V1.
MUST NOT implement Parameter Heatmap in V1.
MUST NOT implement Defect / Overlay in V1.
MUST NOT introduce XState.
MUST NOT introduce WebGL.
MUST NOT introduce OffscreenCanvas.
MUST NOT fetch remote data.
MUST NOT couple renderer to backend DTO.
MUST NOT store derived DieVisualState in React useState.
```

---

# 32. 推荐实现顺序

Coding Agent 严格按以下顺序实现。

## Step 1 — Types

实现：

```text
DieId
DieData
WaferBounds
WaferData
WaferRenderConfig
DieGeometry
WaferLayoutResult
DieAppearance
DieVisualState
DieRenderPolicy
```

---

## Step 2 — Model Utilities

实现：

```text
createDieId()
calculateWaferBounds()
```

单元测试。

---

## Step 3 — WaferLayout

实现：

```text
createWaferLayout()
```

单元测试。

此阶段不要写 React。

---

## Step 4 — BaseDiePolicy

实现：

```text
baseDiePolicy
```

---

## Step 5 — Visual Model

实现：

```text
createDieVisualStates()
```

单元测试。

---

## Step 6 — Canvas Renderer

实现：

```text
CanvasDieRenderer
```

先使用少量 mock dies 测试。

---

## Step 7 — BaseDieLayer

实现：

```text
BaseDieLayerContainer
BaseDieLayerView
```

---

## Step 8 — Wafer

实现：

```text
WaferContainer
Wafer
```

---

## Step 9 — Real Fixture

使用 POC 真实 X/Y fixture。

验证：

```text
4099 dies
```

---

## Step 10 — Storybook

添加：

```text
Base
4099 Dies
Responsive
Empty
```

---

# 33. V2+ Extension Points

V1 必须为未来留出扩展边界，但禁止提前实现。

---

## V2 — Value Layer

```text
Wafer
│
├── BaseDieLayer
└── ValueLayer
```

新增：

```text
FinalBinPolicy
ParameterHeatmapPolicy
```

---

## V3 — Interaction Layer

新增：

```text
Hover
Selected
HitTest
Tooltip
```

Interaction State 属于：

```text
Wafer
```

而不是：

```text
Die
```

---

## V4 — Viewport

新增：

```text
Zoom
Pan
Fit
```

引入：

```ts
WaferRenderState.viewport
```

---

## V5 — Defect / Overlay

新增：

```text
DefectLayer
OverlayLayer
NeighborhoodLayer
AnnotationLayer
```

---

# 34. Architecture Decision Summary

最终必须保持下面四句话成立：

> **DieData 决定“它是什么”。**

> **WaferLayout 决定“它在哪里”。**

> **RenderPolicy 决定“它看起来是什么”。**

> **Renderer 决定“怎么把它画出来”。**

以及：

> **Die 是最小逻辑渲染单元，但不是最小 React 状态单元。**

---

# 35. V1 最终定义

> Wafer V1 是一个基于 Canvas 2D 的纯前端 Geometry Rendering Component。它接收 WaferData，通过 WaferLayout 把 Die Domain Coordinate 转换为 DieGeometry，再通过 RenderPolicy 生成 DieAppearance，组合为 DieVisualState，最终由 CanvasDieRenderer 批量绘制。Container 负责 Visual Model 派生，Presentation 只负责绘制。V1 不承载 DOE 业务状态，不实现交互，不实现 Final Bin、Parameter、Defect 或 Overlay。

最终实现链路必须保持：

```text
POC 4,099 X/Y coordinates
        ↓
WaferData
        ↓
WaferLayout
        ↓
DieGeometry[]
        ↓
BaseDiePolicy
        ↓
DieVisualState[]
        ↓
CanvasDieRenderer
        ↓
4,099 fillRect()
```
