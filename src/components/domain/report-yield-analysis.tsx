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
import { Button } from "@/components/ui/button"
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
  onWaferSelect?: (waferId: string) => void
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

function formatOptionalPercent(value: number | null) {
  return value === null ? "Unavailable" : formatPercent(value)
}

function formatOptionalCount(value: number | null) {
  return value === null ? "Unavailable" : formatCount(value)
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

export function groupMatrixRows(rows: ReportYieldMatrixRow[], sortByYield: boolean) {
  const groups = new Map<string, ReportYieldMatrixRow[]>()
  for (const row of rows) {
    const members = groups.get(row.groupId) ?? []
    members.push(row)
    groups.set(row.groupId, members)
  }
  return Array.from(groups, ([groupId, members]) => ({
    groupId,
    rows: sortByYield ? [...members].sort((a, b) => {
      if (a.yield === null) return b.yield === null ? 0 : 1
      if (b.yield === null) return -1
      return a.yield - b.yield
    }) : members,
  }))
}

function MatrixTable({ rows, matrixColumns, onWaferSelect, focusedWaferId }: {
  rows: ReportYieldMatrixRow[]
  matrixColumns: string[]
  onWaferSelect?: (waferId: string) => void
  focusedWaferId?: string
}) {
  const [sortByYield, setSortByYield] = React.useState(false)
  const regionRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (!focusedWaferId) return
    const target = Array.from(regionRef.current?.querySelectorAll<HTMLElement>("[data-wafer-id]") ?? []).find((element) => element.dataset.waferId === focusedWaferId)
    target?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [focusedWaferId, rows])
  if (rows.length === 0) return <EmptyState>暂无 Wafer x CP Matrix 数据</EmptyState>
  return (
    <div className="grid min-w-0 gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">按比较组展示 · — 表示已确认零失败，缺少数据单独标注</span>
        <Button size="sm" variant="outline" aria-pressed={sortByYield} onClick={() => setSortByYield((value) => !value)}>
          {sortByYield ? "恢复组内顺序" : "组内按 Yield 排序"}
        </Button>
      </div>
      <div ref={regionRef} role="region" aria-label="Wafer × CP Matrix" tabIndex={0} className="min-w-0 max-w-full max-h-(--doe-yield-matrix-height) overflow-auto rounded-(--doe-radius-control) border">
        <Table className="domain-ui-report-table min-w-(--doe-yield-matrix-min-width) border-separate border-spacing-0">
          <TableHeader className="sticky top-0 z-20 bg-background">
            <TableRow>
              <TableHead className="w-52 bg-muted">Stage / Step / Seq</TableHead>
              <TableHead className="w-24 bg-muted">Wafer ID</TableHead>
              <TableHead className="w-40 bg-muted">Condition</TableHead>
              <TableHead className="w-24 bg-muted">Yield</TableHead>
              <TableHead className="w-28 bg-muted">Δ vs BSL</TableHead>
              <TableHead className="w-36 bg-muted">Good / Tested Dies</TableHead>
              {matrixColumns.map((column) => <TableHead key={column} className="w-24 bg-muted text-right">{column}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupMatrixRows(rows, sortByYield).map((group) => group.rows.map((row, index) => (
              <TableRow key={row.rowId} data-wafer-id={row.waferId} className={focusedWaferId === row.waferId ? "bg-muted" : undefined}>
                {index === 0 && <TableCell rowSpan={group.rows.length} className="border-t align-middle">
                  <span className="font-medium">{row.stage}</span>
                  <span className="block text-xs text-muted-foreground">{row.step} · {row.seq}</span>
                </TableCell>}
                <TableCell className={index === 0 ? "border-t" : undefined}>
                  {onWaferSelect ? <button type="button" className="font-mono text-sky-700 underline-offset-2 hover:underline" onClick={() => onWaferSelect(row.waferId)}>{row.waferId}</button> : <b className="font-mono text-sky-700">{row.waferId}</b>}
                  {row.role && <span className="ml-2 text-xs text-muted-foreground">{row.role}</span>}
                </TableCell>
                <TableCell className="font-mono">{row.condition}</TableCell>
                <TableCell><ReportBadge tone={row.tone ?? "neutral"}>{formatOptionalPercent(row.yield)}</ReportBadge></TableCell>
                <TableCell className="font-mono" title={row.baselineWaferId ? `Baseline: ${row.baselineWaferId}` : undefined}>
                  {row.deltaPp === null ? (row.role?.toUpperCase() === "BASELINE" || row.baselineWaferId === row.waferId ? "—" : row.baselineWaferId ? "缺少有效 Yield" : "缺少比较对象") : `${row.deltaPp > 0 ? "+" : ""}${row.deltaPp.toFixed(2)} pp`}
                </TableCell>
                <TableCell className="font-mono">{row.goodDies === null || row.goodDies === undefined ? "—" : formatCount(row.goodDies)} / {formatOptionalCount(row.testedDies)}</TableCell>
                {matrixColumns.map((column) => {
                  const count = row.failCounts[column]
                  const rate = row.failRates[column]
                  return <TableCell key={column} className="text-right font-mono" title={count === undefined || count === null ? undefined : `${formatCount(count)} failed dies`}>
                    {rate === undefined || rate === null ? "缺少数据" : rate === 0 ? "—" : formatPercent(rate)}
                  </TableCell>
                })}
              </TableRow>
            )))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function LossYieldTable({ rows }: { rows: ReportYieldLossRow[] }) {
  if (rows.length === 0) return <EmptyState>暂无 Loss Yield 数据</EmptyState>

  return (
    <div className="min-w-0 max-w-full overflow-x-auto overflow-y-hidden rounded-(--doe-radius-control) border">
      <Table className="domain-ui-report-table min-w-[48rem]">
        <TableHeader className="bg-muted/60">
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>Failed CP Parameters</TableHead>
            <TableHead className="text-right">Failed Die Count</TableHead>
            <TableHead className="text-right">Pareto</TableHead>
            <TableHead className="text-right">Yield Loss</TableHead>
            <TableHead className="text-right">Cumulative Yield Loss</TableHead>
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

function ConditionYieldTable({ rows, onWaferSelect }: {
  rows: ReportYieldConditionRow[]
  onWaferSelect?: (waferId: string) => void
}) {
  if (rows.length === 0) {
    return <EmptyState>暂无 Condition Yield Comparison 数据</EmptyState>
  }

  return (
    <div className="min-w-0 max-w-full overflow-x-auto overflow-y-hidden rounded-(--doe-radius-control) border">
      <Table className="domain-ui-report-table min-w-[78rem]">
        <TableHeader className="bg-muted/60">
          <TableRow>
            <TableHead className="w-52">Stage / Step / Seq</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead className="w-40">Wafers</TableHead>
            <TableHead className="text-right">Weighted Yield</TableHead>
            <TableHead className="text-right">Median Yield</TableHead>
            <TableHead className="text-right">Average Yield</TableHead>
            <TableHead className="text-right">Min / Max Yield</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.rowId}>
              <TableCell>
                <span className="font-medium">{row.stage}</span>
                <span className="block text-xs text-muted-foreground">
                  {row.step} · {row.seq}
                </span>
              </TableCell>
              <TableCell className="font-mono">{row.condition}</TableCell>
              <TableCell className="font-mono">{row.waferIds.map((waferId, index) => <React.Fragment key={waferId}>{index > 0 && " / "}{onWaferSelect ? <button type="button" className="text-sky-700 underline-offset-2 hover:underline" onClick={() => onWaferSelect(waferId)}>{waferId}</button> : waferId}</React.Fragment>)}</TableCell>
              <TableCell className="text-right">
                <ReportBadge tone={row.tone}>
                  {formatOptionalPercent(row.weightedYield)}
                </ReportBadge>
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatOptionalPercent(row.medianYield)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatOptionalPercent(row.averageYield)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatOptionalPercent(row.minYield)} / {formatOptionalPercent(row.maxYield)}
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
  onWaferSelect,
}: ReportYieldAnalysisProps) {
  const parsedInput = reportYieldAnalysisInputSchema.parse(input)
  const wafers = parsedInput.wafers ?? EMPTY_WAFERS
  const matrixRows = parsedInput.matrixRows ?? EMPTY_MATRIX_ROWS
  const lossYieldRows = parsedInput.lossYieldRows ?? EMPTY_LOSS_ROWS
  const conditionYieldRows = parsedInput.conditionYieldRows ?? EMPTY_CONDITION_ROWS
  const yieldCpFailAnalysis = parsedInput.yieldCpFailAnalysis
  const detailModeOptions =
    parsedInput.detailModeOptions ?? DEFAULT_DETAIL_MODE_OPTIONS
  const matrixColumns = parsedInput.matrixColumns ?? []
  const [localDetailMode, setLocalDetailMode] =
    React.useState<ReportYieldDetailMode>(
      parsedInput.selectedDetailMode ??
        "wafer-cp-matrix"
    )
  const selectedDetailMode =
    onDetailModeChange && parsedInput.selectedDetailMode
      ? parsedInput.selectedDetailMode
      : localDetailMode
  const stageOptions = toOptions(
    parsedInput.stageOptions ??
      wafers.map((wafer) => wafer.stage ?? "")
  )
  const stepOptions = toOptions(
    parsedInput.stepOptions ??
      wafers.map((wafer) => wafer.step ?? "")
  )
  const [selectedStageOptions, setSelectedStageOptions] =
    useDisplayFilterValues(
      parsedInput.selectedStages,
      stageOptions,
      onStageFilterChange
    )
  const [selectedStepOptions, setSelectedStepOptions] = useDisplayFilterValues(
    parsedInput.selectedSteps,
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
      {wafers.length === 0 &&
      matrixRows.length === 0 &&
      conditionYieldRows.length === 0 &&
      stageOptions.length === 0 &&
      stepOptions.length === 0 ? (
        <EmptyState>暂无 Yield Analysis 数据</EmptyState>
      ) : (
        <div className="domain-ui-typography grid gap-4 p-4">
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

          {yieldCpFailAnalysis && (
            <WaferYieldCpFailAnalysis input={yieldCpFailAnalysis} />
          )}

          <section
            className="grid min-w-0 max-w-full gap-3"
            aria-labelledby="yield-detail-analysis-title"
          >
            <Tabs
              value={selectedDetailMode}
              onValueChange={handleDetailModeChange}
              className="min-w-0 max-w-full gap-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2
                  id="yield-detail-analysis-title"
                  className="text-sm font-semibold"
                >
                  Yield Detail Analysis
                </h2>
                <TabsList className="h-auto flex-wrap">
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
              </div>
              <TabsContent value="wafer-cp-matrix" className="min-w-0 max-w-full">
                <MatrixTable rows={matrixRows} matrixColumns={matrixColumns} onWaferSelect={onWaferSelect} focusedWaferId={parsedInput.focusedWaferId} />
              </TabsContent>
              <TabsContent value="loss-yield" className="min-w-0 max-w-full">
                <LossYieldTable rows={lossYieldRows} />
              </TabsContent>
              <TabsContent value="condition-yield-comparison" className="min-w-0 max-w-full">
                <ConditionYieldTable rows={conditionYieldRows} onWaferSelect={onWaferSelect} />
              </TabsContent>
            </Tabs>
          </section>
        </div>
      )}
    </div>
  )
}
