"use client"

import * as React from "react"

import { reportWaferMapScenarios } from "@/components/domain/report-wafer-map.scenarios"
import { WaferMapGallery } from "@/components/domain/wafer-map"
import { EmptyState } from "@/components/domain/report-parts"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  reportWaferMapInputSchema,
  type ReportWaferMapInput,
  type WaferMapGalleryInput,
} from "@/schemas/domain-component-inputs"

export type ReportWaferMapSelection = {
  primaryView: PrimaryView
  cpView: CpView
  parameterCode: string | null
}

export type ReportWaferMapProps = {
  input?: ReportWaferMapInput
  className?: string
  /**
   * Optional App-owned selection. When present, the component is a controlled
   * visual surface; it never initiates a data request itself.
   */
  selection?: ReportWaferMapSelection
  onPrimaryViewChange?: (view: PrimaryView) => void
  onCpViewChange?: (view: CpView) => void
  onParameterChange?: (parameterCode: string | null) => void
}

type PrimaryView = "cp" | "defect"
type CpView = "final-bin" | "parameter"
type CpParameterOption = { label: string; value: string }

export function ReportWaferMap({
  input = reportWaferMapScenarios.normal.input,
  className,
  selection,
  onPrimaryViewChange,
  onCpViewChange,
  onParameterChange,
}: ReportWaferMapProps) {
  const scenarioInput = reportWaferMapScenarios.normal.input
  const parsedInput = reportWaferMapInputSchema.parse(input)
  const mapViews = parsedInput.mapViews ?? scenarioInput.mapViews ?? []
  const finalBinView = findMapView(mapViews, "cp-final-bin")
  const parameterViews = findMapViews(mapViews, "cp-parameter")
  const defectView = findMapView(mapViews, "defect")
  const [uncontrolledPrimaryView, setUncontrolledPrimaryView] = React.useState<PrimaryView>("cp")
  const [uncontrolledCpView, setUncontrolledCpView] = React.useState<CpView>("final-bin")
  const [uncontrolledParameterCode, setUncontrolledParameterCode] = React.useState<string | null>(
    () => parameterViews[0]?.parameter.parameterCode ?? null
  )
  const primaryView = selection?.primaryView ?? uncontrolledPrimaryView
  const cpView = selection?.cpView ?? uncontrolledCpView
  const selectedParameterCode = selection?.parameterCode ?? uncontrolledParameterCode
  const parameterOptions = parsedInput.parameterOptions ?? parameterViews.map((view) => ({
    label: view.parameter.label,
    value: view.parameter.parameterCode,
  }))
  const viewStates = parsedInput.viewStates ?? mapViews.map((mapView) => ({
    view: mapView.kind,
    status: "ready" as const,
  }))
  const finalBinState = findViewState(viewStates, "cp-final-bin")
  const parameterState = findViewState(viewStates, "cp-parameter")
  const defectState = findViewState(viewStates, "defect")
  const hasCp = Boolean(finalBinView || parameterViews.length || finalBinState || parameterState)
  const hasDefect = Boolean(defectView || defectState)
  const selectedParameterView = parameterViews.find(
    (view) => view.parameter.parameterCode === selectedParameterCode
  )

  const visibleMapView = primaryView === "defect"
    ? defectView
    : cpView === "parameter"
      ? selectedParameterView
      : finalBinView

  if (!hasCp && !hasDefect) {
    return <EmptyState>暂无 Report Wafer Map 数据</EmptyState>
  }

  const selectPrimaryView = (nextView: PrimaryView) => {
    setUncontrolledPrimaryView(nextView)
    onPrimaryViewChange?.(nextView)
  }
  const selectCpView = (nextView: CpView) => {
    setUncontrolledCpView(nextView)
    onCpViewChange?.(nextView)
  }
  const selectParameter = (nextParameterCode: string | null) => {
    setUncontrolledParameterCode(nextParameterCode)
    onParameterChange?.(nextParameterCode)
  }
  const visibleState = primaryView === "defect"
    ? defectState
    : cpView === "parameter"
      ? parameterState
      : finalBinState

  return (
    <section className={className} aria-label="Report Wafer Map">
      <div className="domain-ui-typography grid gap-4 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Tabs
            value={primaryView}
            onValueChange={(value) => selectPrimaryView(value as PrimaryView)}
            className="gap-0"
          >
            <TabsList>
              {hasCp && (
                <TabsTrigger value="cp">CP Map</TabsTrigger>
              )}
              {hasDefect && (
                <TabsTrigger value="defect">Defect Map</TabsTrigger>
              )}
            </TabsList>
          </Tabs>

          {primaryView === "cp" && hasCp && (
            <>
              <Separator orientation="vertical" className="h-5" />
              <Tabs
                value={cpView}
                onValueChange={(value) => selectCpView(value as CpView)}
                className="gap-0"
              >
                <TabsList>
                {(finalBinView || finalBinState) && (
                  <TabsTrigger value="final-bin">Final Bin</TabsTrigger>
                )}
                {(parameterViews.length > 0 || parameterState) && (
                  <TabsTrigger value="parameter">Parameter Map</TabsTrigger>
                )}
                </TabsList>
              </Tabs>
            </>
          )}
        </div>

        {primaryView === "cp" && cpView === "parameter" && (
          <CpParameterCombobox
            options={parameterOptions}
            value={selectedParameterCode}
            onValueChange={selectParameter}
          />
        )}

        {visibleMapView ? (
          <WaferMapGallery
            input={visibleMapView}
            showParameterLegend={false}
          />
        ) : visibleState ? (
          <EmptyState>{viewStateMessage(visibleState.status, visibleState.reason)}</EmptyState>
        ) : primaryView === "cp" && cpView === "parameter" ? (
          <EmptyState>请选择 CP Parameter</EmptyState>
        ) : null}
      </div>
    </section>
  )
}

