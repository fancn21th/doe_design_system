"use client"

import * as React from "react"

import { ReportCpInlineCandidates } from "@/components/domain/report-cp-inline-candidates"
import { reportCpInlineCandidatesScenarios } from "@/components/domain/report-cp-inline-candidates.scenarios"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ReportCpInlineCandidatesPreview() {
  const [scenarioKey, setScenarioKey] = React.useState("normal")
  const [input, setInput] = React.useState(
    reportCpInlineCandidatesScenarios.normal.input
  )

  const selectScenario = (key: string) => {
    const scenario =
      reportCpInlineCandidatesScenarios[
        key as keyof typeof reportCpInlineCandidatesScenarios
      ]
    setScenarioKey(key)
    setInput(scenario.input)
  }

  return (
    <div className="not-prose domain-ui-typography overflow-hidden rounded-xl border">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <b className="text-sm">CP × Inline Candidate Ranking</b>
          <p className="mt-0.5 text-xs text-muted-foreground">
            过滤、分页与 View fit 都通过 callback intent 交给消费者。
          </p>
        </div>
        <Select value={scenarioKey} onValueChange={(value) => value && selectScenario(value)}>
          <SelectTrigger className="min-w-48" aria-label="Candidate scenario">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {Object.entries(reportCpInlineCandidatesScenarios).map(([key, item]) => (
              <SelectItem key={key} value={key}>{item.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ReportCpInlineCandidates
        input={input}
        onFiltersChange={(filters) => setInput((current) => ({ ...current, filters, page: 1 }))}
        onPageChange={(page) => setInput((current) => ({ ...current, page }))}
      />
    </div>
  )
}
