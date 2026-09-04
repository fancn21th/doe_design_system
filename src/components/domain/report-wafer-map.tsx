"use client"

import { WaferMap } from "@/components/domain/wafer-map"
import { reportWaferMapScenarios } from "@/components/domain/report-wafer-map.scenarios"
import {
  EmptyState,
  ReportBadge,
  ReportCard,
  reportToneClass,
} from "@/components/domain/report-parts"
import { cn } from "@/lib/utils"
import {
  reportWaferMapInputSchema,
  type ReportWaferMapInput,
} from "@/schemas/domain-component-inputs"

type ReportWaferMapProps = {
  input?: ReportWaferMapInput
  className?: string
}

export function ReportWaferMap({
  input = reportWaferMapScenarios.normal.input,
  className,
}: ReportWaferMapProps) {
  const scenarioInput = reportWaferMapScenarios.normal.input
  const parsedInput = reportWaferMapInputSchema.parse(input)
  const wafers = parsedInput.wafers ?? scenarioInput.wafers ?? []

  return (
    <ReportCard
      title={parsedInput.title ?? scenarioInput.title ?? "Wafer Map"}
      subtitle={parsedInput.subtitle ?? scenarioInput.subtitle}
      sourceLabel={parsedInput.sourceLabel ?? scenarioInput.sourceLabel}
      className={className}
    >
      {wafers.length === 0 ? (
        <EmptyState>暂无 Report Wafer Map 数据</EmptyState>
      ) : (
        <div className="grid gap-4 p-4">
          <div className="flex flex-wrap gap-2">
            <ReportBadge tone="neutral">{parsedInput.mode ?? "CP Map"}</ReportBadge>
            <ReportBadge tone="neutral">{parsedInput.layer ?? "Final Bin"}</ReportBadge>
            <ReportBadge tone="neutral">uses shared WaferMap</ReportBadge>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {wafers.map((wafer) => (
              <article key={wafer.waferId} className="rounded-lg border bg-background p-3">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <b className="font-mono text-sm">{wafer.waferId}</b>
                    {wafer.role && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {wafer.role}
                      </span>
                    )}
                  </div>
                  <ReportBadge tone={wafer.tone}>{wafer.fail} Fail</ReportBadge>
                </div>
                <div className="flex aspect-square items-center justify-center rounded-md border bg-muted/20 p-2">
                  <WaferMap data={wafer.map} width={180} height={180} />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  {[
                    ["Pass", wafer.pass, "good"],
                    ["Fail", wafer.fail, wafer.tone],
                    ["Defect", wafer.defect, "watch"],
                  ].map(([label, value, tone]) => (
                    <div
                      key={label}
                      className={cn("rounded-md border p-2", reportToneClass(tone as never))}
                    >
                      <b className="block font-mono">{Number(value).toLocaleString()}</b>
                      <span className="text-muted-foreground">{label}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </ReportCard>
  )
}
