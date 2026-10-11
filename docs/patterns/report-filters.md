# Report filter presentation

2026-10-10：用户明确认可 CP × Inline 的 Step / All Steps 筛选器为验收其他Report Center Tab的样式基准。本轮只记录规范，不批量改变消费者。

筛选由上方标签与下方控件组成，两者左对齐。使用主题字体与muted色；标签13px/400/20px行高，常规输入型控件14px/400、高40px、边框1px、圆角10px、padding7px 12px。当前DOE密度下标签与控件gap5.25px（gap-1.5），同一筛选行各列gap10.5px（gap-3）。宽度随筛选列变化；筛选区域本身不使用整体边框、背景或padding，保留控件边框。同列控件对齐，窄屏自然堆叠，不撑大主视图。

搜索Combobox、多选与Checkbox保留各自业务语义；统一可比的字体、控件表面、对齐及间距，不能为了视觉一致替换交互类型。长值不覆盖下拉指示；焦点、禁用、清除和选择状态仍有效。

本次参考为CP × Inline已有CandidateSelect，桌面1203×984与窄屏390×984均测得控件40px高。App `docs/acceptance/ui/report-center/2026-10-10-filter-standard.md` 保存逐项验收及参考截图、原始DOM量测。其他Tab仍待逐项对照，不以建立规范宣称完成全量统一。
