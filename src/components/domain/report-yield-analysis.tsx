"use client"

import * as Plot from "@observablehq/plot"
import {
  GitCompareArrowsIcon,
  Table2Icon,
  TrendingDownIcon,
} from "lucide-react"
import * as React from "react"

import { reportYieldAnalysisScenarios } from "@/components/domain/report-yield-analysis.scenarios"
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  reportYieldAnalysisInputSchema,
  type ReportTone,
  type ReportYieldAnalysisInput,
  type ReportYieldConditionRow,
  type ReportYieldDetailMode,
  type ReportYieldLossRow,
  type ReportYieldMatrixRow,
  type ReportYieldThresholds,
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
const DEFAULT_THRESHOLDS: ReportYieldThresholds = { good: 99.5, watch: 90 }
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

function getYieldTone(
  yieldValue: number,
  thresholds: ReportYieldThresholds
): ReportTone {
  if (yieldValue < thresholds.watch) return "bad"
  if (yieldValue < thresholds.good) return "watch"
  return "good"
}

function getYieldColor(yieldValue: number, thresholds: ReportYieldThresholds) {
  const tone = getYieldTone(yieldValue, thresholds)
  if (tone === "bad") return "#dc2626"
  if (tone === "watch") return "#d97706"
  return "#059669"
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

function WaferYieldRanking({
  wafers,
  thresholds,
  onWaferSelect,
}: {
  wafers: ReportYieldWafer[]
  thresholds: ReportYieldThresholds
  onWaferSelect?: (waferId: string) => void
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const sortedWafers = React.useMemo(
    () => [...wafers].sort((a, b) => a.yield - b.yield),
    [wafers]
  )

  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.textContent = ""

    const chart = Plot.plot({
      width: Math.max(900, sortedWafers.length * 42 + 96),
      height: 320,
      marginTop: 28,
      marginRight: 24,
      marginBottom: 54,
      marginLeft: 58,
      x: {
        domain: sortedWafers.map((wafer) => wafer.waferId),
        label: null,
        tickSize: 0,
      },
      y: {
        label: "Yield (%)",
        domain: [0, 100],
        grid: true,
        ticks: [0, 25, 50, 75, 100],
        tickFormat: (value) => `${value}%`,
      },
      marks: [
        Plot.ruleY([thresholds.watch], {
          stroke: "#d97706",
          strokeDasharray: "4 4",
          strokeOpacity: 0.8,
        }),
        Plot.ruleY([thresholds.good], {
          stroke: "#059669",
          strokeDasharray: "4 4",
          strokeOpacity: 0.8,
        }),
        Plot.barY(sortedWafers, {
          x: "waferId",
          y: "yield",
          fill: (wafer) => getYieldColor(wafer.yield, thresholds),
          insetLeft: 5,
          insetRight: 5,
          title: (wafer) =>
            `${wafer.waferId} ${formatPercent(wafer.yield)}${
              wafer.condition ? ` · ${wafer.condition}` : ""
            }`,
        }),
        Plot.text(sortedWafers, {
          x: "waferId",
          y: "yield",
          text: (wafer) => formatPercent(wafer.yield),
          dy: -7,
          fontSize: 10,
          fill: "#334155",
        }),
      ],
      style: {
        background: "transparent",
        fontFamily: "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
        fontSize: "12px",
      },
    })

    chart.setAttribute("role", "img")
    chart.setAttribute(
      "aria-label",
      "Wafer yield ranking bar chart sorted from low yield to high yield."
    )
    container.append(chart)

    return () => chart.remove()
  }, [sortedWafers, thresholds])

  return (
    <section className="rounded-lg border">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <div>
          <h3 className="text-sm font-semibold">Wafer Yield Ranking</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Sorted by yield, lowest wafer first.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ReportBadge tone="good">&gt;= {thresholds.good}%</ReportBadge>
          <ReportBadge tone="watch">
            {thresholds.watch}%-{thresholds.good}%
          </ReportBadge>
          <ReportBadge tone="bad">&lt; {thresholds.watch}%</ReportBadge>
        </div>
      </div>
      <div className="overflow-x-auto p-3">
        <div ref={containerRef} className="min-h-80" />
      </div>
      {onWaferSelect && (
        <div className="grid grid-cols-5 border-t sm:grid-cols-8 md:grid-cols-12 xl:grid-cols-25">
          {sortedWafers.map((wafer) => (
            <button
              key={wafer.waferId}
              type="button"
              className="border-r border-b px-2 py-1.5 text-center font-mono text-xs text-sky-700 transition-colors hover:bg-muted/50"
              onClick={() => onWaferSelect(wafer.waferId)}
            >
              {wafer.waferId}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

function MatrixTable({
  rows,
  matrixColumns,
  thresholds,
}: {
  rows: ReportYieldMatrixRow[]
  matrixColumns: string[]
  thresholds: ReportYieldThresholds
}) {
  if (rows.length === 0) {
    return <EmptyState>暂无 Wafer x CP Matrix 数据</EmptyState>
  }

  return (
    <div className="overflow-auto rounded-lg border">
      <Table className="min-w-[180rem]">
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
                <ReportBadge tone={row.tone ?? getYieldTone(row.yield, thresholds)}>
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
    <div className="overflow-auto rounded-lg border">
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
    <div className="overflow-auto rounded-lg border">
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
  onWaferSelect,
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
  const thresholds =
    parsedInput.thresholds ?? scenarioInput.thresholds ?? DEFAULT_THRESHOLDS
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
    <ReportCard
      title={parsedInput.title ?? scenarioInput.title ?? "Yield Analysis"}
      subtitle={parsedInput.subtitle ?? scenarioInput.subtitle}
      sourceLabel={parsedInput.sourceLabel ?? scenarioInput.sourceLabel}
      className={className}
    >
      {wafers.length === 0 ? (
        <EmptyState>暂无 Yield Analysis 数据</EmptyState>
      ) : (
        <div className="grid gap-4 p-4">
          <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-3 md:flex-row">
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

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <ReportBadge tone="neutral">
              Stage: {selectedStageOptions.length || "全部"}
            </ReportBadge>
            <ReportBadge tone="neutral">
              Step: {selectedStepOptions.length || "全部"}
            </ReportBadge>
            <span>
              Rendering {wafers.length} wafer rows from injected business data
            </span>
          </div>

          <WaferYieldRanking
            wafers={wafers}
            thresholds={thresholds}
            onWaferSelect={onWaferSelect}
          />

          <section className="grid gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">Yield Detail Analysis</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Detail tables switch local presentation mode only.
                </p>
              </div>
            </div>
            <Tabs
              value={selectedDetailMode}
              onValueChange={handleDetailModeChange}
              className="gap-3"
            >
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
              <TabsContent value="wafer-cp-matrix">
                <MatrixTable
                  rows={matrixRows}
                  matrixColumns={matrixColumns}
                  thresholds={thresholds}
                />
              </TabsContent>
              <TabsContent value="loss-yield">
                <LossYieldTable rows={lossYieldRows} />
              </TabsContent>
              <TabsContent value="condition-yield-comparison">
                <ConditionYieldTable rows={conditionYieldRows} />
              </TabsContent>
            </Tabs>
          </section>
        </div>
      )}
    </ReportCard>
  )
}
