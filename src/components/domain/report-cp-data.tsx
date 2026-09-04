"use client"

import { Measurement } from "@/components/domain/measurement"
import { reportCpDataScenarios } from "@/components/domain/report-cp-data.scenarios"
import {
  EmptyState,
  ReportBadge,
  ReportCard,
} from "@/components/domain/report-parts"
import {
  reportCpDataInputSchema,
  type ReportCpDataInput,
} from "@/schemas/domain-component-inputs"

type ReportCpDataProps = {
  input?: ReportCpDataInput
  className?: string
}

export function ReportCpData({
  input = reportCpDataScenarios.normal.input,
  className,
}: ReportCpDataProps) {
  const scenarioInput = reportCpDataScenarios.normal.input
  const parsedInput = reportCpDataInputSchema.parse(input)
  const parameterOptions =
    parsedInput.parameterOptions ?? scenarioInput.parameterOptions ?? []
  const measurement = parsedInput.measurement ?? scenarioInput.measurement

  return (
    <ReportCard
      title={parsedInput.title ?? scenarioInput.title ?? "CP Data"}
      subtitle={parsedInput.subtitle ?? scenarioInput.subtitle}
      sourceLabel={parsedInput.sourceLabel ?? scenarioInput.sourceLabel}
      className={className}
    >
      {parameterOptions.length === 0 || !measurement ? (
        <EmptyState>暂无 CP Data 数据</EmptyState>
      ) : (
        <div className="grid gap-4 p-4">
          <div className="flex flex-wrap gap-2">
            <ReportBadge tone="neutral">
              CP Parameter: {parsedInput.selectedParameterId ?? parameterOptions[0]}
            </ReportBadge>
            <ReportBadge tone="neutral">uses shared Measurement</ReportBadge>
          </div>
          <Measurement input={measurement} />
        </div>
      )}
    </ReportCard>
  )
}
