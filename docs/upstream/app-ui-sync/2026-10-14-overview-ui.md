# App UI 同步记录

只修改 doe_design_system，源仓库 doe-overview-ui 为只读，来源提交7d066b6。

| 资产 | 同步内容 |
| --- | --- |
| Overview | 四指标顺序、折叠模块、重点Wafer/Yield/Condition/Top Fail、OOS标签；移除Top三卡及异常表 |
| Report Split Table / Yield Analysis | 稳定分组身份、标签、Wafer展示、动态分组输入 |
| Parameter Median | Source OOS、取消旧规格列、保留CPK颜色及边界场景 |
| Split Matrix | 移除Factor、模板隐藏Wafer、候选查询callback、按当前行删除 |
| MES JSON | 新增纯只读树/文本/展开折叠/复制组件及schema、fixture、scenario、MDX |

应用路由、登录流程、模板目录和同Product过滤、BFF/API、Oracle/MES下发均属于App，不复制进入组件库。既有layout/trial独立contract不被整文件覆盖。fixture均为显式展示样例，缺失业务数据不由组件补造。原有Parameter Median本地CPK工作已一并整理。

验证：TypeScript、21 个测试文件的 141 项测试、修改组件 ESLint、Next.js 生产构建通过。浏览器确认 Overview 模块折叠/展开和 MES JSON 结构/文本切换正常。未操作数据库，未修改其他仓库。
