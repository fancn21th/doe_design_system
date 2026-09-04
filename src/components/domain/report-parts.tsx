import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ReportMetric, ReportTone } from "@/schemas/domain-component-inputs"

export function reportToneClass(tone: ReportTone | undefined) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (tone === "watch") return "border-amber-200 bg-amber-50 text-amber-700"
  if (tone === "bad") return "border-red-200 bg-red-50 text-red-700"
  return "border-border bg-background text-muted-foreground"
}

export function ReportBadge({
  tone = "neutral",
  children,
}: {
  tone?: ReportTone
  children: ReactNode
}) {
  return (
    <Badge
      variant="outline"
      className={cn("h-6 rounded-md px-2 font-mono", reportToneClass(tone))}
    >
      {children}
    </Badge>
  )
}

export function ReportCard({
  title,
  subtitle,
  sourceLabel,
  children,
  className,
}: {
  title: string
  subtitle?: string
  sourceLabel?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("not-prose domain-ui-typography", className)}>
      <Card className="gap-0 overflow-hidden rounded-lg py-0 shadow-none">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <CardTitle>{title}</CardTitle>
              {subtitle && (
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
            {sourceLabel && <ReportBadge tone="neutral">{sourceLabel}</ReportBadge>}
          </div>
        </CardHeader>
        <CardContent className="p-0">{children}</CardContent>
      </Card>
    </div>
  )
}

export function MetricGrid({ metrics }: { metrics: ReportMetric[] }) {
  return (
    <div className="grid border-b md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="border-b p-4 md:border-r xl:border-b-0">
          <span className="block text-sm text-muted-foreground">{metric.label}</span>
          <b className="mt-1 block font-mono text-lg">{metric.value}</b>
          {metric.detail && (
            <span className="mt-1 block text-xs text-muted-foreground">
              {metric.detail}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="p-6">
      <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        {children}
      </div>
    </div>
  )
}

export function formatPercent(value: number) {
  return `${value.toFixed(2)}%`
}

export function formatCompactNumber(value: number) {
  if (Math.abs(value) >= 1000) return value.toLocaleString()
  if (Math.abs(value) >= 10) return value.toFixed(2)
  return value.toPrecision(4)
}
