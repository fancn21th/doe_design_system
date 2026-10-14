# Wafer Map 配色配置

三个视图各自读取一份 JSON。颜色不写在绘图代码里；缩略图、单片大图和图例使用同一份配置。现有默认方案保持原来的 Die 颜色。

| 文件 | 编辑内容 |
| --- | --- |
| `final-bin.json` | `states.pass` / `fail` / `unknown` 下的 `byBin` 映射及后备色系 |
| `parameter-map.json` | `stops` 渐变节点、`invalidValue` 无有效值、`cpFailOutline` CP Fail 边框 |
| `defect-map.json` | `byType` 分类颜色、`fallbackPalette` 未逐项配置的分类色板 |

## Final Bin

例如把 CP Pass 的 Bin 1 改为蓝色，只改 `states.pass.byBin["1"]`：

```json
"byBin": { "1": "#2563eb" }
```

`pass`、`fail`、`unknown` 分开设置，先用后端提供的 CP 状态选择配置行，再按去掉 `BIN` 前缀的 Final Bin 标识匹配。Bin `0` 也是正常键。一个 Bin 可能同时含 Pass 和 Fail，二者颜色和图例独立。

没有单独配置的 Bin 用同一状态下的 `fallback`。`hues` 可以是离散色相数组，也可以是 `{ "start": 134, "count": 25 }`（134 到 158）。`saturation` 是饱和度，`lightness` 的 `start` 和 `count` 表示亮度范围。稳定的 Bin hash 选取颜色，同一 Bin 不随数据顺序变色。只需一种后备颜色时，用单个色相数组和 `lightness.count: 1`。

旧输入字段 `input.palette` 只兼容状态未知时的颜色；它不会覆盖 JSON 中显式 CP Pass/Fail 的配置。默认方案为绿色 Pass / 暖色 Fail，但配置可以改变颜色，文字 CP 状态始终来自数据。

## Parameter Map

`stops` 按 `at` 从 0 到 1 严格递增，至少含起点和终点。`hsl` 是 `[色相 0–360, 饱和度 0–100, 亮度 0–100]`。例如三段渐变：

```json
"stops": [
  { "at": 0, "hsl": [240, 70, 40] },
  { "at": 0.5, "hsl": [60, 80, 60] },
  { "at": 1, "hsl": [0, 80, 45] }
]
```

节点之间逐通道线性插值。`at` 是后端已给定色阶范围中的相对位置，不是 SPEC、分位数或测量值；修改它不会改变全批次色阶范围、CPK 或有效值判断。常量范围使用起点颜色。图例含配置节点并从同一解析器取色。

## Defect Map

`byType` 使用实际输入的分类 ID，例如 `class:206`、`class:212`，而非未经确认的分类名称。新增颜色示例：

```json
"byType": { "class:206": "#2563eb", "class:212": "#db2777" }
```

没有指定颜色的分类按稳定 hash 从非空 `fallbackPalette` 中取色。混合分类 Die 仍按匹配分类等宽分段；颜色不会建立分类名称或 Particle 对应关系。

## 每个视图都有的 canvas 配置

- `dieBackground`：合法 Die 的底色；Defect 中也表示无记录 / 未匹配筛选。
- `selectedOutline` / `hoverOutline`：选中和悬停 Die 边框。
- `waferBackground` / `waferBorder`：晶圆背景和外边界。

字符串颜色支持 `#RGB`、`#RRGGBB`、`hsl(H S% L%)`。配置加载时检查字段、色值范围、非空色板和渐变顺序；错误会指出文件及字段，不静默使用隐藏默认值。`schemaVersion` 当前为 `1`；`id` / `name` 标识当前方案，尚无方案选择 UI。

配置通过静态 JSON import 加入构建。开发服务通常热更新；生产改动随正常构建部署生效，尚无热加载、账号偏好或数据库保存。canonical 配置位于 DOE Design System，同步相同文件到 App 的 `src/config/wafer-map/`，不要只同步绘图组件。
