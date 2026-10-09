"use client"

import { useState } from "react"
import { XIcon } from "lucide-react"

import { ReportCpInlineCandidates } from "@/components/domain/report-cp-inline-candidates"
import { ReportCpInlineFit } from "@/components/domain/report-cp-inline-fit"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import {
  reportCpInlineInputSchema,
  type ReportCpInlineCandidate, type ReportCpInlineCandidateFilter, type ReportCpInlineInput,
} from "@/schemas/domain-component-inputs"

export function ReportCpInline({ input, onFiltersChange, onPageChange, onOpenCandidate }: {
  input: ReportCpInlineInput
  onFiltersChange?: (filters: ReportCpInlineCandidateFilter) => void
  onPageChange?: (page: number) => void
  onOpenCandidate?: (candidate: ReportCpInlineCandidate) => void
}) {
  const parsed = reportCpInlineInputSchema.parse(input)
  const [activeCandidate, setActiveCandidate] = useState<ReportCpInlineCandidate | null>(null)
  const [open, setOpen] = useState(false)
  const matchingFit = parsed.fit && activeCandidate &&
    parsed.fit.experimentGroupId === activeCandidate.experimentGroupId &&
    parsed.fit.cpParameter === activeCandidate.cpParameter &&
    parsed.fit.inlineParameter === activeCandidate.inlineParameter ? parsed.fit : null

  return (
    <div className="not-prose domain-ui-typography">
      <ReportCpInlineCandidates input={parsed.candidates} onFiltersChange={onFiltersChange} onPageChange={onPageChange} onOpenCandidate={(candidate) => {
        setActiveCandidate(candidate)
        setOpen(true)
        onOpenCandidate?.(candidate)
      }} />
      <Drawer modal={false} disablePointerDismissal swipeDirection="right" open={open} onOpenChange={setOpen}>
        <DrawerContent className="domain-ui-typography" style={{ width: "min(var(--doe-cp-inline-drawer-width), calc(100vw - 2rem))" }}>
          <DrawerHeader className="flex-row items-start justify-between gap-3 border-b p-(--doe-module-padding)">
            <DrawerTitle className="min-w-0 break-words">{activeCandidate ? `${activeCandidate.cpParameter} × ${activeCandidate.inlineParameter}` : "Fit"}</DrawerTitle>
            <DrawerClose render={<Button variant="ghost" size="icon-sm" aria-label="关闭 Fit" />}><XIcon /></DrawerClose>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-(--doe-module-padding)">
            {parsed.fitStatus === "error" ? <p role="alert" className="py-8 text-muted-foreground">{parsed.fitError ?? "Fit 证据加载失败。"}</p> : parsed.fitStatus === "loading" || !matchingFit ? <p role="status" className="py-8 text-muted-foreground">正在等待所选组合的 Fit 证据…</p> : <ReportCpInlineFit key={JSON.stringify([matchingFit.experimentGroupId, matchingFit.cpParameter, matchingFit.inlineParameter])} input={matchingFit} showHeader={false} />}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
