# Wafer Map 配色配置

三个视图各自读取一份 JSON。颜色不写在绘图代码里；缩略图、单片大图和图例使用同一份配置。默认方案逐项提取自 `DOE Workbench 单文件版(2).html` 的非 Overlay 视图。

| 文件 | 编辑内容 |
| --- | --- |
| `final-bin.json` | `states.pass` / `fail` / `unknown` 下的 `byBin` 映射及后备颜色 |
| `parameter-map.json` | RGB `stops` 渐变节点、`invalidValue` 无有效值、可选 `cpFailOutline` CP Fail 边框 |
| `defect-map.json` | `byType` 分类颜色、`fallbackPalette` 未逐项配置的分类色板 |

## Final Bin

例如把 CP Pass 的 Bin 1 改为蓝色，只改 `states.pass.byBin["1"]`：

```json
"byBin": { "1": "#2563eb" }
```

`pass`、`fail`、`unknown` 分开设置，先用后端提供的 CP 状态选择配置行，再按去掉 `BIN` 前缀的 Final Bin 标识匹配。Bin `0` 也是正常键。一个 Bin 可能同时含 Pass 和 Fail，二者颜色和图例独立。

没有单独配置的 Bin 用同一状态下的 `fallback`。固定后备色写成 `{ "color": "#8E8E93" }`。需要稳定散列色时，也可配置 `hues`、`saturation` 和 `lightness`；`hues` 可以是离散色相数组或 `{ "start": 134, "count": 25 }`。默认配置使用原型的灰色固定后备色。

旧输入字段 `input.palette` 只兼容状态未知时的颜色；它不会覆盖 JSON 中显式 CP Pass/Fail 的配置。文字 CP 状态始终来自数据。

## Parameter Map

`interpolation` 当前固定为 `rgb`。`stops` 按 `at` 从 0 到 1 严格递增，至少含起点和终点；每个 `color` 使用 `#RRGGBB`。例如三段渐变：

```json
"stops": [
  { "at": 0, "color": "#F4E275" },
  { "at": 0.5, "color": "#1A8B95" },
  { "at": 1, "color": "#00224D" }
]
```

节点之间按 RGB 通道线性插值并逐通道四舍五入，与原型的 `lerpColor` 一致。`at` 是后端已给定色阶范围中的相对位置，不是 SPEC、分位数或测量值；修改它不会改变全批次色阶范围、CPK 或有效值判断。常量范围使用起点颜色。图例含配置节点并从同一解析器取色。`cpFailOutline` 设为 `null` 时不绘制 CP Fail 边框，也不显示对应图例；原型默认即为 `null`。

## Defect Map

`byType` 使用实际输入的分类 ID。原型明确提供 `Particle`、`Pattern`、`Bridge`、`Crack`、`Scratch`、`Unknown`、`Void` 七个名称；新增颜色示例：

```json
"byType": { "Particle": "#FF3B30", "Scratch": "#0071E3" }
```

没有指定颜色的分类按稳定 hash 从非空 `fallbackPalette` 中取色。当前真实输入里的 `class:206`、`class:212` 没有可验证的名称映射，因此不会猜测它们与 Particle 等名称的关系；它们使用同一套七色原型色板做稳定 fallback。混合分类 Die 仍按匹配分类等宽分段。

## 每个视图都有的 canvas 配置

- `dieBackground`：合法 Die 的底色；Defect 中也表示无记录 / 未匹配筛选。
- `selectedOutline` / `hoverOutline`：选中和悬停 Die 边框。
- `waferBackground` / `waferBorder`：晶圆背景和外边界。

字符串颜色支持 `#RGB`、`#RRGGBB`、`hsl(H S% L%)`。配置加载时检查字段、色值范围、非空色板和渐变顺序；错误会指出文件及字段，不静默使用隐藏默认值。`schemaVersion` 当前为 `1`；`id` / `name` 标识当前方案，尚无方案选择 UI。

配置通过静态 JSON import 加入构建。开发服务通常热更新；生产改动随正常构建部署生效，尚无热加载、账号偏好或数据库保存。canonical 配置位于 DOE Design System，同步相同文件到 App 的 `src/config/wafer-map/`，不要只同步绘图组件。
