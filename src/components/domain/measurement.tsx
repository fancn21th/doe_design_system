"use client"

import { measurementScenarios } from "@/components/domain/measurement.scenarios"
import {
  EmptyState,
  ReportBadge,
  ReportCard,
  formatCompactNumber,
  reportToneClass,
} from "@/components/domain/report-parts"
import { cn } from "@/lib/utils"
import {
  measurementInputSchema,
  type MeasurementGroup,
  type MeasurementInput,
} from "@/schemas/domain-component-inputs"

type MeasurementProps = {
  input?: MeasurementInput
  className?: string
}

export function Measurement({
  input = measurementScenarios.normal.input,
  className,
}: MeasurementProps) {
  const scenarioInput = measurementScenarios.normal.input
  const parsedInput = measurementInputSchema.parse(input)
  const title = parsedInput.title ?? scenarioInput.title ?? "Measurement"
  const subtitle =
    parsedInput.subtitle ??
    scenarioInput.subtitle ??
    "Shared grouped measurement distribution placeholder"
  const sourceLabel = parsedInput.sourceLabel ?? scenarioInput.sourceLabel
  const groups = parsedInput.groups ?? scenarioInput.groups ?? []
  const referenceLines =
    parsedInput.referenceLines ?? scenarioInput.referenceLines ?? []
  const yAxisLabel =
    parsedInput.yAxisLabel ?? scenarioInput.yAxisLabel ?? "Measurement Value"

  return (
    <ReportCard
      title={title}
      subtitle={subtitle}
      sourceLabel={sourceLabel}
      className={className}
    >
      {groups.length === 0 ? (
        <EmptyState>暂无 Measurement 数据</EmptyState>
      ) : (
        <div className="p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <ReportBadge tone="neutral">POINT</ReportBadge>
            <ReportBadge tone="neutral">MEAN</ReportBadge>
            <ReportBadge tone="neutral">MEDIAN</ReportBadge>
            <ReportBadge tone="neutral">MEAN +/- 3SIGMA</ReportBadge>
            {referenceLines.map((line) => (
              <ReportBadge key={line.label} tone={line.tone}>
                {line.label} {formatCompactNumber(line.value)}
              </ReportBadge>
            ))}
          </div>
          <div className="overflow-auto rounded-lg border bg-background">
            <MeasurementChart
              groups={groups}
              yAxisLabel={yAxisLabel}
              referenceLines={referenceLines}
            />
          </div>
        </div>
      )}
    </ReportCard>
  )
}

function MeasurementChart({
  groups,
  yAxisLabel,
  referenceLines,
}: {
  groups: MeasurementGroup[]
  yAxisLabel: string
  referenceLines: NonNullable<MeasurementInput["referenceLines"]>
}) {
  const values = [
    ...groups.flatMap((group) => [
      ...group.values,
      group.mean,
      group.median,
      group.low,
      group.high,
    ]),
    ...referenceLines.map((line) => line.value),
  ]
  const min = Math.min(...values)
  const max = Math.max(...values)
  const padding = Math.max((max - min) * 0.1, 1)
  const low = min - padding
  const high = max + padding
  const width = Math.max(760, 96 + groups.length * 92)
  const height = 360
  const plot = { left: 78, right: 24, top: 22, bottom: 54 }
  const plotWidth = width - plot.left - plot.right
  const plotHeight = height - plot.top - plot.bottom
  const step = plotWidth / Math.max(groups.length, 1)
  const y = (value: number) =>
    plot.top + ((high - value) / Math.max(high - low, 1)) * plotHeight

  return (
    <svg
      className="block"
      style={{ width, minWidth: width, height }}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${yAxisLabel} grouped measurement distribution`}
    >
      {Array.from({ length: 6 }, (_, index) => {
        const value = low + ((high - low) * index) / 5
        const py = y(value)
        return (
          <g key={index}>
            <line
              x1={plot.left}
              y1={py}
              x2={width - plot.right}
              y2={py}
              stroke="currentColor"
              className="text-border"
            />
            <text
              x={plot.left - 10}
              y={py + 4}
              textAnchor="end"
              className="fill-muted-foreground text-[10px]"
            >
              {formatCompactNumber(value)}
            </text>
          </g>
        )
      })}
      <text
        x={18}
        y={plot.top + plotHeight / 2}
        transform={`rotate(-90 18 ${plot.top + plotHeight / 2})`}
        textAnchor="middle"
        className="fill-muted-foreground text-[11px] font-semibold"
      >
        {yAxisLabel}
      </text>
      {referenceLines.map((line) => (
        <g key={line.label}>
          <line
            x1={plot.left}
            y1={y(line.value)}
            x2={width - plot.right}
            y2={y(line.value)}
            stroke="#b25000"
            strokeDasharray="6 4"
            strokeWidth={1.5}
          />
          <text
            x={plot.left + 4}
            y={y(line.value) - 6}
            className="fill-amber-700 text-[10px] font-semibold"
          >
            {line.label} {formatCompactNumber(line.value)}
          </text>
        </g>
      ))}
      {groups.map((group, index) => {
        const cx = plot.left + step * index + step / 2
        const meanY = y(group.mean)
        const medianY = y(group.median)
        const lowY = y(group.low)
        const highY = y(group.high)

        return (
          <g key={group.id}>
            {group.values.map((value, pointIndex) => {
              const jitter = (((pointIndex * 37 + index * 17) % 101) / 100 - 0.5) *
                Math.min(42, step * 0.46)
              return (
                <circle
                  key={`${group.id}-${pointIndex}`}
                  cx={cx + jitter}
                  cy={y(value)}
                  r={2}
                  className="fill-sky-500 opacity-35"
                />
              )
            })}
            <line
              x1={cx}
              y1={highY}
              x2={cx}
              y2={lowY}
              stroke="#8e8e93"
              strokeWidth={1.4}
            />
            <line x1={cx - 7} y1={highY} x2={cx + 7} y2={highY} stroke="#8e8e93" />
            <line x1={cx - 7} y1={lowY} x2={cx + 7} y2={lowY} stroke="#8e8e93" />
            <line
              x1={cx - Math.min(22, step * 0.28)}
              y1={medianY}
              x2={cx + Math.min(22, step * 0.28)}
              y2={medianY}
              stroke="#111"
              strokeWidth={2}
            />
            <circle cx={cx} cy={meanY} r={5} className="fill-background" />
            <circle cx={cx} cy={meanY} r={3.2} className="fill-foreground" />
            <text
              x={cx}
              y={height - 30}
              textAnchor="middle"
              className="fill-foreground text-[10px] font-semibold"
            >
              {group.label}
            </text>
            {group.subtitle && (
              <text
                x={cx}
                y={height - 15}
                textAnchor="middle"
                className={cn("text-[9px]", reportToneClass(group.tone).includes("red") ? "fill-red-700" : "fill-muted-foreground")}
              >
                {group.subtitle}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
