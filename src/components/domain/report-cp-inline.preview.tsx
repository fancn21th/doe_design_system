"use client"

import * as React from "react"

import { ReportCpInline } from "@/components/domain/report-cp-inline"
import { reportCpInlineScenarios } from "@/components/domain/report-cp-inline.scenarios"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const scenarioEntries = Object.entries(reportCpInlineScenarios)

export function ReportCpInlinePreview() {
  const [scenarioKey, setScenarioKey] = React.useState("normal")
  const scenario = reportCpInlineScenarios[
    scenarioKey as keyof typeof reportCpInlineScenarios
  ]

  return (
    <div className="not-prose domain-ui-typography overflow-hidden rounded-xl border">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <b className="text-sm">CP × Inline</b>
          <p className="mt-0.5 text-xs text-muted-foreground">
            切换 scenario 检查正常与边界状态。
          </p>
        </div>
        <Select value={scenarioKey} onValueChange={(value) => value && setScenarioKey(value)}>
          <SelectTrigger className="min-w-48" aria-label="CP x Inline scenario">
            <SelectValue>{scenario.name}</SelectValue>
          </SelectTrigger>
          <SelectContent align="end">
            {scenarioEntries.map(([key, item]) => (
              <SelectItem key={key} value={key}>{item.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ReportCpInline input={scenario.input} />
    </div>
  )
}
