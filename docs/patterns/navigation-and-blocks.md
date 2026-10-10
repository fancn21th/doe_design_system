# Navigation hierarchy and business blocks

2026-10-10：本规范来源于用户对 localhost:4322 Report Center 的 8 条批注及 Block 要求。此前四层导航示意图仅为参考，图中的 Sidebar 240px、蓝色选中线及 48/40/32px 高度、24/16px item 间距不自动成为本轮验收值。

## Navigation hierarchy

原则：不同页面中，同一语义层级使用同一个组件和样式规范。层级由切换范围决定，不由当前摆放位置决定；面包屑、参数选择、筛选和操作按钮不是新增导航层。

| 层级 | 范围 | Report Center 示例 | 当前规范 |
| --- | --- | --- | --- |
| 一级：全局导航 | 平台入口 | 左侧新建 DOE 试验、模板库、知识库、历史试验入口 | 沿用 Sidebar 组件与既有样式，不因报告页面改变 |
| 二级：页面导航 | 报告页面 | Overview、Split Table、Yield Analysis、Wafer Map、Parameter Median、CP Data、Inline Data、CP × Inline | 沿用公共报告导航；文字型 Tabs，当前选中线和 30px 标签间隔不变 |
| 三级：视图导航 | 当前页面或业务 block 内主要视图 | Wafer Map 的 CP Map / Defect Map / Overlay；Inline 的箱型图 / 矩阵；Yield Detail 的三个视图；CP × Inline 的候选分组 | 使用共同的带图标 + 文字 Tabs，基于当前 Inline Data 视图切换样式；左对齐，不放到标题右侧 |
| 四级：子视图导航 | 三级视图内展示类型 | CP Map 的 Final Bin / Parameter Map | 保留当前不带图标的 line Tabs 样式，位于三级下方，左对齐 |

三级导航图标表达每项视图含义，不依靠颜色区分层级；图标不替代文字。所有层级保留键盘、焦点、选中状态和受控 callback。图标使用已有 Lucide 系统。导航过宽时在自身区域滚动，不能撑开主视图。沿用已确认 Header 内容容器的左右边界：>=1024px 左右 24px，<1024px 左右 16px。

批注 8 虽写「二级导航」，目标为 Inline Data 的箱型图 / 矩阵切换；按同一组批注明确的语义，它属于三级，本轮执行左对齐要求，不将报告页面导航移动到 block 内。

本轮实现范围为现有 Report Center 的同层导航；此原则可用于后续其他页面，同层新增导航须消费同一资产，不宣称已审计全平台所有页面。

## Business blocks

主视图内的业务单位称为 **Block**，由 header（标题区）与 body（业务内容）组成。导航回答「看哪一个页面或视图」，Block 回答「当前展示哪一个业务模块」。Block 本身不引入新的导航层。

Report Center 不采用原型 8888 的业务模块折叠容器惯例。标题是语义标题，body 持续可见，不使用标题点击折叠、折叠箭头或默认隐藏内容。图表曲线显隐和 wafer 检视弹窗属于内容交互，不等同于折叠业务模块。

标题资产由 BlockTitle 负责：使用既有 module-title 字体、小问号图标及本地 shadcn Base UI Tooltip 组合。标题提供稳定 id 供锚点定位；问号为可聚焦帮助入口，支持鼠标悬浮和键盘聚焦显示说明。帮助文字解释模块和现有字段，不承载业务计算、筛选操作或产线动作。

最初仅在 Split Table 打样，标题为 **Wafer Split Table**，body 包含现有 Stage / Step 筛选及分组表格。最初其他模块只移除残留折叠行为；用户后续确认的标题推广与间距规范见下方同日补充。

## Ownership

该文件拥有导航层级及 Block 的信息架构规范；组件 MDX 记录其接口、交互和消费边界。App 的 `docs/acceptance/ui/report-center/` 记录实际验收、批注和截图，Exec Plan 记录施工进度。后端、数据投影与统计事实不属于本规范。

## 2026-10-10 批注确认：Block 推广与导航对齐

Split Table 打样已由用户认可。沿用其标题字体（module-title 16px / 600）、标题与 body 的 `gap-4`（当前 DOE 密度实测 14px），首个 Block 顶部距页面导航底部 24px（窄屏 16px）。连续 Block 之间留 24px；每个 Block 均有独立稳定标题锚点及常驻 body，不增加折叠。推广范围：Yield Analysis / Yield Detail Analysis、Wafer Map、Parameter Median 与 CP Data 的 CP Parameter Analysis、Inline Data。帮助说明只解释当前展示与筛选，不新增事实计算。

三级与四级 Tabs 的 list 和 trigger 水平方向内边距均为 0；去掉透明水平 border，使用非末项 16px 右外边距维持现有有效项间隔。三级保留图标 + 文字，四级保留纯文字；导航层级按语义切换范围确定，Block 内导航仍是三级。列表溢出局部滚动。

Parameter Median 筛选区为裸筛选区域，不使用整体 border、圆角背景或外层 padding。保留原有筛选及规格事实。CP Data 的 Measurement 使用已确认报告图表 Card 标准：左右/上下 24px、标题区 gap 24px + 图表内容顶部 padding 24px，无 Header 分割线，标题 16px/600，副标题 14px，图例与元数据右上显示；窄屏允许换行并局部滚动。图表高度及数据逻辑保持原业务约定。
