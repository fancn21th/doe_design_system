"use client"

import { useRef, useState, type ReactNode } from "react"
import { Clock3, FileText, MoreHorizontal, Plus, Upload, Trash2 } from "lucide-react"
import { StepConfigDialog } from "@/components/domain/step-config-dialog"
import { wafersBySlot } from "@/components/domain/split-matrix-model"
import type { SplitMatrixLot, SplitMatrixDraft, SplitMatrixStep } from "@/schemas/split-matrix-inputs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function SplitMatrix({ lot, draft, onChange, templateActions, readOnly = false, templateSlots, onTemplateSlotChange, onReleaseStep, lockedStepIds = [] }: {
  lot: SplitMatrixLot; draft: SplitMatrixDraft; onChange: (draft: SplitMatrixDraft) => void; templateActions?: ReactNode
  readOnly?: boolean
  templateSlots?: number[][][]
  onTemplateSlotChange?: (stepIndex: number, variantIndex: number, slot: number) => void
  onReleaseStep?: (stepIndex: number) => void
  lockedStepIds?: string[]
}) {
  const isTemplate = templateSlots !== undefined
  const [showPicker, setShowPicker] = useState(false)
  const [removing, setRemoving] = useState<{ stepIndex: number; variantIndex: number }>()
  const pickerRef = useRef<HTMLInputElement>(null)
  // Template positions are portable design slots. Lot editing uses real wafers only.
  const waferBySlot = wafersBySlot(lot.wafers)
  const waferSlots = Array.from({ length: 25 }, (_, index) => ({ number: index + 1, wafer: waferBySlot.get(index + 1) }))
  const availableSteps = lot.steps.filter((flow) => !draft.steps.some((step) => step.stageId === flow.stageId && step.stepId === flow.stepId && step.stepSeq === flow.stepSeq))
  const updateStep = (stepIndex: number, change: (step: SplitMatrixStep) => SplitMatrixStep) =>
    onChange({ ...draft, steps: draft.steps.map((step, index) => index === stepIndex ? change(step) : step) })
  const addStep = (flow: SplitMatrixLot["steps"][number] | null) => {
    if (!flow || !availableSteps.some((item) => item.id === flow.id)) return
    onChange({ ...draft, steps: [...draft.steps, { stageId: flow.stageId, stageName: flow.stage, stepId: flow.stepId, stepName: flow.step, flowOrder: flow.stepSequence, stepSeq: flow.stepSeq, variants: [{ variantSequence: 1, variantType: "BASELINE", conditionLabel: "Baseline", recipeId: "", waferIds: [] }, { variantSequence: 2, variantType: "VARIANT", conditionLabel: "", recipeId: "", waferIds: [] }] }] })
    setShowPicker(false)
  }
  const [configuring, setConfiguring] = useState<{ stepIndex: number; kind: "qtime" | "edc" }>()
  const configuredStep = configuring ? draft.steps[configuring.stepIndex] : undefined
  return <div className="space-y-4">
    {!readOnly && !isTemplate ? <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {showPicker ? <Combobox items={availableSteps} onValueChange={(flow) => { const selected = flow as SplitMatrixLot["steps"][number] | null; if (selected) addStep(selected) }} itemToStringLabel={(flow) => { const item = flow as SplitMatrixLot["steps"][number]; return `${item.stage} / ${item.step} · ${item.stepSeq}` }}>
          <ComboboxInput ref={pickerRef} aria-label="选择 Stage / Step" className="w-[min(20rem,calc(100vw-4rem))]" placeholder="选择Stage / Step" onKeyDown={(event) => { if (event.key === "Escape") setShowPicker(false) }} />
          <ComboboxContent className="w-[min(25rem,calc(100vw-2rem))] min-w-0"><ComboboxEmpty>没有可添加的 Flow Step</ComboboxEmpty><ComboboxList className="max-h-64">{(flow) => <ComboboxItem key={flow.id} value={flow} className="min-h-10 flex-nowrap gap-2 px-3 py-2"><span className="max-w-20 shrink-0 truncate font-medium" title={flow.stage}>{flow.stage}</span><span className="shrink-0 text-muted-foreground">/</span><span className="min-w-0 flex-1 truncate" title={flow.step}>{flow.step}</span><span className="shrink-0 whitespace-nowrap font-mono text-[11px] text-muted-foreground">{flow.stepSeq}</span></ComboboxItem>}</ComboboxList></ComboboxContent>
        </Combobox> : <Button size="sm" variant="outline" disabled={!availableSteps.length} onClick={() => { setShowPicker(true); requestAnimationFrame(() => pickerRef.current?.focus()) }}><Plus className="size-4" />新增Step</Button>}
      </div>
      {templateActions}
    </div> : null}
    <div className="max-w-full overflow-x-auto rounded-md border">
      <table className="w-max table-fixed border-collapse text-left text-xs">
        <colgroup><col className="w-32" /><col className="w-44" /><col className="w-18" /><col className="w-32" /><col className="w-24" /><col className="w-32" /><col className="w-18" />{waferSlots.map(({ number }) => <col key={number} className="w-12" />)}</colgroup>
        <thead className="sticky top-0 z-10 bg-muted/50 text-muted-foreground"><tr>{["Stage", "Step / Seq", "Baseline", "Condition", "Factor", "Recipe", "操作"].map((label, index) => <th key={label} className={`h-10 whitespace-nowrap border-b px-2 font-medium ${index === 2 || index === 6 ? "text-center" : "text-left"}`}>{label}</th>)}{waferSlots.map(({ number }) => <th key={number} scope="col" className="whitespace-nowrap border-b px-1 text-center font-medium">#{number}</th>)}</tr></thead>
        <tbody>{draft.steps.flatMap((step, stepIndex) => step.variants.map((variant, variantIndex) => {
          const locked = Boolean(step.splitStepId && lockedStepIds.includes(step.splitStepId))
          const editable = !readOnly && !locked
          const flow = lot.steps.find((item) => item.stageId === step.stageId && item.stepId === step.stepId && item.stepSeq === step.stepSeq)
          return <tr key={`${step.stageId}-${step.stepId}-${step.stepSeq}-${variant.variantSequence}`} className="border-b last:border-b-0 hover:bg-muted/20">
            {variantIndex === 0 ? <td rowSpan={step.variants.length} className="border-r px-2 py-2 font-medium" title={step.stageName}><span className="block truncate">{step.stageName}</span></td> : null}
            <td className="px-2 py-2"><div className="flex items-center gap-2"><span title={locked ? "已下发" : "待下发"} className={`flex size-5 shrink-0 items-center justify-center rounded-full ${locked ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"}`}>{locked ? <Upload className="size-3" /> : <Clock3 className="size-3" />}</span><span className="min-w-0"><b className="block truncate" title={step.stepName}>{step.stepName}</b><span className="block truncate text-[11px] leading-4 text-muted-foreground" title={step.stepSeq}>{step.stepSeq}</span>{step.qtime || step.edcSpecEnabled ? <span className="flex gap-1 text-[10px] text-primary">{step.qtime ? <button type="button" title={`${step.qtime.value} ${step.qtime.unit === "HOURS" ? "小时" : "分钟"}`} onClick={() => setConfiguring({ stepIndex, kind: "qtime" })}>Qtime</button> : null}{step.edcSpecEnabled ? <button type="button" onClick={() => setConfiguring({ stepIndex, kind: "edc" })}>EDC Spec</button> : null}</span> : null}</span></div></td>
            <td className="text-center"><input type="radio" name={`baseline-${stepIndex}`} aria-label={`${step.stepName} Baseline`} checked={variant.variantType === "BASELINE"} disabled={!editable} onChange={() => updateStep(stepIndex, (current) => ({ ...current, variants: current.variants.map((row, index) => ({ ...row, variantType: index === variantIndex ? "BASELINE" : "VARIANT" })) }))} /></td>
            <td className="px-2"><Input readOnly={!editable} aria-label="Condition" className="h-7 w-full min-w-0 border-transparent bg-transparent px-1 text-xs shadow-none hover:border-input focus-visible:border-input focus-visible:bg-background" value={variant.conditionLabel ?? ""} onChange={(event) => updateStep(stepIndex, (current) => ({ ...current, variants: current.variants.map((row, index) => index === variantIndex ? { ...row, conditionLabel: event.target.value } : row) }))} /></td>
            <td className="truncate px-2 text-muted-foreground" title="当前 Split Draft 无独立 Factor 数据">—</td>
            <td className="px-2"><select disabled={!editable} aria-label={`${step.stepName} Recipe`} className="h-7 w-full min-w-0 truncate rounded border border-transparent bg-transparent px-1 text-xs font-normal outline-none hover:border-input focus-visible:border-input focus-visible:bg-background" value={variant.recipeId ?? ""} onChange={(event) => updateStep(stepIndex, (current) => ({ ...current, variants: current.variants.map((row, index) => index === variantIndex ? { ...row, recipeId: event.target.value, recipeName: event.target.value } : row) }))}><option value="">选择Recipe</option>{variant.recipeId && !flow?.recipeIds?.includes(variant.recipeId) ? <option value={variant.recipeId}>{variant.recipeId}</option> : null}{(flow?.recipeIds ?? []).map((id) => <option key={id} value={id}>{id}</option>)}</select></td>
            <td className="whitespace-nowrap text-center">{!readOnly ? <><Button size="icon-sm" variant="ghost" title="新增Variant" aria-label="新增Variant" disabled={!editable} className="size-7" onClick={() => updateStep(stepIndex, (current) => ({ ...current, variants: [...current.variants, { variantSequence: Math.max(...current.variants.map((row) => row.variantSequence)) + 1, variantType: "VARIANT", conditionLabel: "", recipeId: "", waferIds: [] }] }))}><Plus className="size-3.5" /></Button><DropdownMenu><DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost" aria-label="更多操作" className="size-7" />}><MoreHorizontal className="size-3.5" /></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-44">{!isTemplate ? <DropdownMenuItem disabled={locked || !onReleaseStep} onClick={() => onReleaseStep?.(stepIndex)}><Upload className="size-4" />{locked ? "已下发" : "下发step"}</DropdownMenuItem> : null}<DropdownMenuItem onClick={() => setConfiguring({ stepIndex, kind: "qtime" })}><Clock3 className="size-4" />Add Qtime</DropdownMenuItem><DropdownMenuItem onClick={() => setConfiguring({ stepIndex, kind: "edc" })}><FileText className="size-4" />EDC Spec</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" disabled={!editable} onClick={() => setRemoving({ stepIndex, variantIndex: 0 })}><Trash2 className="size-4" />删除</DropdownMenuItem></DropdownMenuContent></DropdownMenu></> : "—"}</td>
            {waferSlots.map(({ number, wafer }) => {
              const available = isTemplate || Boolean(wafer)
              const assigned = isTemplate ? Boolean(templateSlots[stepIndex]?.[variantIndex]?.includes(number)) : Boolean(wafer && variant.waferIds.includes(wafer.waferId))
              const status = available ? assigned ? variant.variantType : "未分配" : "不属于当前 Lot"
              return <td key={number} className="px-1 py-1.5 text-center"><button type="button"
                disabled={!editable || !available}
                title={isTemplate ? `模板槽位 #${number}` : wafer ? `Wafer #${number}` : `#${number} 不属于当前 Lot`}
                aria-label={`${step.stepName} #${number} ${status}`} aria-pressed={assigned}
                className={`size-7 rounded-md font-bold disabled:cursor-default ${!available ? "cursor-not-allowed bg-muted/40 text-muted-foreground/50" : assigned ? variant.variantType === "BASELINE" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"}`}
                onClick={() => {
                  if (!editable) return
                  if (isTemplate) { onTemplateSlotChange?.(stepIndex, variantIndex, number); return }
                  if (!wafer) return
                  updateStep(stepIndex, (current) => ({ ...current, variants: current.variants.map((row, index) => ({ ...row, waferIds: index === variantIndex && !assigned ? [...row.waferIds, wafer.waferId] : row.waferIds.filter((id) => id !== wafer.waferId) })) }))
                }}>{assigned ? variant.variantType === "BASELINE" ? "B" : "V" : "—"}</button></td>
            })}
          </tr>
        }))}</tbody>
      </table>
      {!draft.steps.length ? <p className="p-8 text-center text-sm text-muted-foreground">选择真实 Flow Step 后开始配置 Split Table。</p> : null}
    </div>
    <Dialog open={Boolean(removing)} onOpenChange={(open) => { if (!open) setRemoving(undefined) }}><DialogContent><DialogHeader><DialogTitle>{removing?.variantIndex === 0 ? "删除 Step" : "删除 Variant"}</DialogTitle><DialogDescription>确定删除 {removing ? draft.steps[removing.stepIndex]?.stepName : ""} 的{removing?.variantIndex === 0 ? "整个 Step 及其全部配置" : "所选 Variant 和 Wafer 分配"}吗？修改将在保存{isTemplate ? "模板" : "草稿"}后生效。</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setRemoving(undefined)}>取消</Button><Button variant="destructive" onClick={() => { if (!removing) return; const { stepIndex, variantIndex } = removing; if (variantIndex === 0) onChange({ ...draft, steps: draft.steps.filter((_, index) => index !== stepIndex) }); else updateStep(stepIndex, (current) => ({ ...current, variants: current.variants.filter((_, index) => index !== variantIndex) })); setRemoving(undefined) }}>确认删除</Button></DialogFooter></DialogContent></Dialog>
    {configuring && configuredStep ? <StepConfigDialog step={configuredStep} kind={configuring.kind} readOnly={readOnly || Boolean(configuredStep.splitStepId && lockedStepIds.includes(configuredStep.splitStepId))} onSave={(next) => updateStep(configuring.stepIndex, () => next)} onClose={() => setConfiguring(undefined)} /> : null}
    <div className="flex justify-end gap-3 text-xs text-muted-foreground"><span className="text-green-700">B Baseline</span><span className="text-blue-700">V Variant</span><span>— 未分配</span></div>
  </div>
}
