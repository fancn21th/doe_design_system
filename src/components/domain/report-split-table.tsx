"use client"

import * as React from "react"

import { BlockTitle } from "@/components/domain/block-title"

import { reportSplitTableScenarios } from "@/components/domain/report-split-table.scenarios"
import {
  formatPercent,
} from "@/components/domain/report-parts"
import { ReportState } from "@/components/domain/report-state"
import { ReportWaferIdentity, ReportWaferLink } from "@/components/domain/report-wafer-identity"
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
import { cn } from "@/lib/utils"
import {
  reportSplitTableInputSchema,
  type ReportSplitTableRow,
  type ReportSplitTableInput,
  type ReportSplitTableStepFacet,
} from "@/schemas/domain-component-inputs"

type ReportSplitTableProps = {
  input?: ReportSplitTableInput
  className?: string
  onWaferSelect?: (row: ReportSplitTableRow) => void
  onTopFailSelect?: (row: ReportSplitTableRow) => void
}

type ComboboxOption = {
  label: string
  value: string
  sourceCount?: number
  displayCount?: number
  stageId?: string
}

type ReportSplitTableDisplayRow = {
  row: ReportSplitTableRow
  roleLabel: string
}

export type ReportSplitTableGroup = {
  key: string
  rows: ReportSplitTableDisplayRow[]
}

const EMPTY_SPLIT_TABLE_ROWS: ReportSplitTableRow[] = []

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

function toOptions(values: string[] = []): ComboboxOption[] {
  return unique(values).map((value) => ({ label: value, value }))
}

export function getReportSplitTableStepOptions(
  stepFacets: ReportSplitTableStepFacet[] | undefined,
  fallbackValues: string[] = []
): ComboboxOption[] {
  if (!stepFacets?.length) return toOptions(fallbackValues)

  // The facet sequence and both counts are authoritative BFF facts. Preserve
  // them verbatim rather than deriving counts from the active display rows.
  return stepFacets.map(({ step, stepKey, stageId, sourceCount, displayCount }) => ({
    label: step,
    value: stepKey ?? step,
    stageId,
    sourceCount,
    displayCount,
  }))
}

function getOptionDescription(option: ComboboxOption) {
  if (option.sourceCount === undefined || option.displayCount === undefined) {
    return undefined
  }

  return `${option.sourceCount} facts / ${option.displayCount} displayed`
}

function findSelectedOptions(options: ComboboxOption[], values: string[] = []) {
  const selected = new Set(values)
  return options.filter((option) => selected.has(option.value))
}

function valuesFromOptions(options: ComboboxOption[]) {
  return options.map((option) => option.value)
}

function getRowTone(yieldValue: number | null): ReportSplitTableRow["tone"] {
  if (yieldValue === null) return "neutral"
  if (yieldValue < 90) return "bad"
  if (yieldValue < 99.5) return "watch"
  return "good"
}

export function formatSplitTableYield(yieldValue: number | null) {
  return yieldValue === null ? "Unavailable" : formatPercent(yieldValue)
}

function isBaselineRow(row: ReportSplitTableRow) {
  if (row.isBaseline !== undefined) return row.isBaseline

  return ["bsl", "baseline"].includes(row.role.trim().toLowerCase())
}

export function groupReportSplitTableRows(
  rows: ReportSplitTableRow[]
): ReportSplitTableGroup[] {
  const groupedRows = new Map<string, ReportSplitTableRow[]>()

  for (const row of rows) {
    const key = row.stepKey ?? JSON.stringify([row.stageId ?? row.stage, row.stepId ?? row.step, row.stepSequence ?? row.seq])
    const group = groupedRows.get(key)

    if (group) group.push(row)
    else groupedRows.set(key, [row])
  }

  return Array.from(groupedRows, ([key, groupRows]) => {
    const orderedRows = groupRows
      .map((row, index) => ({ row, index }))
      .sort((a, b) => {
        const aIsBaseline = isBaselineRow(a.row)
        const bIsBaseline = isBaselineRow(b.row)

        if (aIsBaseline !== bIsBaseline) return aIsBaseline ? -1 : 1
        return a.index - b.index
      })
      .map(({ row }) => row)
    const splitConditions = unique(
      orderedRows
        .filter((row) => !isBaselineRow(row))
        .map((row) => row.condition)
    )

    return {
      key,
      rows: orderedRows.map((row) => ({
        row,
        roleLabel: row.roleLabel ?? (isBaselineRow(row)
          ? "BSL"
          : `split-${splitConditions.indexOf(row.condition) + 1}`),
      })),
    }
  })
}

