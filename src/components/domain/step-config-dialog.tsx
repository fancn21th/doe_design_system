"use client"

import { useState } from "react"
import type { SplitMatrixStep } from "@/schemas/split-matrix-inputs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function StepConfigDialog({ step, kind, readOnly, onSave, onClose }: {
  step: SplitMatrixStep; kind: "qtime" | "edc"; readOnly: boolean
  onSave: (step: SplitMatrixStep) => void; onClose: () => void
}) {
  const [enabled, setEnabled] = useState(kind === "qtime" ? Boolean(step.qtime) : Boolean(step.edcSpecEnabled))
  const [value, setValue] = useState(String(step.qtime?.value ?? 30))
  const [unit, setUnit] = useState<"MINUTES" | "HOURS">(step.qtime?.unit ?? "MINUTES")
  const [error, setError] = useState("")
  function save() {
    if (readOnly) return
    const interval = Number(value)
    if (kind === "qtime" && enabled && (!Number.isFinite(interval) || interval < 1)) {
      setError("请输入不小于 1 的时间间隔。")
      return
    }
    onSave(kind === "qtime" ? { ...step, qtime: enabled ? { value: interval, unit } : null } : { ...step, edcSpecEnabled: enabled })
    onClose()
  }
  return <Dialog open onOpenChange={(open) => { if (!open) onClose() }}><DialogContent className="sm:max-w-md">
    <DialogHeader><DialogTitle>{kind === "qtime" ? "Add Qtime配置" : "EDC Spec配置"}</DialogTitle><DialogDescription>{step.stageName} / {step.stepName} · {step.stepSeq}</DialogDescription></DialogHeader>
    {readOnly ? <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">当前 Step 已下发，配置仅支持查看。</p> : null}
    {kind === "qtime" ? <>
      <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-4"><div><Label htmlFor="step-qtime-enabled">启用 Add Qtime 配置</Label><p className="mt-1 text-xs text-muted-foreground">开启后设置与下一个 Step 的最大时间间隔</p></div><Switch id="step-qtime-enabled" checked={enabled} disabled={readOnly} onCheckedChange={setEnabled} /></div>
      {enabled ? <div className="space-y-2"><Label htmlFor="step-qtime-value">与下一个 Step 的最大时间间隔</Label><div className="grid grid-cols-[1fr_7rem] gap-2"><Input id="step-qtime-value" type="number" min={1} step="any" value={value} disabled={readOnly} onChange={(event) => { setValue(event.target.value); setError("") }} /><select aria-label="Qtime 时间单位" className="h-9 rounded-md border bg-background px-2 text-sm" value={unit} disabled={readOnly} onChange={(event) => setUnit(event.target.value as "MINUTES" | "HOURS")}><option value="MINUTES">分钟</option><option value="HOURS">小时</option></select></div></div> : null}
    </> : <label className="flex items-center gap-2 py-3 text-sm"><input type="checkbox" className="size-4 accent-blue-600" checked={enabled} disabled={readOnly} onChange={(event) => setEnabled(event.target.checked)} />EDC Spec</label>}
    {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
    <DialogFooter><Button variant="outline" onClick={onClose}>{readOnly ? "关闭" : "取消"}</Button>{!readOnly ? <Button onClick={save}>保存配置</Button> : null}</DialogFooter>
  </DialogContent></Dialog>
}
