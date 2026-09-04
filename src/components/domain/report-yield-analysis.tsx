"use client"

import { reportYieldAnalysisScenarios } from "@/components/domain/report-yield-analysis.scenarios"
import {
  EmptyState,
  ReportBadge,
  ReportCard,
  formatPercent,
  reportToneClass,
} from "@/components/domain/report-parts"
import { cn } from "@/lib/utils"
import {
  reportYieldAnalysisInputSchema,
  type ReportYieldAnalysisInput,
} from "@/schemas/domain-component-inputs"

type ReportYieldAnalysisProps = {
  input?: ReportYieldAnalysisInput
  className?: string
}

export function ReportYieldAnalysis({
  input = reportYieldAnalysisScenarios.normal.input,
  className,
}: ReportYieldAnalysisProps) {
  const scenarioInput = reportYieldAnalysisScenarios.normal.input
  const parsedInput = reportYieldAnalysisInputSchema.parse(input)
  const wafers = parsedInput.wafers ?? scenarioInput.wafers ?? []
  const details = parsedInput.detailItems ?? scenarioInput.detailItems ?? []

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
          <div className="flex flex-wrap gap-2">
            <ReportBadge tone="neutral">Stage: 全部</ReportBadge>
            <ReportBadge tone="neutral">Step: 全部</ReportBadge>
            <ReportBadge tone="good">&gt;= 99.5%</ReportBadge>
            <ReportBadge tone="watch">90%-99.5%</ReportBadge>
            <ReportBadge tone="bad">&lt; 90%</ReportBadge>
          </div>
          <section className="overflow-auto rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-semibold">Wafer Yield Ranking</h3>
            <div className="flex h-64 min-w-[42rem] items-end gap-3 border-b px-2">
              {wafers.map((wafer) => (
                <div
                  key={wafer.waferId}
                  className="flex h-full w-14 flex-col items-center justify-end gap-2"
                >
                  <span className="text-[10px] text-muted-foreground">
                    {formatPercent(wafer.yield)}
                  </span>
                  <div
                    className={cn("w-8 rounded-t-md border", reportToneClass(wafer.tone))}
                    style={{ height: `${Math.max(4, wafer.yield)}%` }}
                  />
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {wafer.waferId}
                  </span>
                </div>
              ))}
            </div>
          </section>
          <section className="grid gap-3 md:grid-cols-3">
            {details.map((item) => (
              <div key={item.label} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-2">
                  <b className="text-sm">{item.label}</b>
                  <ReportBadge tone={item.tone}>DETAIL</ReportBadge>
                </div>
                {item.detail && (
                  <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
                )}
              </div>
            ))}
          </section>
        </div>
      )}
    </ReportCard>
  )
}
