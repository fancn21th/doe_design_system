"use client"

import { Measurement } from "@/components/domain/measurement"
import { reportInlineDataScenarios } from "@/components/domain/report-inline-data.scenarios"
import {
  EmptyState,
  ReportBadge,
  ReportCard,
} from "@/components/domain/report-parts"
import {
  reportInlineDataInputSchema,
  type ReportInlineDataInput,
} from "@/schemas/domain-component-inputs"

type ReportInlineDataProps = {
  input?: ReportInlineDataInput
  className?: string
}

export function ReportInlineData({
  input = reportInlineDataScenarios.normal.input,
  className,
}: ReportInlineDataProps) {
  const scenarioInput = reportInlineDataScenarios.normal.input
  const parsedInput = reportInlineDataInputSchema.parse(input)
  const parameters = parsedInput.parameterOptions ?? scenarioInput.parameterOptions ?? []
  const measurement = parsedInput.measurement ?? scenarioInput.measurement

  return (
    <ReportCard
      title={parsedInput.title ?? scenarioInput.title ?? "Inline Data"}
      subtitle={parsedInput.subtitle ?? scenarioInput.subtitle}
      sourceLabel={parsedInput.sourceLabel ?? scenarioInput.sourceLabel}
      className={className}
    >
      {parameters.length === 0 || !measurement ? (
        <EmptyState>暂无 Inline Data 数据</EmptyState>
      ) : (
        <div className="grid gap-4 p-4 xl:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="rounded-lg border p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <b className="text-sm">SPC_inline parameter</b>
              <ReportBadge tone="neutral">{parameters.length}</ReportBadge>
            </div>
            <div className="grid gap-2">
              {parameters.map((parameter) => (
                <div
                  key={parameter}
                  className="rounded-md border bg-background p-2 font-mono text-[11px]"
                  data-selected={parameter === parsedInput.selectedParameterId}
                >
                  {parameter}
                </div>
              ))}
            </div>
          </aside>
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap gap-2">
              <ReportBadge tone="neutral">
                Inline Parameter: {parsedInput.selectedParameterId ?? parameters[0]}
              </ReportBadge>
              <ReportBadge tone="neutral">uses shared Measurement</ReportBadge>
            </div>
            <Measurement input={measurement} />
          </div>
        </div>
      )}
    </ReportCard>
  )
}
