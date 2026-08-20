# DOE UI

面向 DOE 应用的 AI-readable UI 与 Domain 基础设施。

## 启动 / Getting Started

启动本地开发服务：

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看 Showcase，打开 [http://localhost:3000/docs](http://localhost:3000/docs) 查看文档。

## MVP 范围 / Scope

- `Button`：验证基础 UI。
- `DataState`：验证 DOE 业务语义 / Business Semantics。
- `RoundContext`：验证 DOE 领域组合 / Domain Composition。

## Registry

构建本地 shadcn Registry：

```bash
pnpm exec shadcn build
```

生成结果会放在 `public/r`。

## AI 编码规则 / Coding Rule

创建新组件前优先复用已有 Domain Components。不要把 `NO_DATA`、`N/A` 或 missing values 转换成 `0`。
