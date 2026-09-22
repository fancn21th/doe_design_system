"use client"

import {
  GitCompareArrowsIcon,
  Table2Icon,
  TrendingDownIcon,
} from "lucide-react"
import * as React from "react"

import { reportYieldAnalysisScenarios } from "@/components/domain/report-yield-analysis.scenarios"
import { WaferYieldCpFailAnalysis } from "@/components/domain/report-wafer-yield-cp-fail-analysis"
import {
  EmptyState,
  ReportBadge,
  formatPercent,
} from "@/components/domain/report-parts"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  reportYieldAnalysisInputSchema,
  type ReportYieldAnalysisInput,
  type ReportYieldConditionRow,
  type ReportYieldDetailMode,
  type ReportYieldLossRow,
  type ReportYieldMatrixRow,
  type ReportYieldWafer,
} from "@/schemas/domain-component-inputs"

type ReportYieldAnalysisProps = {
  input?: ReportYieldAnalysisInput
  className?: string
  onStageFilterChange?: (stages: string[]) => void
  onStepFilterChange?: (steps: string[]) => void
  onDetailModeChange?: (mode: ReportYieldDetailMode) => void
}

type ComboboxOption = {
  label: string
  value: string
}

const EMPTY_WAFERS: ReportYieldWafer[] = []
const EMPTY_MATRIX_ROWS: ReportYieldMatrixRow[] = []
const EMPTY_LOSS_ROWS: ReportYieldLossRow[] = []
const EMPTY_CONDITION_ROWS: ReportYieldConditionRow[] = []
const DEFAULT_DETAIL_MODE_OPTIONS = [
  { id: "wafer-cp-matrix", label: "Wafer x CP Matrix" },
  { id: "loss-yield", label: "Loss Yield" },
  { id: "condition-yield-comparison", label: "Condition Yield Comparison" },
] satisfies ReportYieldAnalysisInput["detailModeOptions"]

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

function formatCount(value: number) {
  return value.toLocaleString()
}