export function getReportSplitTableTopFails(row: ReportSplitTableRow) {
  if (row.topFails?.length) return row.topFails

  return [{ parameter: row.topFail, count: row.topFailCount }]
}

function getYieldTextClass(tone: ReportSplitTableRow["tone"]) {
  if (tone === "bad") return "font-semibold text-red-600"
  if (tone === "watch") return "font-semibold text-amber-700"
  return "text-foreground"
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
                      aria-label={
                        getOptionDescription(item)
                          ? `${item.label} · ${getOptionDescription(item)}`
                          : item.label
                      }
                    >
                      {item.label}
                      {getOptionDescription(item) && (
                        <span className="text-muted-foreground">
                          {` · ${getOptionDescription(item)}`}
                        </span>
                      )}
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
                  <span className="flex w-full items-center justify-between gap-4">
                    <span>{option.label}</span>
                    {getOptionDescription(option) && (
                      <span className="font-mono text-xs text-muted-foreground">
                        {getOptionDescription(option)}
                      </span>
                    )}
                  </span>
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </div>
      </div>
    </Combobox>
  )
}

export function ReportSplitTableWaferLink({ row, onWaferSelect }: {
  row: ReportSplitTableRow
  onWaferSelect?: (row: ReportSplitTableRow) => void
}) {
  return ReportWaferLink({
    label: row.displayWaferId ?? row.waferId,
    sourceWaferId: row.waferId,
    title: `查看 ${row.waferId} Yield Analysis`,
    onSelect: onWaferSelect ? () => onWaferSelect(row) : undefined,
  })
}

