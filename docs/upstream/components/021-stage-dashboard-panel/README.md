# Stage Dashboard Panel

## Intake

- Component: `StageDashboardPanel`
- Sequence: 021
- Source: `/Users/liao/Desktop/project/DTJX/交付文档/改动映射方案.md`
- Prototype basis: 版本原型2 / DOE Workbench 最终原型
- Intake status: Confirmed implementation contract

## Environment Note

当前机器不存在历史 `/Users/fantianze/**` UI 目录。本组件使用当前仓库 shadcn primitives 与已确认映射方案实现，不引用外部绝对路径源码。

## Confirmed UI Regions

- 标题与 Stage identity；
- 下载、全屏、关闭操作，关闭始终在最右侧；
- `loading / ready / empty / error` 四种内容状态；
- 全屏使用同一个面板组件与内容 slot，不建立第二套 Stage 内容实现。

## Ownership

Domain UI owns panel composition, state presentation and callback intents.

Consumer owns Stage selection, XState lifecycle, query/retry/download commands, real Wafer/Defect/Inline children and fullscreen state.

## Data Honesty

组件不生成 `6/25`、Inline 6、Defect 3 等业务事实。fixture 中的演示数字标记为 prototype-backed；真实页面必须注入 Backend BFF 返回的数据或诚实的 empty/error state。
