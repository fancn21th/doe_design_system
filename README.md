# DOE UI

面向 DOE 应用的业务组件资产库与 Component Lab。

## 启动 / Getting Started

启动本地开发服务：

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看 Showcase，打开 [http://localhost:3000/docs](http://localhost:3000/docs) 查看文档。

## 应用接入 / Application Integration

应用工程接入这套业务组件前，先读 [DESIGN.md](./DESIGN.md)。

最小接入约束：

- 使用公开的 Domain Components API，不依赖内部目录。
- 引入本项目的 DOE Domain UI styles/tokens。
- 承载业务组件的区域必须包在 `.domain-ui-typography` 下。
- 应用 workflow、App Service、Gateway、MES/Oracle 调用留在应用工程内。

文档站入口：[DOE Product Design System](./DESIGN.md)。Fumadocs 文档站的
主题与示例 UI 仅服务文档，不是 DOE 产品设计规范。

## 当前领域组件 / Domain Components

- `lot`
- `steps`
- `runcard`
- `wafer`
- `wafer-defect`
- `runcard-history`
- `history`

## Registry

构建本地 shadcn Registry：

```bash
pnpm exec shadcn build
```

生成结果会放在 `public/r`。

## AI 编码规则 / Coding Rule

创建新组件前先按 [DESIGN.md](./DESIGN.md) 查找已有 Pattern 或 Domain
资产。基础 UI 控件必须使用原生 shadcn 组件拼装；DOE 视觉规则和 token 以
`DESIGN.md` 指向的规范为准。
