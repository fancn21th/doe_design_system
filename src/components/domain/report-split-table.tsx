"use client"

import * as React from "react"

import { reportSplitTableScenarios } from "@/components/domain/report-split-table.scenarios"
import {
  EmptyState,
  ReportBadge,
  formatPercent,
} from "@/components/domain/report-parts"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/components/ui/combobox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  reportSplitTableInputSchema,
  type ReportSplitTableRow,
  type ReportSplitTableInput,
} from "@/schemas/domain-component-inputs"

type ReportSplitTableProps = {
  input?: ReportSplitTableInput
  className?: string
  onTopFailSelect?: (row: ReportSplitTableRow) => void
}

type ComboboxOption = {
  label: string
  value: string
}

const EMPTY_SPLIT_TABLE_ROWS: ReportSplitTableRow[] = []

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

function toOptions(values: string[] = []): ComboboxOption[] {
  return unique(values).map((value) => ({ label: value, value }))
}

function findSelectedOptions(options: ComboboxOption[], values: string[] = []) {
  const selected = new Set(values)
  return options.filter((option) => selected.has(option.value))
}

function valuesFromOptions(options: ComboboxOption[]) {
  return options.map((option) => option.value)
}

function getRowTone(yieldValue: number): ReportSplitTableRow["tone"] {
  if (yieldValue < 90) return "bad"
  if (yieldValue < 99.5) return "watch"
  return "good"
}

function displayValue(value: string | number | undefined) {
  return value ?? "—"
}