function findViewState(
  viewStates: Array<{ view: WaferMapGalleryInput["kind"]; status: "ready" | "loading" | "unavailable" | "failed"; reason?: string }>,
  view: WaferMapGalleryInput["kind"],
) {
  return viewStates.find((viewState) => viewState.view === view)
}

function viewStateMessage(status: "ready" | "loading" | "unavailable" | "failed", reason?: string) {
  if (reason) return reason
  if (status === "loading") return "正在读取 Wafer Map 数据"
  if (status === "unavailable") return "当前视图暂不可用"
  if (status === "failed") return "读取 Wafer Map 数据失败"
  return "当前视图暂无可渲染数据"
}

function CpParameterCombobox({
  options,
  value,
  onValueChange,
}: {
  options: CpParameterOption[]
  value: string | null
  onValueChange: (value: string | null) => void
}) {
  const inputId = React.useId()
  const selectedOption = options.find((option) => option.value === value) ?? null

  return (
    <Combobox
      items={options}
      value={selectedOption}
      onValueChange={(nextValue) => onValueChange(nextValue?.value ?? null)}
      itemToStringLabel={(item) => item.label}
      itemToStringValue={(item) => item.value}
      isItemEqualToValue={(item, selectedItem) => item.value === selectedItem.value}
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
          {(option: CpParameterOption) => (
            <ComboboxItem key={option.value} value={option}>
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

function findMapView<Kind extends WaferMapGalleryInput["kind"]>(
  mapViews: WaferMapGalleryInput[],
  kind: Kind
) {
  return mapViews.find(
    (mapView): mapView is Extract<WaferMapGalleryInput, { kind: Kind }> =>
      mapView.kind === kind
  )
}

function findMapViews<Kind extends WaferMapGalleryInput["kind"]>(
  mapViews: WaferMapGalleryInput[],
  kind: Kind
) {
  return mapViews.filter(
    (mapView): mapView is Extract<WaferMapGalleryInput, { kind: Kind }> =>
      mapView.kind === kind
  )
}
