"use client"

import { useState } from "react"
import { ReportCpInlineFit } from "@/components/domain/report-cp-inline-fit"
import { reportCpInlineFitScenarios } from "@/components/domain/report-cp-inline-fit.scenarios"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ReportCpInlineFitPreview() {
  const [key, setKey] = useState<keyof typeof reportCpInlineFitScenarios>("prototype")
  return <div className="not-prose domain-ui-typography grid gap-3">
    <Select value={key} onValueChange={(value) => { if (value && value in reportCpInlineFitScenarios) setKey(value as keyof typeof reportCpInlineFitScenarios) }}>
      <SelectTrigger className="w-56" aria-label="Fit scenario"><SelectValue>{reportCpInlineFitScenarios[key].name}</SelectValue></SelectTrigger>
      <SelectContent>{Object.entries(reportCpInlineFitScenarios).map(([value, scenario]) => <SelectItem key={value} value={value}>{scenario.name}</SelectItem>)}</SelectContent>
    </Select>
    <ReportCpInlineFit key={key} input={reportCpInlineFitScenarios[key].input} />
  </div>
}
