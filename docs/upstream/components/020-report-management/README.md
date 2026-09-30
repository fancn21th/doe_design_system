# Report Center 管理与版本工作区

## Intake

- Component group: `ReportManagementList` / `ReportManagementWorkspace` / `ReportVersionControl`
- Sequence: 020
- Source: `/Users/liao/Desktop/project/DTJX/交付文档/改动映射方案.md`
- Prototype basis: 版本原型2 / DOE Workbench 最终原型
- Intake status: Confirmed implementation contract

## Environment Note

当前机器不存在历史 SOP 中的 `/Users/fantianze/Vibe/g-working/g-doe/ui`。本次不依赖或猜测该目录内容；canonical source 是当前本地 `doe_design_system`，视觉与交互事实来自已确认的改动映射方案、现有 Design System 合同和本仓 shadcn primitives。

## Confirmed UI Regions

- 未选择报告时，报告管理列表占满工作区。
- 选择报告后，左侧目录与右侧预览并列，分隔条可拖拽。
- 右侧预览支持关闭和全屏；窄屏只显示列表或预览之一。
- 列表支持 Lot ID、Product Name 本地筛选与 10/20/50 分页。
- 版本控件展示版本号、生成时间、生成人、说明、当前版本标识与历史版本提示。

## Ownership

Domain UI owns:

- 目录表格、纯展示筛选、分页和 action intents；
- catalog/preview 的响应式与 resizable 布局；
- 受控版本选择、历史版本提示和下载 intent。

Consumer owns:

- `sourceId + tab + version` URL；
- XState、真实数据加载、版本缓存清理；
- 下载、重新生成、删除命令与权限；
- Report tab 内容和跨 tab workflow。

## Data Honesty

- Product、Wafer 数量、当前版本缺失时展示 `—`。
- 不把 fixture 值补到真实 source。
- 不可用命令保持 disabled，并显示调用方提供的原因。
- 历史版本只表达选择 intent；消费者必须按 `versionId` 加载不可变快照。
