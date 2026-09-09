"use client"

import * as React from "react"

import { reportSplitTableScenarios } from "@/components/domain/report-split-table.scenarios"
import {
  EmptyState,
  ReportBadge,
  ReportCard,
  formatPercent,
} from "@/components/domain/report-parts"
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

type RenderRow = {
  row: ReportSplitTableRow
  key: string
  showStage: boolean
  stageRowSpan: number
  showStep: boolean
  stepRowSpan: number
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

function groupRows(rows: ReportSplitTableRow[]): RenderRow[] {
  const renderRows: RenderRow[] = rows.map((row, index) => ({
    row,
    key: `${row.stage}-${row.step}-${row.seq}-${row.waferId}-${row.role}-${index}`,
    showStage: false,
    stageRowSpan: 0,
    showStep: false,
    stepRowSpan: 0,
  }))

  let stageStart = 0
  while (stageStart < renderRows.length) {
    const stage = renderRows[stageStart].row.stage
    let stageEnd = stageStart + 1

    while (
      stageEnd < renderRows.length &&
      renderRows[stageEnd].row.stage === stage
    ) {
      stageEnd += 1
    }

    renderRows[stageStart].showStage = true
    renderRows[stageStart].stageRowSpan = stageEnd - stageStart

    let stepStart = stageStart
    while (stepStart < stageEnd) {
      const { step, seq } = renderRows[stepStart].row
      let stepEnd = stepStart + 1

      while (
        stepEnd < stageEnd &&
        renderRows[stepEnd].row.step === step &&
        renderRows[stepEnd].row.seq === seq
      ) {
        stepEnd += 1
      }

      renderRows[stepStart].showStep = true
      renderRows[stepStart].stepRowSpan = stepEnd - stepStart
      stepStart = stepEnd
    }

    stageStart = stageEnd
  }

  return renderRows
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
  const renderRows = React.useMemo(
    () => groupRows(filteredRows),
    [filteredRows]
  )

  return (
    <ReportCard
      title={parsedInput.title ?? scenarioInput.title ?? "Wafer Split Table"}
      subtitle={parsedInput.subtitle ?? scenarioInput.subtitle}
      sourceLabel={parsedInput.sourceLabel ?? scenarioInput.sourceLabel}
      className={className}
    >
      {rows.length === 0 ? (
        <EmptyState>暂无 Wafer Split Table 数据</EmptyState>
      ) : (
        <div className="p-4">
          <div className="mb-4 flex flex-col gap-3 rounded-lg border bg-muted/20 p-3 md:flex-row">
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
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <ReportBadge tone="neutral">
              Stage: {selectedStageOptions.length || "全部"}
            </ReportBadge>
            <ReportBadge tone="neutral">
              Step: {selectedStepOptions.length || "全部"}
            </ReportBadge>
            <span>
              Showing {filteredRows.length} / {rows.length} wafer split rows
            </span>
          </div>
          {filteredRows.length === 0 ? (
            <EmptyState>当前筛选条件下暂无 Wafer Split Table 数据</EmptyState>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <Table className="min-w-[68rem]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-36 bg-muted/30">Stage</TableHead>
                    <TableHead className="w-44 bg-muted/30">
                      Step / Seq
                    </TableHead>
                    <TableHead>Wafer ID</TableHead>
                    <TableHead>Recipe</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Yield</TableHead>
                    <TableHead>Top Fail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renderRows.map(
                    ({
                      row,
                      key,
                      showStage,
                      stageRowSpan,
                      showStep,
                      stepRowSpan,
                    }) => (
                      <TableRow key={key}>
                        {showStage && (
                          <TableCell
                            rowSpan={stageRowSpan}
                            className="border-r bg-muted/20 align-top font-medium"
                          >
                            {row.stage}
                          </TableCell>
                        )}
                        {showStep && (
                          <TableCell
                            rowSpan={stepRowSpan}
                            className="border-r bg-background align-top"
                          >
                            <span className="font-medium">{row.step}</span>
                            <span className="block font-mono text-xs text-muted-foreground">
                              {row.seq}
                            </span>
                          </TableCell>
                        )}
                        <TableCell>
                          <b className="font-mono text-sky-700">
                            {row.waferId}
                          </b>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {row.role}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {row.recipe}
                        </TableCell>
                        <TableCell>{row.condition}</TableCell>
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
                          <span className="ml-1 text-xs text-muted-foreground">
                            · {row.topFailCount.toLocaleString()}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </ReportCard>
  )
}
