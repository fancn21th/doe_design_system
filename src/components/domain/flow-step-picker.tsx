"use client"

import { useRef, useState } from "react"
import { Plus } from "lucide-react"
import type { SplitMatrixLot } from "@/schemas/split-matrix-inputs"
import { Button } from "@/components/ui/button"
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox"

/** Shared selector for real Lot routes and the Baseflow template catalogue. */
export function FlowStepPicker({ steps, onSelect, alwaysVisible = false, loading = false, disabled = false, onSearchChange, error, onRetry }: {
  onSearchChange?: (search: string) => void
  error?: string
  onRetry?: () => void
  steps: SplitMatrixLot["steps"]
  onSelect: (step: SplitMatrixLot["steps"][number]) => void
  alwaysVisible?: boolean
  loading?: boolean
  disabled?: boolean
}) {
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef<HTMLInputElement>(null)
  if (!alwaysVisible && !showPicker) return <Button size="sm" variant="outline" disabled={disabled || loading || !steps.length} onClick={() => { setShowPicker(true); requestAnimationFrame(() => pickerRef.current?.focus()) }}><Plus className="size-4" />新增Step</Button>
  return <Combobox<SplitMatrixLot["steps"][number]> items={steps} value={null} limit={100} disabled={disabled || (loading && !onSearchChange)} filter={onSearchChange ? null : undefined} onInputValueChange={(value, detail) => { if (detail.reason === "input-change" || detail.reason === "input-clear") onSearchChange?.(value) }} onValueChange={(flow) => { if (flow) { onSelect(flow); setShowPicker(false) } }} itemToStringLabel={(flow) => `${flow.stage} / ${flow.step} · ${flow.stepSeq}`}>
    <ComboboxInput ref={pickerRef} aria-label="选择 Stage / Step" maxLength={128} className="w-[min(20rem,calc(100vw-4rem))]" placeholder={loading ? "正在读取 Flow…" : "选择Stage / Step"} disabled={disabled || (loading && !onSearchChange)} onKeyDown={(event) => { if (event.key === "Escape") setShowPicker(false) }} />
    <ComboboxContent className="w-[min(25rem,calc(100vw-2rem))] min-w-0">
      {onSearchChange || steps.length > 100 ? <p className="px-3 py-2 text-xs text-muted-foreground">输入 Stage、Step 或 Seq 搜索；最多显示 100 项匹配结果。</p> : null}
      {error ? <div role="alert" className="px-3 py-2 text-xs text-destructive">{error}<Button size="sm" variant="outline" onClick={onRetry}>重新加载</Button></div> : null}
      <ComboboxEmpty>{loading ? "正在查询 Baseflow…" : error ? "Baseflow 加载失败，请重试。" : "没有匹配的 Flow Step"}</ComboboxEmpty>
      <ComboboxList className="max-h-64">{(flow) => <ComboboxItem key={flow.id} value={flow} className="min-h-10 flex-nowrap gap-2 px-3 py-2"><span className="max-w-20 shrink-0 truncate font-medium" title={flow.stage}>{flow.stage}</span><span className="shrink-0 text-muted-foreground">/</span><span className="min-w-0 flex-1 truncate" title={flow.step}>{flow.step}</span><span className="shrink-0 whitespace-nowrap font-mono text-[11px] text-muted-foreground">{flow.stepSeq}</span></ComboboxItem>}</ComboboxList>
    </ComboboxContent>
  </Combobox>
}