export function ReportSplitTable({
  input = reportSplitTableScenarios.normal.input,
  className,
  onTopFailSelect,
  onWaferSelect,
}: ReportSplitTableProps) {
  const scenarioInput = reportSplitTableScenarios.normal.input
  const parsedInput = reportSplitTableInputSchema.parse(input)
  const rows = parsedInput.rows ?? scenarioInput.rows ?? EMPTY_SPLIT_TABLE_ROWS
  const stageOptions = React.useMemo(() => {
    if (rows.some((row) => row.stageId)) {
      return Array.from(new Map(rows.map((row) => [row.stageId ?? row.stage, { value: row.stageId ?? row.stage, label: row.stage }])).values())
    }
    return toOptions(parsedInput.stageOptions ?? scenarioInput.stageOptions ?? rows.map((row) => row.stage))
  }, [parsedInput.stageOptions, rows, scenarioInput.stageOptions])
  const allStepOptions = React.useMemo(() => {
    if (!parsedInput.stepFacets?.length && rows.some((row) => row.stepKey)) {
      return Array.from(new Map(rows.map((row) => [row.stepKey ?? row.step, { value: row.stepKey ?? row.step, label: row.step, stageId: row.stageId }])).values())
    }
    return getReportSplitTableStepOptions(parsedInput.stepFacets, parsedInput.stepOptions ?? scenarioInput.stepOptions ?? rows.map((row) => row.step))
  }, [parsedInput.stepFacets, parsedInput.stepOptions, rows, scenarioInput.stepOptions])
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
        allStepOptions,
        parsedInput.selectedSteps ?? scenarioInput.selectedSteps
      )
  )
  const activeStages = findSelectedOptions(stageOptions, valuesFromOptions(selectedStageOptions))
  const selectedStages = new Set(valuesFromOptions(activeStages))
  const stepOptions = allStepOptions.filter((option) => !option.stageId || selectedStages.size === 0 || selectedStages.has(option.stageId))
  const activeSteps = findSelectedOptions(stepOptions, valuesFromOptions(selectedStepOptions))
  const selectedSteps = new Set(valuesFromOptions(activeSteps))
  const filteredRows = rows.filter((row) =>
    (selectedStages.size === 0 || selectedStages.has(row.stageId ?? row.stage)) &&
    (selectedSteps.size === 0 || selectedSteps.has(row.stepKey ?? row.step))
  )
  const groupedRows = React.useMemo(
    () => groupReportSplitTableRows(filteredRows),
    [filteredRows]
  )

  return (
    <div className={className}>
      <section aria-labelledby="wafer-split-table" data-report-block="wafer-split-table" className="domain-ui-typography domain-ui-report-pane grid gap-4 p-4">
        <BlockTitle input={{
          id: "wafer-split-table",
          title: "Wafer Split Table",
          helpText: "按 Stage / Step / Seq 分组查看 Wafer 的 Recipe、Condition、Yield 与 Top Fail，BSL / split 标签标识基准与实验条件分配。可通过 Stage 和 Step 筛选缩小查看范围；结果来自当前报告快照。",
        }} />
        <div data-slot="block-body" className="grid min-w-0 gap-4">
          {rows.length === 0 && (
            <ReportState title="暂无 Split Table 数据" description="当前报告暂无可展示的 Wafer Split Table 数据。" />
          )}
          {rows.length > 0 && (
            <div className="flex flex-col gap-3 md:flex-row">
              <MultiFilterCombobox
                label="Stage"
                placeholder="全部"
                options={stageOptions}
                value={activeStages}
                onValueChange={(options) => {
                  setSelectedStageOptions(options)
                  const ids = new Set(valuesFromOptions(options))
                  setSelectedStepOptions((previous) => previous.filter((option) => !option.stageId || ids.size === 0 || ids.has(option.stageId)))
                }}
              />
              <MultiFilterCombobox
                label="Step"
                placeholder="全部"
                options={stepOptions}
                value={activeSteps}
                onValueChange={setSelectedStepOptions}
              />
            </div>
          )}
          {rows.length > 0 && (filteredRows.length === 0 ? (
              <ReportState title="暂无匹配数据" description="当前筛选条件下暂无 Wafer Split Table 数据，请调整 Stage 或 Step。" />
            ) : (
              <div className="domain-ui-split-table-shell">
                <Table className="domain-ui-split-table domain-ui-report-split-table domain-ui-grouped-table">
                  <TableHeader className="bg-muted/60">
                    <TableRow>
                      <TableHead className="w-[24%]">Stage / Step / Seq</TableHead>
                      <TableHead className="w-[12%]">Wafer ID</TableHead>
                      <TableHead className="w-[18%]">Recipe</TableHead>
                      <TableHead className="w-[18%]">Condition</TableHead>
                      <TableHead className="w-[10%]">Yield</TableHead>
                      <TableHead className="w-[18%]">Top Fail</TableHead>
                    </TableRow>
                  </TableHeader>
                  {groupedRows.map((group) => (
                    <TableBody key={group.key}>
                      {group.rows.map(({ row, roleLabel }, index) => {
                        const topFails = getReportSplitTableTopFails(row)
                        const topFailText = topFails
                          .map(
                            ({ parameter, count }) =>
                              `${parameter} · ${count.toLocaleString()}`
                          )
                          .join(", ")
                        const hasTopFail = topFails.some(
                          ({ parameter }) =>
                            parameter !== "N/A" && parameter !== "—"
                        )

                        return (
                          <TableRow
                            key={`${group.key}-${row.waferId}-${row.condition}-${index}`}
                            className={cn(index === 0 && "border-t first:border-t-0")}
                          >
                            {index === 0 && (
                              <TableCell
                                rowSpan={group.rows.length}
                                className="whitespace-normal align-middle"
                              >
                                <span className="font-medium">
                                  {row.stage}
                                </span>
                                <span className="block text-xs text-muted-foreground">
                                  {row.step} · {row.stepSequence ?? row.seq}
                                </span>
                              </TableCell>
                            )}
                            <TableCell>
                              <ReportWaferIdentity role={roleLabel}>
                                <ReportSplitTableWaferLink row={row} onWaferSelect={onWaferSelect} />
                              </ReportWaferIdentity>
                            </TableCell>
                            <TableCell className="whitespace-normal">
                              {row.recipe}
                            </TableCell>
                            <TableCell className="whitespace-normal">
                              {row.condition}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "font-mono",
                                getYieldTextClass(
                                  row.tone ?? getRowTone(row.yield)
                                )
                              )}
                            >
                              {formatSplitTableYield(row.yield)}
                            </TableCell>
                            <TableCell className="whitespace-normal">
                              {onTopFailSelect && hasTopFail ? (
                                <button
                                  type="button"
                                  aria-label={`查看 ${row.waferId} 的 ${topFailText}`}
                                  className="text-left font-mono text-xs font-medium text-sky-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                  onClick={() => onTopFailSelect(row)}
                                >
                                  {topFailText}
                                </button>
                              ) : (
                                <span className="font-mono text-xs font-medium text-sky-700">
                                  {topFailText}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  ))}
                </Table>
              </div>
            ))}
        </div>
      </section>
    </div>
  )
}
