"use client"

import { useState } from "react"
import { ReportCpInlineCandidates } from "@/components/domain/report-cp-inline-candidates"
import { reportCpInlineCandidatesScenarios } from "@/components/domain/report-cp-inline-candidates.scenarios"
import { candidatePreviewPage } from "@/components/domain/report-cp-inline-preview-model"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ReportCpInlineCandidatesPreview() {
  const [scenarioKey, setScenarioKey] = useState<keyof typeof reportCpInlineCandidatesScenarios>("normal")
  const [input, setInput] = useState(reportCpInlineCandidatesScenarios.normal.input)
  return <div className="not-prose domain-ui-typography grid gap-3">
    <Select value={scenarioKey} onValueChange={(value) => { if (value && value in reportCpInlineCandidatesScenarios) { const key = value as keyof typeof reportCpInlineCandidatesScenarios; setScenarioKey(key); setInput(reportCpInlineCandidatesScenarios[key].input) } }}>
      <SelectTrigger className="w-56" aria-label="Candidates scenario"><SelectValue>{reportCpInlineCandidatesScenarios[scenarioKey].name}</SelectValue></SelectTrigger>
      <SelectContent>{Object.entries(reportCpInlineCandidatesScenarios).map(([key, scenario]) => <SelectItem key={key} value={key}>{scenario.name}</SelectItem>)}</SelectContent>
    </Select>
    <ReportCpInlineCandidates input={input} onFiltersChange={(filters) => setInput((current) => candidatePreviewPage(current, filters, 1, scenarioKey === "dense"))} onPageChange={(page) => setInput((current) => candidatePreviewPage(current, current.filters, page, scenarioKey === "dense"))} />
    <p className="text-xs text-muted-foreground">{input.provenance.classification} · {input.provenance.source} · {input.calculationVersion}</p>
  </div>
}
