# DOE UI

面向 DOE 应用的业务组件资产库与 Component Lab。

## 启动 / Getting Started

启动本地开发服务：

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看 Showcase，打开 [http://localhost:3000/docs](http://localhost:3000/docs) 查看文档。

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

创建新组件前优先复用已有 Domain Components。基础 UI 控件必须使用原生 shadcn 组件拼装。
