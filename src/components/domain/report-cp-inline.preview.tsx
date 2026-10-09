"use client"

import { useState } from "react"
import { ReportCpInline } from "@/components/domain/report-cp-inline"
import { reportCpInlineScenarios } from "@/components/domain/report-cp-inline.scenarios"
import { candidatePreviewFit, candidatePreviewPage } from "@/components/domain/report-cp-inline-preview-model"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ReportCpInlineInput } from "@/schemas/domain-component-inputs"

export function ReportCpInlinePreview() {
  const [key, setKey] = useState<keyof typeof reportCpInlineScenarios>("normal")
  const [input, setInput] = useState<ReportCpInlineInput>(reportCpInlineScenarios.normal.input)
  return <div className="not-prose domain-ui-typography grid gap-3">
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">点击 CP Parameter 打开 Fit；Drawer 打开时仍可操作外部列表。</p>
      <Select value={key} onValueChange={(value) => { if (value && value in reportCpInlineScenarios) { const next = value as keyof typeof reportCpInlineScenarios; setKey(next); setInput(reportCpInlineScenarios[next].input) } }}>
        <SelectTrigger className="w-56" aria-label="CP x Inline composition scenario"><SelectValue>{reportCpInlineScenarios[key].name}</SelectValue></SelectTrigger>
        <SelectContent>{Object.entries(reportCpInlineScenarios).map(([value, scenario]) => <SelectItem key={value} value={value}>{scenario.name}</SelectItem>)}</SelectContent>
      </Select>
    </div>
    <ReportCpInline key={key} input={input}
      onFiltersChange={(filters) => setInput((current) => ({ ...current, candidates: candidatePreviewPage(current.candidates, filters, 1, key === "dense") }))}
      onPageChange={(page) => setInput((current) => ({ ...current, candidates: candidatePreviewPage(current.candidates, current.candidates.filters, page, key === "dense") }))}
      onOpenCandidate={(candidate) => setInput((current) => ({ ...current, fit: key === "detailLoading" || key === "detailError" ? null : candidatePreviewFit(candidate) }))} />
    <p className="text-xs text-muted-foreground">{input.candidates.provenance.classification} · {input.candidates.provenance.source}</p>
  </div>
}
