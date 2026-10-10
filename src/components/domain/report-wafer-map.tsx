"use client"

import * as React from "react"

import { reportWaferMapScenarios } from "@/components/domain/report-wafer-map.scenarios"
import { WaferMapGallery } from "@/components/domain/wafer-map"
import { ReportState } from "@/components/domain/report-state"
import { EmptyState } from "@/components/domain/report-parts"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  reportWaferMapInputSchema,
  type ReportWaferMapInput,
  type WaferMapGalleryInput,
} from "@/schemas/domain-component-inputs"

export type ReportWaferMapSelection = {
  primaryView: PrimaryView
  cpView: CpView
  focusedWaferId?: string | null
  parameterCode: string | null
  defectLayerId?: string | null
  defectTypeIds?: string[]
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
  onDefectLayerChange?: (layerId: string) => void
  onDefectTypeChange?: (typeIds: string[]) => void
}

export type PrimaryView = "cp" | "defect" | "overlay"
export type CpView = "final-bin" | "parameter"
type CpParameterOption = { label: string; value: string }

export function ReportWaferMap({
  input = reportWaferMapScenarios.normal.input,
  className,
  selection,
  onPrimaryViewChange,
  onCpViewChange,
  onParameterChange,
  onDefectLayerChange,
  onDefectTypeChange,
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
  const [uncontrolledDefectLayerId, setUncontrolledDefectLayerId] = React.useState<string | null>(
    () => defectView?.selectedLayerId ?? null
  )
  const [uncontrolledDefectTypeIds, setUncontrolledDefectTypeIds] = React.useState<string[]>(
    () => defectView?.selectedDefectTypeIds ?? []
  )
  const primaryView = selection?.primaryView ?? uncontrolledPrimaryView
  const cpView = selection?.cpView ?? uncontrolledCpView
  const selectedParameterCode = selection ? selection.parameterCode : uncontrolledParameterCode
  const selectedDefectLayerId = selection?.defectLayerId ?? uncontrolledDefectLayerId ?? defectView?.selectedLayerId ?? null
  const selectedDefectTypeIds = selection?.defectTypeIds ?? uncontrolledDefectTypeIds
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
  const overlayState = parsedInput.overlayState ?? findViewState(viewStates, "overlay")
  const hasCp = Boolean(finalBinView || parameterViews.length || finalBinState || parameterState)
  const hasDefect = Boolean(defectView || defectState)
  const selectedParameterView = parameterViews.find(
    (view) => view.parameter.parameterCode === selectedParameterCode
  )
  const selectedDefectView = defectView && selectedDefectLayerId
    ? { ...defectView, selectedLayerId: selectedDefectLayerId, selectedDefectTypeIds }
    : defectView

  const visibleMapView = resolveVisibleMapView({
    primaryView,
    cpView,
    finalBinView,
    selectedParameterView,
    selectedDefectView,
  })

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
  const selectDefectFilters = (nextFilters: { layerId: string; typeIds: string[] }) => {
    const changes = emitDefectFilterChange(
      { layerId: selectedDefectLayerId, typeIds: selectedDefectTypeIds },
      nextFilters,
      { onLayerChange: onDefectLayerChange, onTypeChange: onDefectTypeChange },
    )
    if (changes.layerChanged) setUncontrolledDefectLayerId(nextFilters.layerId)
    if (changes.typeChanged) setUncontrolledDefectTypeIds(nextFilters.typeIds)
  }
  const visibleState = primaryView === "overlay"
    ? overlayState
    : primaryView === "defect"
    ? defectState
    : cpView === "parameter"
      ? parameterState
      : finalBinState

  return (
    <section className={className} aria-label="Report Wafer Map">
      <div className="domain-ui-typography grid gap-4 p-4">
        <div className="grid gap-3">
          <Tabs
            value={primaryView}
            onValueChange={(value) => selectPrimaryView(value as PrimaryView)}
            className="gap-0"
          >
            <TabsList variant="line" className="max-w-full" aria-label="Wafer Map 视图">
              {hasCp && (
                <TabsTrigger value="cp">CP Map</TabsTrigger>
              )}
              {hasDefect && (
                <TabsTrigger value="defect">Defect Map</TabsTrigger>
              )}
              <TabsTrigger value="overlay">Overlay</TabsTrigger>
            </TabsList>
          </Tabs>

          {primaryView === "cp" && hasCp && (
            <>
              <Tabs
                value={cpView}
                onValueChange={(value) => selectCpView(value as CpView)}
                className="gap-0"
              >
                <TabsList variant="line" className="max-w-full" aria-label="CP Map 类型">
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

        {primaryView === "cp" && cpView === "parameter" && !selectedParameterCode ? (
          <EmptyState>请选择 CP Parameter</EmptyState>
        ) : visibleState && visibleState.status !== "ready" ? (
          <ReportState status={visibleState.status === "loading" ? "loading" : "empty"} title={viewStateMessage(visibleState.status, visibleState.reason)} />
        ) : visibleMapView?.status === "pending" ? (
          <ReportState status="loading" />
        ) : visibleMapView?.status === "unavailable" ? (
          <EmptyState>当前 Wafer Map 数据不可用</EmptyState>
        ) : visibleMapView && visibleMapView.wafers.length === 0 && !visibleMapView.mapStates?.length ? (
          <EmptyState>当前视图暂无可渲染数据</EmptyState>
        ) : visibleMapView ? (
          <WaferMapGallery
            input={visibleMapView}
            renderMissingMap={(state) => <ReportState className="min-h-40" title={state.availability === "empty" ? "当前 Wafer 无此 Map 数据" : "当前 Wafer Map 不可用"} description={state.reason} />}
            showParameterLegend
            focusedWaferId={selection?.focusedWaferId}
            onDefectFiltersChange={selectDefectFilters}
          />
        ) : visibleState ? (
          <ReportState status={visibleState.status === "loading" ? "loading" : "empty"} title={viewStateMessage(visibleState.status, visibleState.reason)} />
        ) : primaryView === "cp" && cpView === "parameter" ? (
          <EmptyState>请选择 CP Parameter</EmptyState>
        ) : null}
      </div>
    </section>
  )
}

type VisibleMapViewArgs = {
  primaryView: PrimaryView
  cpView: CpView
  finalBinView?: WaferMapGalleryInput
  selectedParameterView?: WaferMapGalleryInput
  selectedDefectView?: WaferMapGalleryInput
}

/** Overlay intentionally has no map payload until a shared coordinate contract exists. */
export function resolveVisibleMapView({
  primaryView,
  cpView,
  finalBinView,
  selectedParameterView,
  selectedDefectView,
}: VisibleMapViewArgs): WaferMapGalleryInput | undefined {
  if (primaryView === "overlay") return undefined
  if (primaryView === "defect") return selectedDefectView
  return cpView === "parameter" ? selectedParameterView : finalBinView
}

type DefectFilterChange = { layerId: string | null; typeIds: string[] }
type DefectFilterCallbacks = {
  onLayerChange?: (layerId: string) => void
  onTypeChange?: (typeIds: string[]) => void
}

/** Emits only the intent whose controlled value actually changed. */
export function emitDefectFilterChange(
  current: DefectFilterChange,
  next: { layerId: string; typeIds: string[] },
  callbacks: DefectFilterCallbacks,
) {
  const layerChanged = current.layerId !== next.layerId
  const typeChanged = !sameIds(current.typeIds, next.typeIds)
  if (layerChanged) callbacks.onLayerChange?.(next.layerId)
  if (typeChanged) callbacks.onTypeChange?.(next.typeIds)
  return { layerChanged, typeChanged }
}

function sameIds(left: string[], right: string[]) {
  return left.length === right.length && left.every((item, index) => item === right[index])
}
function findViewState(
  viewStates: Array<{ view: WaferMapGalleryInput["kind"] | "overlay"; status: "idle" | "ready" | "loading" | "unavailable" | "failed"; reason?: string }>,
  view: WaferMapGalleryInput["kind"] | "overlay",
) {
  return viewStates.find((viewState) => viewState.view === view)
}

function viewStateMessage(status: "idle" | "ready" | "loading" | "unavailable" | "failed", reason?: string) {
  if (reason) return reason
  if (status === "idle") return "请选择参数或视图"
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
