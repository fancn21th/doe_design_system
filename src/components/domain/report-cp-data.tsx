"use client"

import * as React from "react"

import { Measurement } from "@/components/domain/measurement"
import { reportCpDataScenarios } from "@/components/domain/report-cp-data.scenarios"
import { EmptyState } from "@/components/domain/report-parts"
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
  const scenarioInput = reportCpDataScenarios.normal.input
  const parsedInput = reportCpDataInputSchema.parse(input)
  const parameterOptions =
    parsedInput.parameterOptions ?? scenarioInput.parameterOptions ?? []
  const measurement = parsedInput.measurement ?? scenarioInput.measurement
  const [uncontrolledParameterCode, setUncontrolledParameterCode] = React.useState<string | null>(
    parsedInput.selectedParameterId ?? parameterOptions[0]?.value ?? null,
  )
  const selectedParameterCode = selection?.parameterCode ?? uncontrolledParameterCode

  const selectParameter = (parameterCode: string | null) => {
    if (!selection) setUncontrolledParameterCode(parameterCode)
    onParameterChange?.(parameterCode)
  }

  return (
    <div className={className}>
      {parameterOptions.length === 0 || !measurement ? (
        <EmptyState>暂无 CP Data 数据</EmptyState>
      ) : (
        <div className="domain-ui-typography grid gap-4 p-4">
          <CpParameterCombobox
            options={parameterOptions}
            value={selectedParameterCode}
            onValueChange={selectParameter}
          />
          <Measurement input={measurement} />
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