function useDisplayFilterValues(
  values: string[] | undefined,
  options: ComboboxOption[],
  onChange?: (values: string[]) => void
) {
  const [localValues, setLocalValues] = React.useState(values ?? [])
  const selectedOptions = findSelectedOptions(
    options,
    onChange ? values ?? [] : localValues
  )

  const setSelectedOptions = React.useCallback(
    (nextOptions: ComboboxOption[]) => {
      const nextValues = valuesFromOptions(nextOptions)
      if (!onChange) setLocalValues(nextValues)
      onChange?.(nextValues)
    },
    [onChange]
  )

  return [selectedOptions, setSelectedOptions] as const
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
                    <ComboboxChip key={item.value} aria-label={item.label}>
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

function MatrixTable({
  rows,
  matrixColumns,
}: {
  rows: ReportYieldMatrixRow[]
  matrixColumns: string[]
}) {
  if (rows.length === 0) {
    return <EmptyState>暂无 Wafer x CP Matrix 数据</EmptyState>
  }

  return (
    <div className="min-w-0 max-w-full overflow-x-auto overflow-y-hidden rounded-lg border">
      <Table className="min-w-(--doe-yield-matrix-min-width)">
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 z-10 w-24 bg-muted/80">
              Wafer ID
            </TableHead>
            <TableHead className="w-52 bg-muted/30">Stage / Step / Seq</TableHead>
            <TableHead className="w-40 bg-muted/30">Condition</TableHead>
            <TableHead className="w-24 bg-muted/30">Yield</TableHead>
            <TableHead className="w-36 bg-muted/30">Pass / Tested Dies</TableHead>
            {matrixColumns.map((column) => (
              <TableHead key={column} className="w-24 text-right">
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.waferId}>
              <TableCell className="sticky left-0 z-10 bg-background">
                <b className="font-mono text-sky-700">{row.waferId}</b>
                {row.role && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {row.role}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <span className="font-medium">{row.stage}</span>
                <span className="block text-xs text-muted-foreground">
                  {row.step} · {row.seq}
                </span>
              </TableCell>
              <TableCell className="font-mono text-xs">{row.condition}</TableCell>
              <TableCell>
                <ReportBadge tone={row.tone ?? "neutral"}>
                  {formatPercent(row.yield)}
                </ReportBadge>
              </TableCell>
              <TableCell className="font-mono text-xs">
                {formatCount(row.passDies)} / {formatCount(row.testedDies)}
              </TableCell>
              {matrixColumns.map((column) => {
                const value = row.failCounts[column] ?? 0

                return (
                  <TableCell
                    key={column}
                    className="text-right font-mono text-xs"
                  >
                    {value > 0 ? formatCount(value) : "-"}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function LossYieldTable({ rows }: { rows: ReportYieldLossRow[] }) {
  if (rows.length === 0) return <EmptyState>暂无 Loss Yield 数据</EmptyState>

  return (
    <div className="min-w-0 max-w-full overflow-x-auto overflow-y-hidden rounded-lg border">
      <Table className="min-w-[48rem]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>Parameter</TableHead>
            <TableHead className="text-right">Fail Die Count</TableHead>
            <TableHead className="text-right">Pareto</TableHead>
            <TableHead className="text-right">Yield Loss</TableHead>
            <TableHead className="text-right">Cumulative Loss</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.parameter}>
              <TableCell className="font-mono">{row.rank}</TableCell>
              <TableCell>
                <ReportBadge tone={row.tone}>{row.parameter}</ReportBadge>
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatCount(row.failedDieCount)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatPercent(row.pareto)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatPercent(row.yieldLoss)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatPercent(row.cumulativeYieldLoss)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function ConditionYieldTable({
  rows,
}: {
  rows: ReportYieldConditionRow[]
}) {
  if (rows.length === 0) {
    return <EmptyState>暂无 Condition Yield Comparison 数据</EmptyState>
  }

  return (
    <div className="min-w-0 max-w-full overflow-x-auto overflow-y-hidden rounded-lg border">
      <Table className="min-w-[78rem]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-40">Wafers</TableHead>
            <TableHead className="w-52">Stage / Step / Seq</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead className="text-right">Weighted Yield</TableHead>
            <TableHead className="text-right">Median Yield</TableHead>
            <TableHead className="text-right">Average Yield</TableHead>
            <TableHead className="text-right">Min / Max Yield</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={`${row.stage}-${row.step}-${row.condition}`}>
              <TableCell className="font-mono text-xs">
                {row.waferIds.join(" / ")}
              </TableCell>
              <TableCell>
                <span className="font-medium">{row.stage}</span>
                <span className="block text-xs text-muted-foreground">
                  {row.step} · {row.seq}
                </span>
              </TableCell>
              <TableCell className="font-mono text-xs">{row.condition}</TableCell>
              <TableCell className="text-right">
                <ReportBadge tone={row.tone}>
                  {formatPercent(row.weightedYield)}
                </ReportBadge>
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatPercent(row.medianYield)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatPercent(row.averageYield)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatPercent(row.minYield)} / {formatPercent(row.maxYield)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function ReportYieldAnalysis({
  input = reportYieldAnalysisScenarios.normal.input,
  className,
  onStageFilterChange,
  onStepFilterChange,
  onDetailModeChange,
}: ReportYieldAnalysisProps) {
  const scenarioInput = reportYieldAnalysisScenarios.normal.input
  const parsedInput = reportYieldAnalysisInputSchema.parse(input)
  const wafers = parsedInput.wafers ?? scenarioInput.wafers ?? EMPTY_WAFERS
  const matrixRows =
    parsedInput.matrixRows ?? scenarioInput.matrixRows ?? EMPTY_MATRIX_ROWS
  const lossYieldRows =
    parsedInput.lossYieldRows ??
    scenarioInput.lossYieldRows ??
    EMPTY_LOSS_ROWS
  const conditionYieldRows =
    parsedInput.conditionYieldRows ??
    scenarioInput.conditionYieldRows ??
    EMPTY_CONDITION_ROWS
  const yieldCpFailAnalysis = parsedInput.yieldCpFailAnalysis
  const detailModeOptions =
    parsedInput.detailModeOptions ??
    scenarioInput.detailModeOptions ??
    DEFAULT_DETAIL_MODE_OPTIONS
  const matrixColumns =
    parsedInput.matrixColumns ?? scenarioInput.matrixColumns ?? []
  const [localDetailMode, setLocalDetailMode] =
    React.useState<ReportYieldDetailMode>(
      parsedInput.selectedDetailMode ??
        scenarioInput.selectedDetailMode ??
        "wafer-cp-matrix"
    )
  const selectedDetailMode =
    onDetailModeChange && parsedInput.selectedDetailMode
      ? parsedInput.selectedDetailMode
      : localDetailMode
  const stageOptions = toOptions(
    parsedInput.stageOptions ??
      scenarioInput.stageOptions ??
      wafers.map((wafer) => wafer.stage ?? "")
  )
  const stepOptions = toOptions(
    parsedInput.stepOptions ??
      scenarioInput.stepOptions ??
      wafers.map((wafer) => wafer.step ?? "")
  )
  const [selectedStageOptions, setSelectedStageOptions] =
    useDisplayFilterValues(
      parsedInput.selectedStages ?? scenarioInput.selectedStages,
      stageOptions,
      onStageFilterChange
    )
  const [selectedStepOptions, setSelectedStepOptions] = useDisplayFilterValues(
    parsedInput.selectedSteps ?? scenarioInput.selectedSteps,
    stepOptions,
    onStepFilterChange
  )

  function handleDetailModeChange(value: string) {
    const nextMode = value as ReportYieldDetailMode
    if (!onDetailModeChange) setLocalDetailMode(nextMode)
    onDetailModeChange?.(nextMode)
  }

  return (
    <div className={className}>
      {wafers.length === 0 ? (
        <EmptyState>暂无 Yield Analysis 数据</EmptyState>
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

          {yieldCpFailAnalysis && (
            <WaferYieldCpFailAnalysis input={yieldCpFailAnalysis} />
          )}

          <Card size="sm" className="min-w-0 border ring-0 shadow-none">
            <Tabs
              value={selectedDetailMode}
              onValueChange={handleDetailModeChange}
              className="min-w-0 max-w-full gap-0"
            >
              <CardHeader className="flex flex-wrap items-center justify-between gap-3 border-b">
                <CardTitle>Yield Detail Analysis</CardTitle>
                <CardAction>
                  <TabsList className="flex-wrap">
                    {detailModeOptions.map((option) => (
                      <TabsTrigger key={option.id} value={option.id}>
                        {option.id === "wafer-cp-matrix" && <Table2Icon />}
                        {option.id === "loss-yield" && <TrendingDownIcon />}
                        {option.id === "condition-yield-comparison" && (
                          <GitCompareArrowsIcon />
                        )}
                        {option.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </CardAction>
              </CardHeader>
              <CardContent className="min-w-0 max-w-full">
                <TabsContent value="wafer-cp-matrix" className="min-w-0 max-w-full">
                  <MatrixTable
                    rows={matrixRows}
                    matrixColumns={matrixColumns}
                  />
                </TabsContent>
                <TabsContent value="loss-yield" className="min-w-0 max-w-full">
                  <LossYieldTable rows={lossYieldRows} />
                </TabsContent>
                <TabsContent value="condition-yield-comparison" className="min-w-0 max-w-full">
                  <ConditionYieldTable rows={conditionYieldRows} />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      )}
    </div>
  )
}
