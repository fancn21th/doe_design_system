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

type ReportWaferMapProps = {
  input?: ReportWaferMapInput
  className?: string
}

type PrimaryView = "cp" | "defect"
type CpView = "final-bin" | "parameter"
type CpParameterOption = { label: string; value: string }

export function ReportWaferMap({
  input = reportWaferMapScenarios.normal.input,
  className,
}: ReportWaferMapProps) {
  const scenarioInput = reportWaferMapScenarios.normal.input
  const parsedInput = reportWaferMapInputSchema.parse(input)
  const mapViews = parsedInput.mapViews ?? scenarioInput.mapViews ?? []
  const finalBinView = findMapView(mapViews, "cp-final-bin")
  const parameterViews = findMapViews(mapViews, "cp-parameter")
  const defectView = findMapView(mapViews, "defect")
  const [primaryView, setPrimaryView] = React.useState<PrimaryView>("cp")
  const [cpView, setCpView] = React.useState<CpView>("final-bin")
  const [selectedParameterCode, setSelectedParameterCode] = React.useState<string | null>(
    () => parameterViews[0]?.parameter.parameterCode ?? null
  )
  const parameterOptions = parameterViews.map((view) => ({
    label: view.parameter.label,
    value: view.parameter.parameterCode,
  }))
  const selectedParameterView = parameterViews.find(
    (view) => view.parameter.parameterCode === selectedParameterCode
  )

  const visibleMapView = primaryView === "defect"
    ? defectView
    : cpView === "parameter"
      ? selectedParameterView
      : finalBinView

  if (!finalBinView && parameterViews.length === 0 && !defectView) {
    return <EmptyState>暂无 Report Wafer Map 数据</EmptyState>
  }

  return (
    <section className={className} aria-label="Report Wafer Map">
      <div className="domain-ui-typography grid gap-4 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Tabs
            value={primaryView}
            onValueChange={(value) => setPrimaryView(value as PrimaryView)}
            className="gap-0"
          >
            <TabsList>
              {(finalBinView || parameterViews.length > 0) && (
                <TabsTrigger value="cp">CP Map</TabsTrigger>
              )}
              {defectView && (
                <TabsTrigger value="defect">Defect Map</TabsTrigger>
              )}
            </TabsList>
          </Tabs>

          {primaryView === "cp" && (finalBinView || parameterViews.length > 0) && (
            <>
              <Separator orientation="vertical" className="h-5" />
              <Tabs
                value={cpView}
                onValueChange={(value) => setCpView(value as CpView)}
                className="gap-0"
              >
                <TabsList>
                {finalBinView && (
                  <TabsTrigger value="final-bin">Final Bin</TabsTrigger>
                )}
                {parameterViews.length > 0 && (
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
            onValueChange={setSelectedParameterCode}
          />
        )}

        {visibleMapView ? (
          <WaferMapGallery
            input={visibleMapView}
            showParameterLegend={false}
          />
        ) : primaryView === "cp" && cpView === "parameter" ? (
          <EmptyState>请选择 CP Parameter</EmptyState>
        ) : null}
      </div>
    </section>
  )
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
