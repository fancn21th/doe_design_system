"use client"

import { reportOverviewScenarios } from "@/components/domain/report-overview.scenarios"
import {
  EmptyState,
  MetricGrid,
  ReportBadge,
  ReportCard,
} from "@/components/domain/report-parts"
import {
  reportOverviewInputSchema,
  type ReportListItem,
  type ReportOverviewInput,
} from "@/schemas/domain-component-inputs"

type ReportOverviewProps = {
  input?: ReportOverviewInput
  className?: string
}

export function ReportOverview({
  input = reportOverviewScenarios.normal.input,
  className,
}: ReportOverviewProps) {
  const scenarioInput = reportOverviewScenarios.normal.input
  const parsedInput = reportOverviewInputSchema.parse(input)
  const title = parsedInput.title ?? scenarioInput.title ?? "Overview"
  const subtitle = parsedInput.subtitle ?? scenarioInput.subtitle
  const sourceLabel = parsedInput.sourceLabel ?? scenarioInput.sourceLabel
  const identity = parsedInput.identity ?? scenarioInput.identity
  const metrics = parsedInput.metrics ?? scenarioInput.metrics ?? []

  return (
    <ReportCard
      title={title}
      subtitle={subtitle}
      sourceLabel={sourceLabel}
      className={className}
    >
      {!identity && metrics.length === 0 ? (
        <EmptyState>暂无 Report Overview 数据</EmptyState>
      ) : (
        <>
          {identity && (
            <section className="border-b p-4">
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <div>
                  <b className="block text-base">{identity.product}</b>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Lot {identity.lotId} · Step {identity.stepCount} · Wafer {identity.waferCount}
                  </p>
                </div>
                <ReportBadge tone="neutral">ROUND SNAPSHOT</ReportBadge>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {identity.summary}
              </p>
            </section>
          )}
          {metrics.length > 0 && <MetricGrid metrics={metrics} />}
          <div className="grid gap-4 p-4 lg:grid-cols-2 xl:grid-cols-4">
            <ItemPanel title="当前轮次重点" items={parsedInput.focusItems ?? []} />
            <ItemPanel title="主要失效组" items={parsedInput.failGroups ?? []} />
            <ItemPanel title="低良率晶圆" items={parsedInput.lowYieldWafers ?? []} />
            <ItemPanel title="参数异常提醒" items={parsedInput.parameterAlerts ?? []} />
          </div>
        </>
      )}
    </ReportCard>
  )
}

function ItemPanel({ title, items }: { title: string; items: ReportListItem[] }) {
  return (
    <section className="rounded-lg border p-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-3 grid gap-2">
        {items.length === 0 ? (
          <span className="text-sm text-muted-foreground">暂无记录</span>
        ) : (
          items.map((item) => (
            <div key={`${item.label}-${item.value ?? ""}`} className="rounded-md border bg-muted/20 p-2">
              <div className="flex items-start justify-between gap-2">
                <b className="min-w-0 break-words font-mono text-xs">{item.label}</b>
                {item.value && <ReportBadge tone={item.tone}>{item.value}</ReportBadge>}
              </div>
              {item.detail && (
                <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  )
}
