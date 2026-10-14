"use client"

import * as React from "react"
import { ChevronDown, CircleHelp } from "lucide-react"
import { ReportState } from "@/components/domain/report-state"
import { ReportBadge } from "@/components/domain/report-parts"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { reportOverviewInputSchema, type ReportListItem, type ReportOverviewInput } from "@/schemas/domain-component-inputs"
import styles from "./report-overview.module.css"

type ReportOverviewProps = { input?: ReportOverviewInput; className?: string }

export function ReportOverview({ input, className }: ReportOverviewProps) {
  // Fixtures belong to explicitly selected scenarios, never production defaults.
  const data = reportOverviewInputSchema.parse(input ?? {})
  const identity = data.identity
  const metrics = data.metrics ?? []
  return (
    <TooltipProvider>
      <div className={cn("domain-ui-typography domain-ui-report-pane grid gap-4 p-4", styles.overview, className)}>
        <OverviewModule title="实验基础信息">
          {identity ? (
            <div className="grid gap-3 text-sm">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <strong title="报告来源">{identity.product}</strong>
                <span>Lot：<strong>{identity.lotId}</strong></span>
                <span>Step 数量：<strong>{identity.stepCount}</strong></span>
                <span>Wafer 数量：<strong>{identity.waferCount} 片</strong></span>
              </div>
              <p className="text-muted-foreground">{identity.summary}</p>
              {!!data.waferIds?.length && (
                <details className="rounded-md border px-3 py-2">
                  <summary className="cursor-pointer text-sm font-medium">查看 Wafer ID（{data.waferIds.length} 片）</summary>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {data.waferIds.map((wafer) => <span key={wafer} className="rounded border px-2 py-1 font-mono text-xs">{wafer}</span>)}
                  </div>
                </details>
              )}
            </div>
          ) : <ReportState title="暂无实验基础信息" />}
        </OverviewModule>

        <OverviewModule title="实验概览">
          {metrics.length ? (
            <div className={styles.metrics}>
              {metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
            </div>
          ) : <ReportState title="暂无指标数据" />}
          {data.assessmentNote && <p className="mb-4 text-xs text-muted-foreground" role="status">{data.assessmentNote}</p>}
        </OverviewModule>

        <div className={styles.threeColumns}>
          <OverviewModule title="当前轮次重点">{data.focusItems?.length ? <div className="grid gap-3">{data.focusItems.map((item, index) => <div key={`${item.label}-${index}`} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs">
            <b className="font-mono text-sky-700">{item.label}</b><strong className="text-red-600 tabular-nums">{item.value}</strong><span className="text-muted-foreground">{item.detail}</span>
          </div>)}</div> : <NoRecords />}</OverviewModule>
          <OverviewModule title="主要失效组"><ItemList items={data.failGroups ?? []} /></OverviewModule>
          <OverviewModule title="低良率晶圆"><ItemList items={data.lowYieldWafers ?? []} /></OverviewModule>
        </div>
        <OverviewModule title="参数异常提醒">{data.parameterAlerts?.length ? <div className="flex flex-wrap gap-3">{data.parameterAlerts.map((item) => <div key={item.label} title={item.detail} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">{item.label} · {item.value}</div>)}</div> : <NoRecords />}</OverviewModule>
      </div>
    </TooltipProvider>
  )
}

function OverviewModule({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Collapsible defaultOpen className="min-w-0 rounded-xl border bg-card text-card-foreground">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <CollapsibleTrigger aria-label={`展开或收起${title}`} className="group rounded p-1 text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring">
          <ChevronDown aria-hidden className="size-4 transition-transform group-data-panel-open:rotate-180" />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent><div className="p-4">{children}</div></CollapsibleContent>
    </Collapsible>
  )
}

function MetricCard({ metric }: { metric: NonNullable<ReportOverviewInput["metrics"]>[number] }) {
  return (
    <div className={styles.metric}>
      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <span>{metric.label}</span>
        {metric.info && <Tooltip>
          <TooltipTrigger aria-label={`${metric.label} 统计口径`} className="rounded-full focus-visible:outline-2 focus-visible:outline-ring">
            <CircleHelp aria-hidden className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>{metric.info}</TooltipContent>
        </Tooltip>}
      </div>
      <strong className="my-2 text-3xl font-semibold tracking-tight tabular-nums">{metric.value}</strong>
      <p className="text-xs leading-5 text-muted-foreground">{metric.detail}</p>
      <div className="mt-2 min-h-5">{metric.badge && <ReportBadge tone={metric.tone}>{metric.badge}</ReportBadge>}</div>
    </div>
  )
}

function NoRecords() { return <ReportState title="暂无记录" className="min-h-24" /> }

function ItemList({ items }: { items: ReportListItem[] }) {
  return items.length ? <div className="grid gap-2">{items.map((item, index) => (
    <div key={`${item.label}-${index}`} className="min-w-0 border-b py-2 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-2 text-xs">
        <b className="break-words font-mono">{item.label}</b>
        {item.value && <ReportBadge tone={item.tone}>{item.value}</ReportBadge>}
      </div>
      {item.detail && <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">{item.detail}</p>}
    </div>
  ))}</div> : <NoRecords />
}
