"use client"

import { ReportBlock } from "@/components/domain/report-block"

import * as React from "react"

import { clampMeasurementZoom, comparisonDetailInput, resolveMeasurementComparison } from "@/components/domain/report-cp-data-model"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { reportCpDataScenarios } from "@/components/domain/report-cp-data.scenarios"
import { EmptyState, ReportMeasurement } from "@/components/domain/report-parts"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  reportCpDataInputSchema,
  type ReportCpDataInput,
} from "@/schemas/domain-component-inputs"

export type ReportCpDataSelection = {
  parameterCode: string | null
}

export type ReportCpDataProps = {
  input?: ReportCpDataInput
  className?: string
  /**
   * Optional App-owned selection. A parameter change can replace the rendered
   * dataset, so the component emits intent and never issues a request itself.
   */
  selection?: ReportCpDataSelection
  onParameterChange?: (parameterCode: string | null) => void
}

export function ReportCpData({
  input = reportCpDataScenarios.normal.input,
  className,
  selection,
  onParameterChange,
}: ReportCpDataProps) {
  const parsedInput = React.useMemo(() => reportCpDataInputSchema.parse(input), [input])
  const parameterOptions =
    parsedInput.parameterOptions ?? []
  const measurement = parsedInput.measurement
  const [activeComparisonId, setActiveComparisonId] = React.useState<string | null>(null)
  const [detailWaferId, setDetailWaferId] = React.useState<string | null>(null)
  const [zoom, setZoom] = React.useState(1)
  const activeComparison = measurement?.comparisonGroups?.find((group) => group.id === activeComparisonId) ?? null
  const detailComparison = measurement && detailWaferId ? resolveMeasurementComparison(measurement, detailWaferId, activeComparisonId) : null
  const detailInput = React.useMemo(() => measurement && detailComparison ? comparisonDetailInput(measurement, detailComparison) : null, [measurement, detailComparison])
  const detailOptions = (measurement?.comparisonGroups ?? []).filter((group) => group.members.some((member) => member.waferId === detailWaferId))
  // Dialog Portal mounts after the parent effect; bind when its actual element exists.
  const bindDetailWheel = React.useCallback((element: HTMLDivElement | null) => {
    if (!element) return
    const wheel = (event: WheelEvent) => {
      event.preventDefault()
      setZoom((current) => clampMeasurementZoom(current + (event.deltaY < 0 ? 0.15 : -0.15)))
    }
    element.addEventListener("wheel", wheel, { passive: false })
    return () => element.removeEventListener("wheel", wheel)
  }, [])
  const [uncontrolledParameterCode, setUncontrolledParameterCode] = React.useState<string | null>(
    parsedInput.selectedParameterId ?? parameterOptions[0]?.value ?? null,
  )
  const selectedParameterCode = selection ? selection.parameterCode : uncontrolledParameterCode

  const selectParameter = (parameterCode: string | null) => {
    setDetailWaferId(null)
    if (!selection) setUncontrolledParameterCode(parameterCode)
    onParameterChange?.(parameterCode)
  }

  return (
    <div className={className}>
      {parameterOptions.length === 0 ? (
        <EmptyState>暂无 CP Data 数据</EmptyState>
      ) : (
        <div className="domain-ui-typography domain-ui-report-pane grid gap-4 p-4">
          <ReportBlock input={{ id: "cp-data-parameter-analysis", title: "CP Parameter Analysis", helpText: "选择 CP 参数，查看各 Wafer 的 die 测量分布、均值、中位数与参考线；展示当前报告快照中的测量数据。" }}>
          <CpParameterCombobox
            options={parameterOptions}
            value={selectedParameterCode}
            onValueChange={selectParameter}
          />
          {!selectedParameterCode ? <EmptyState>请选择 CP Parameter</EmptyState> : measurement ? <>
            <ReportMeasurement appearance="report-chart" input={measurement} activeComparisonId={activeComparison?.id}
              headerAction={measurement.comparisonGroups?.length ? <Select value={activeComparison?.id ?? null} onValueChange={(value) => setActiveComparisonId(value)}>
                <SelectTrigger aria-label="比较组" className="max-w-xs"><SelectValue>{activeComparison?.label ?? "请选择比较组"}</SelectValue></SelectTrigger>
                <SelectContent>{measurement.comparisonGroups.map((group) => <SelectItem key={group.id} value={group.id}>{group.label}</SelectItem>)}</SelectContent>
              </Select> : undefined}
              onGroupSelect={(waferId) => {
                const comparison = resolveMeasurementComparison(measurement, waferId, activeComparisonId)
                if (comparison) setActiveComparisonId(comparison.id)
                setDetailWaferId(waferId); setZoom(1)
              }} />
            <Dialog open={Boolean(detailWaferId && selectedParameterCode)} onOpenChange={(open) => { if (!open) setDetailWaferId(null) }}>
              <DialogContent className="domain-ui-typography max-h-[calc(100dvh-32px)] overflow-hidden sm:max-w-[min(var(--doe-wafer-inspection-dialog-width,1280px),calc(100vw-32px))]">
                <DialogHeader className="pr-8">
                  <DialogTitle>{detailComparison ? `${detailComparison.label} · BSL & Split Detail` : "选择晶圆比较组"}</DialogTitle>
                  <DialogDescription>{detailComparison ? `${measurement.metric.label} · ${detailComparison.members.length} memberships · 统计基于完整数据，画布缩放不改变统计或纵轴范围。` : `${detailWaferId} 的真实比较组；共享 Wafer 需要明确 Step 上下文。`}</DialogDescription>
                </DialogHeader>
                {!detailComparison ? <div className="grid max-h-[60dvh] gap-2 overflow-y-auto">{detailOptions.length ? detailOptions.map((group) => <Button key={group.id} variant="outline" onClick={() => setActiveComparisonId(group.id)}>{group.label}</Button>) : <EmptyState>该晶圆没有可用的比较组成员事实</EmptyState>}</div> : <>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" aria-label="缩小画布" disabled={zoom <= 0.75} onClick={() => setZoom((current) => clampMeasurementZoom(current - 0.25))}>−</Button>
                    <Button variant="outline" size="sm" aria-label="复位画布 100%" onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</Button>
                    <Button variant="outline" size="sm" aria-label="放大画布" disabled={zoom >= 3} onClick={() => setZoom((current) => clampMeasurementZoom(current + 0.25))}>+</Button>
                    <span className="text-xs text-muted-foreground">75%–300% · 滚轮缩放 · Esc 关闭</span>
                  </div>
                  <div ref={bindDetailWheel} className="min-h-0 max-h-[calc(100dvh-260px)] overflow-auto">
                    {detailInput ? <ReportMeasurement input={detailInput} activeComparisonId={detailComparison.id} canvasZoom={zoom} /> : <EmptyState>{detailComparison.detail.reason ?? "该组未提供可用的明细纵轴范围"}</EmptyState>}
                  </div>
                  <p className="text-xs text-muted-foreground" data-cp-detail-outside-count={detailComparison.detail.offscreenPointCount}>{detailComparison.detail.offscreenPointCount.toLocaleString()} 个原始有限数值点位于明细视野外 / 共 {detailComparison.detail.totalPointCount.toLocaleString()} 条原始采集记录（包含未绘制或无数值记录）；统计保留后端完整样本口径。</p>
                  <div className="flex flex-wrap gap-2 text-xs">{detailComparison.members.map((member) => <span className="rounded border px-2 py-1" key={`${member.waferId}:${member.variantRowId}`}>
                    {measurement.groups.find((group) => group.id === member.waferId)?.label ?? member.waferId} · {member.roleLabel}{member.condition ? ` · ${member.condition}` : ""}{measurement.groups.some((group) => group.id === member.waferId) ? "" : " · 无 CP 点数据"}
                  </span>)}</div>
                </>}
              </DialogContent>
            </Dialog>
          </> : <EmptyState>当前参数暂无 CP Data 数据</EmptyState>}
          </ReportBlock>
        </div>
      )}
    </div>
  )
}

function CpParameterCombobox({
  options,
  value,
  onValueChange,
}: {
  options: NonNullable<ReportCpDataInput["parameterOptions"]>
  value: string | null
  onValueChange: (parameterCode: string | null) => void
}) {
  const inputId = React.useId()
  const selectedOption = options.find((option) => option.value === value) ?? null

  return (
    <Combobox
      items={options}
      value={selectedOption}
      onValueChange={(nextValue) => onValueChange(nextValue?.value ?? null)}
      itemToStringLabel={(item) => item.label}
    >
      <div className="grid gap-1 sm:max-w-xs">
        <label htmlFor={inputId} className="text-xs font-medium text-muted-foreground">
          CP Parameter
        </label>
        <ComboboxInput
          id={inputId}
          placeholder="搜索并选择 CP Parameter"
          showClear
        />
      </div>
      <ComboboxContent>
        <ComboboxEmpty>无匹配参数</ComboboxEmpty>
        <ComboboxList>
          {(option) => (
            <ComboboxItem key={option.value} value={option} disabled={option.disabled}>
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
