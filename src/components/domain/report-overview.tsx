"use client"

import { reportOverviewScenarios } from "@/components/domain/report-overview.scenarios"
import {
  EmptyState,
  ReportBadge,
  ReportCard,
} from "@/components/domain/report-parts"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  const identity = parsedInput.identity ?? scenarioInput.identity
  const metrics = parsedInput.metrics ?? scenarioInput.metrics ?? []

  return (
    <ReportCard
      title={title}
      className={className}
    >
      {!identity && metrics.length === 0 ? (
        <EmptyState>暂无 Report Overview 数据</EmptyState>
      ) : (
        <div className="grid gap-4 p-4">
          {identity && (
            <OverviewCard><CardHeader><CardDescription>实验基础信息</CardDescription><CardTitle className="text-xl">{identity.product}</CardTitle></CardHeader><CardContent className="grid gap-3 pb-(--card-spacing) text-sm text-muted-foreground"><span>Lot {identity.lotId} · Step {identity.stepCount} · Wafer {identity.waferCount}</span><span>{identity.summary}</span></CardContent></OverviewCard>
          )}
          {metrics.length > 0 && (
            <section><h2 className="mb-3 text-sm font-semibold">实验概览</h2><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => <OverviewCard key={metric.label} emphasis><CardHeader><CardDescription>{metric.label}</CardDescription><CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{metric.value}</CardTitle><CardAction>{metric.tone && <ReportBadge tone={metric.tone}>{metric.tone === "bad" ? "需关注" : "已就绪"}</ReportBadge>}</CardAction></CardHeader><CardContent className="pb-(--card-spacing) text-sm text-muted-foreground">{metric.detail}</CardContent></OverviewCard>)}</div></section>
          )}
          {(parsedInput.anomalyRows?.length ?? 0) > 0 && (
            <section className="grid gap-3">
              <div>
                <h2 className="text-base font-semibold">Split Table x 异常 Yield</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  当前轮次中需要优先复核的低良率晶圆。
                </p>
              </div>
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-muted">
                    <TableRow>
                      <TableHead>Split Group</TableHead>
                      <TableHead>Variant</TableHead>
                      <TableHead>Wafer ID</TableHead>
                      <TableHead>Yield</TableHead>
                      <TableHead>Δ vs BSL</TableHead>
                      <TableHead>CP结果摘要</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedInput.anomalyRows?.map((row) => (
                      <TableRow key={`${row.splitGroup}-${row.waferId}`}>
                        <TableCell>{row.splitGroup}</TableCell>
                        <TableCell>{row.variant ?? "—"}</TableCell>
                        <TableCell className="font-mono">{row.waferId}</TableCell>
                        <TableCell>
                          <ReportBadge tone={row.tone}>{row.yield.toFixed(2)}%</ReportBadge>
                        </TableCell>
                        <TableCell>{row.baselineDelta ?? "—"}</TableCell>
                        <TableCell>{row.cpSummary ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          )}
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            <ItemPanel title="当前轮次重点" items={parsedInput.focusItems ?? []} />
            <ItemPanel title="主要失效组" items={parsedInput.failGroups ?? []} />
            <ItemPanel title="低良率晶圆" items={parsedInput.lowYieldWafers ?? []} />
            <ItemPanel title="参数异常提醒" items={parsedInput.parameterAlerts ?? []} />
          </div>
        </div>
      )}
    </ReportCard>
  )
}

function ItemPanel({ title, items }: { title: string; items: ReportListItem[] }) {
  return (
    <OverviewCard><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent className="grid gap-2">
        {items.length === 0 ? (
          <span className="text-sm text-muted-foreground">暂无记录</span>
        ) : (
          items.map((item) => (
            <div key={`${item.label}-${item.value ?? ""}`} className="border-b py-2 last:border-b-0 first:pt-0 last:pb-0">
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
      </CardContent></OverviewCard>
  )
}

function OverviewCard({
  children,
  emphasis = false,
}: {
  children: React.ReactNode
  emphasis?: boolean
}) {
  return (
    <Card
      className={
        emphasis
          ? "@container/card gap-0 bg-gradient-to-t from-primary/5 to-card py-0 shadow-xs"
          : "@container/card gap-0 py-0 shadow-xs"
      }
    >
      {children}
    </Card>
  )
}