function MultiFilterCombobox({
  label,
  placeholder,
  options,
  value,
  onValueChange,
}: {
  label: string
  placeholder: string
  options: ComboboxOption[]
  value: ComboboxOption[]
  onValueChange: (value: ComboboxOption[]) => void
}) {
  const inputId = React.useId()

  return (
    <Combobox
      items={options}
      multiple
      value={value}
      onValueChange={(nextValue) => onValueChange(nextValue)}
      itemToStringLabel={(item) => item.label}
      itemToStringValue={(item) => item.value}
      isItemEqualToValue={(item, selectedItem) =>
        item.value === selectedItem.value
      }
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1 md:min-w-64">
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-muted-foreground"
        >
          {label}
        </label>
        <div className="relative">
          <ComboboxChips className="min-h-9 pr-8">
            <ComboboxValue>
              {(selectedValue: ComboboxOption[]) => (
                <React.Fragment>
                  {selectedValue.map((item) => (
                    <ComboboxChip
                      key={item.value}
                      aria-label={item.label}
                    >
                      {item.label}
                    </ComboboxChip>
                  ))}
                  <ComboboxChipsInput
                    id={inputId}
                    placeholder={
                      selectedValue.length > 0 ? "" : placeholder
                    }
                    className="h-5 min-w-16 flex-1 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground"
                  />
                </React.Fragment>
              )}
            </ComboboxValue>
          </ComboboxChips>
          <ComboboxContent>
            <ComboboxEmpty>无匹配选项</ComboboxEmpty>
            <ComboboxList>
              {(option: ComboboxOption) => (
                <ComboboxItem key={option.value} value={option}>
                  <span>{option.label}</span>
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </div>
      </div>
    </Combobox>
  )
}

export function ReportSplitTable({
  input = reportSplitTableScenarios.normal.input,
  className,
  onTopFailSelect,
}: ReportSplitTableProps) {
  const scenarioInput = reportSplitTableScenarios.normal.input
  const parsedInput = reportSplitTableInputSchema.parse(input)
  const rows = parsedInput.rows ?? scenarioInput.rows ?? EMPTY_SPLIT_TABLE_ROWS
  const stageOptions = React.useMemo(
    () =>
      toOptions(
        parsedInput.stageOptions ??
          scenarioInput.stageOptions ??
          rows.map((row) => row.stage)
      ),
    [parsedInput.stageOptions, rows, scenarioInput.stageOptions]
  )
  const stepOptions = React.useMemo(
    () =>
      toOptions(
        parsedInput.stepOptions ??
          scenarioInput.stepOptions ??
          rows.map((row) => row.step)
      ),
    [parsedInput.stepOptions, rows, scenarioInput.stepOptions]
  )
  const [selectedStageOptions, setSelectedStageOptions] = React.useState(
    () =>
      findSelectedOptions(
        stageOptions,
        parsedInput.selectedStages ?? scenarioInput.selectedStages
      )
  )
  const [selectedStepOptions, setSelectedStepOptions] = React.useState(
    () =>
      findSelectedOptions(
        stepOptions,
        parsedInput.selectedSteps ?? scenarioInput.selectedSteps
      )
  )
  const selectedStages = React.useMemo(
    () => new Set(valuesFromOptions(selectedStageOptions)),
    [selectedStageOptions]
  )
  const selectedSteps = React.useMemo(
    () => new Set(valuesFromOptions(selectedStepOptions)),
    [selectedStepOptions]
  )
  const filteredRows = React.useMemo(
    () =>
      rows.filter((row) => {
        const matchesStage =
          selectedStages.size === 0 || selectedStages.has(row.stage)
        const matchesStep =
          selectedSteps.size === 0 || selectedSteps.has(row.step)

        return matchesStage && matchesStep
      }),
    [rows, selectedStages, selectedSteps]
  )
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<Set<string>>(
    () => new Set()
  )
  const rowKey = React.useCallback(
    (row: ReportSplitTableRow, index: number) =>
      `${row.stage}-${row.step}-${row.seq}-${row.waferId}-${row.role}-${index}`,
    []
  )
  const filteredRowKeys = React.useMemo(
    () => filteredRows.map(rowKey),
    [filteredRows, rowKey]
  )
  const allFilteredRowsSelected =
    filteredRowKeys.length > 0 &&
    filteredRowKeys.every((key) => selectedRowKeys.has(key))

  function setRowSelected(key: string, selected: boolean) {
    setSelectedRowKeys((current) => {
      const next = new Set(current)
      if (selected) next.add(key)
      else next.delete(key)
      return next
    })
  }

  function setFilteredRowsSelected(selected: boolean) {
    setSelectedRowKeys((current) => {
      const next = new Set(current)
      for (const key of filteredRowKeys) {
        if (selected) next.add(key)
        else next.delete(key)
      }
      return next
    })
  }

  return (
    <div className={className}>
      {rows.length === 0 ? (
        <EmptyState>暂无 Wafer Split Table 数据</EmptyState>
      ) : (
        <div className="domain-ui-typography grid gap-4 p-4">
          <Card size="sm" className="border ring-0 shadow-none">
            <CardContent className="py-0">
              <div className="flex flex-col gap-3 md:flex-row">
                <MultiFilterCombobox
                  label="Stage"
                  placeholder="全部"
                  options={stageOptions}
                  value={selectedStageOptions}
                  onValueChange={setSelectedStageOptions}
                />
                <MultiFilterCombobox
                  label="Step"
                  placeholder="全部"
                  options={stepOptions}
                  value={selectedStepOptions}
                  onValueChange={setSelectedStepOptions}
                />
              </div>
            </CardContent>
          </Card>
          {filteredRows.length === 0 ? (
            <EmptyState>当前筛选条件下暂无 Wafer Split Table 数据</EmptyState>
          ) : (
            <div className="domain-ui-split-table-shell">
              <Table className="domain-ui-split-table domain-ui-report-split-table">
                <TableHeader className="bg-muted/60">
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        aria-label="选择当前筛选结果"
                        checked={allFilteredRowsSelected}
                        onCheckedChange={(checked) =>
                          setFilteredRowsSelected(Boolean(checked))
                        }
                      />
                    </TableHead>
                    <TableHead>Wafer ID</TableHead>
                    <TableHead>Wafer Order</TableHead>
                    <TableHead>Stage ID</TableHead>
                    <TableHead>Step ID</TableHead>
                    <TableHead>Step Sequence</TableHead>
                    <TableHead>Variant Sequence</TableHead>
                    <TableHead>Factor</TableHead>
                    <TableHead>Planned Condition</TableHead>
                    <TableHead>Recipe ID</TableHead>
                    <TableHead>Is Baseline</TableHead>
                    <TableHead>Excluded</TableHead>
                    <TableHead>Step</TableHead>
                    <TableHead>Coverage Status</TableHead>
                    <TableHead>Yield</TableHead>
                    <TableHead>Top Fail Group</TableHead>
                    <TableHead>Top Fail Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map((row, index) => {
                    const key = rowKey(row, index)
                    const isSelected = selectedRowKeys.has(key)

                    return (
                      <TableRow key={key} data-state={isSelected ? "selected" : undefined}>
                        <TableCell>
                          <Checkbox
                            aria-label={`选择 ${row.waferId}`}
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              setRowSelected(key, Boolean(checked))
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <b className="font-mono font-medium">{row.waferId}</b>
                        </TableCell>
                        <TableCell>{displayValue(row.waferOrder)}</TableCell>
                        <TableCell className="font-mono text-xs">{displayValue(row.stageId)}</TableCell>
                        <TableCell className="font-mono text-xs">{displayValue(row.stepId)}</TableCell>
                        <TableCell>{displayValue(row.stepSequence ?? row.seq)}</TableCell>
                        <TableCell>{displayValue(row.variantSequence)}</TableCell>
                        <TableCell>{displayValue(row.factor)}</TableCell>
                        <TableCell>{displayValue(row.plannedCondition ?? row.condition)}</TableCell>
                        <TableCell className="font-mono text-xs">{displayValue(row.recipeId)}</TableCell>
                        <TableCell>{row.isBaseline === undefined ? "—" : row.isBaseline ? "Yes" : "No"}</TableCell>
                        <TableCell>{row.excluded === undefined ? "—" : row.excluded ? "Yes" : "No"}</TableCell>
                        <TableCell>{row.step}</TableCell>
                        <TableCell>{displayValue(row.coverageStatus)}</TableCell>
                        <TableCell>
                          <ReportBadge
                            tone={row.tone ?? getRowTone(row.yield)}
                          >
                            {formatPercent(row.yield)}
                          </ReportBadge>
                        </TableCell>
                        <TableCell>
                          {onTopFailSelect && row.topFail !== "N/A" ? (
                            <button
                              type="button"
                              className="font-mono text-xs font-medium text-sky-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              onClick={() => onTopFailSelect(row)}
                            >
                              {row.topFail}
                            </button>
                          ) : (
                            <span className="font-mono text-xs font-medium text-sky-700">
                              {row.topFail}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {row.topFailCount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
