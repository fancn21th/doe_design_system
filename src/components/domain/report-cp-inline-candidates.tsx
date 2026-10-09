"use client"

import { ChevronLeftIcon, ChevronRightIcon, CircleHelpIcon, ListFilterIcon } from "lucide-react"

import { ReportState } from "@/components/domain/report-state"
import { EmptyState } from "@/components/domain/report-parts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  reportCpInlineCandidatesInputSchema,
  type ReportCpInlineCandidate,
  type ReportCpInlineCandidateFilter,
  type ReportCpInlineCandidatesInput,
} from "@/schemas/domain-component-inputs"

const ALL = "__all__"

export function ReportCpInlineCandidates({
  input,
  onFiltersChange,
  onPageChange,
  onOpenCandidate,
}: {
  input: ReportCpInlineCandidatesInput
  onFiltersChange?: (filters: ReportCpInlineCandidateFilter) => void
  onPageChange?: (page: number) => void
  onOpenCandidate?: (candidate: ReportCpInlineCandidate) => void
}) {
  const parsed = reportCpInlineCandidatesInputSchema.parse(input)
  const patchFilters = (patch: Partial<ReportCpInlineCandidateFilter>) =>
    onFiltersChange?.({ ...parsed.filters, ...patch })
  const recommended = parsed.filters.view === "recommended"
  const firstRank = (parsed.page - 1) * parsed.pageSize + 1
  const pageCount = Math.max(1, Math.ceil(parsed.total / parsed.pageSize))
  const busy = parsed.status !== "ready"

  return (
    <TooltipProvider>
      <div className="not-prose domain-ui-typography domain-ui-cp-inline">
        <Card className="gap-0 rounded-(--doe-radius-card) border py-0 shadow-none ring-0">
          <CardHeader className="border-b p-(--doe-module-padding)">
            <CardTitle>{parsed.title}</CardTitle>
            {parsed.subtitle ? <p className="text-sm text-muted-foreground">{parsed.subtitle}</p> : null}
          </CardHeader>
          <Tabs
            value={parsed.filters.view}
            onValueChange={(value) => {
              if (value === "recommended" || value === "filtered" || value === "insufficient") {
                patchFilters({ view: value, pairedN: null, reason: null })
              }
            }}
            className="gap-0"
          >
            <div className="overflow-x-auto border-b px-(--doe-module-padding)">
              <TabsList variant="line" className="h-(--doe-table-row-height) gap-4 p-0">
                <TabsTrigger value="recommended" className="px-0 data-active:text-[var(--doe-cp-inline-accent)] after:bg-[var(--doe-cp-inline-accent)] after:bottom-0">Recommended Candidates</TabsTrigger>
                <TabsTrigger value="filtered" className="px-0 data-active:text-[var(--doe-cp-inline-accent)] after:bg-[var(--doe-cp-inline-accent)] after:bottom-0">Filtered</TabsTrigger>
                <TabsTrigger value="insufficient" className="px-0 data-active:text-[var(--doe-cp-inline-accent)] after:bg-[var(--doe-cp-inline-accent)] after:bottom-0">Insufficient Sample</TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
          <CardContent className="grid gap-(--doe-section-gap) p-(--doe-module-padding)">
            <div className="grid gap-3 md:grid-cols-3">
              <CandidateSelect label="Step" value={parsed.filters.step} allLabel="All Steps" options={parsed.stepOptions} onChange={(step) => patchFilters({ step })} />
              <CandidateSelect label="CP Parameter" value={parsed.filters.cpParameter} allLabel="All CP Parameters" options={parsed.cpParameterOptions} onChange={(cpParameter) => patchFilters({ cpParameter })} />
              <CandidateSelect label="Inline Parameter" value={parsed.filters.inlineParameter} allLabel="All Inline Parameters" options={parsed.inlineParameterOptions} onChange={(inlineParameter) => patchFilters({ inlineParameter })} />
            </div>
            {parsed.status === "loading" ? (
              <ReportState status="loading" />
            ) : parsed.status === "error" ? (
              <div role="alert"><EmptyState>{parsed.errorMessage ?? "候选组合加载失败。"}</EmptyState></div>
            ) : parsed.items.length === 0 ? (
              <EmptyState>当前筛选没有候选组合。</EmptyState>
            ) : (
              <div className="max-w-full overflow-x-auto">
                <Table className="min-w-(--doe-cp-inline-table-min-width)">
                  <TableHeader className="border-y bg-muted/50">
                    <TableRow>
                      {recommended ? <TableHead>Rank</TableHead> : null}
                      <TableHead>CP Parameter</TableHead>
                      <TableHead>Inline Parameter</TableHead>
                      <TableHead>
                        <div className="flex items-center gap-1">
                          Paired Wafers
                          <ColumnFilter label="Paired Wafers" value={parsed.filters.pairedN == null ? null : String(parsed.filters.pairedN)} options={parsed.pairedNOptions.map(String)} onChange={(value) => patchFilters({ pairedN: value == null ? null : Number(value) })} />
                          <Help label="Paired Wafers" text="同片配对的有效 Wafer 数 / 当前实验组分配的 Wafer 数。列头按配对数量精确筛选。" />
                        </div>
                      </TableHead>
                      {recommended ? (
                        <>
                          <TableHead><div className="flex items-center gap-1">Spearman ρ<Help label="Spearman" text="上游保存的 Spearman 等级相关系数；正负号表示观测方向，不代表因果关系。" /></div></TableHead>
                          <TableHead><div className="flex items-center gap-1">Score<Help label="Score" text={parsed.scoreDescription ?? "上游保存的候选评分，沿用现有计算版本与推荐分类；组件不重新计算。"} /></div></TableHead>
                        </>
                      ) : (
                        <>
                          <TableHead><div className="flex items-center gap-1">Primary Filter Reason<ColumnFilter label="Primary Filter Reason" value={parsed.filters.reason} options={parsed.reasonOptions} onChange={(reason) => patchFilters({ reason })} /></div></TableHead>
                          <TableHead>Calculation Evidence</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsed.items.map((candidate, index) => (
                      <TableRow key={JSON.stringify([candidate.experimentGroupId, candidate.cpParameter, candidate.inlineParameter])} className="h-(--doe-table-row-height)">
                        {recommended ? <TableCell className="tabular-nums text-muted-foreground">{firstRank + index}</TableCell> : null}
                        <TableCell>
                          <CandidateLink candidate={candidate} label={candidate.cpParameter} onOpen={onOpenCandidate} />
                          <span className="mt-1 block text-xs text-muted-foreground">{candidate.cpUnit ?? "unit —"}</span>
                        </TableCell>
                        <TableCell><CandidateLink candidate={candidate} label={candidate.inlineParameter} onOpen={onOpenCandidate} /></TableCell>
                        <TableCell className="tabular-nums">{candidate.pairedCount}/{candidate.assignedWaferCount}</TableCell>
                        {recommended ? (
                          <>
                            <TableCell className={`font-semibold tabular-nums ${candidate.spearman == null || candidate.spearman === 0 ? "" : candidate.spearman > 0 ? "text-[var(--doe-cp-inline-wafer)]" : "text-[var(--doe-cp-inline-quadratic)]"}`}>
                              {candidate.spearman == null ? "—" : `${candidate.spearman > 0 ? "+" : ""}${candidate.spearman.toFixed(2)}`}
                            </TableCell>
                            <TableCell>
                              <div className="min-w-20 max-w-28">
                                <span className="font-semibold tabular-nums">{candidate.score == null ? "—" : candidate.score.toFixed(1)}</span>
                                {candidate.score != null ? <div aria-hidden="true" className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-[var(--doe-cp-inline-accent)]" style={{ width: `${Math.min(100, Math.max(0, candidate.score))}%` }} /></div> : null}
                              </div>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell className="whitespace-normal">{candidate.filterReason ?? (candidate.level === "LOW" ? "未达到现有推荐等级" : "—")}</TableCell>
                            <TableCell className="whitespace-normal text-muted-foreground">{candidate.calculationEvidence ?? savedEvidence(candidate)}</TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-end gap-3">
            <Button type="button" variant="outline" size="icon" aria-label="Previous candidates page" disabled={busy || parsed.page <= 1} onClick={() => onPageChange?.(parsed.page - 1)}><ChevronLeftIcon /></Button>
            <span className="text-sm tabular-nums text-muted-foreground">{parsed.page} / {pageCount}</span>
            <Button type="button" variant="outline" size="icon" aria-label="Next candidates page" disabled={busy || parsed.page >= pageCount} onClick={() => onPageChange?.(parsed.page + 1)}><ChevronRightIcon /></Button>
          </CardFooter>
        </Card>
      </div>
    </TooltipProvider>
  )
}

function CandidateLink({ candidate, label, onOpen }: { candidate: ReportCpInlineCandidate; label: string; onOpen?: (candidate: ReportCpInlineCandidate) => void }) {
  return (
    <Button type="button" variant="link" className="h-auto max-w-full justify-start whitespace-normal p-0 text-left font-semibold text-foreground" disabled={!candidate.detailAvailable} title={`${candidate.stepLabel} · ${candidate.factorLabel} · ${candidate.experimentGroupId}${candidate.detailAvailable ? "" : " · 详情不可用"}`} onClick={() => onOpen?.(candidate)}>{label}</Button>
  )
}

function CandidateSelect({ label, value, options, allLabel, onChange }: { label: string; value: string | null; options: string[]; allLabel: string; onChange: (value: string | null) => void }) {
  return (
    <label className="grid gap-1.5 text-sm text-muted-foreground">
      <span>{label}</span>
      <Select value={value ?? ALL} onValueChange={(next) => next != null && onChange(next === ALL ? null : next)}>
        <SelectTrigger className="w-full" aria-label={label}><SelectValue>{value ?? allLabel}</SelectValue></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{allLabel}</SelectItem>
          {options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
        </SelectContent>
      </Select>
    </label>
  )
}

function ColumnFilter({ label, value, options, onChange }: { label: string; value: string | null; options: string[]; onChange: (value: string | null) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button type="button" variant="ghost" size="icon-sm" aria-label={`Filter ${label}`} className={value == null ? "text-muted-foreground" : "text-primary"} />}><ListFilterIcon /></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={value ?? ALL} onValueChange={(next) => onChange(next === ALL ? null : String(next))}>
          <DropdownMenuRadioItem value={ALL}>All</DropdownMenuRadioItem>
          {options.map((option) => <DropdownMenuRadioItem key={option} value={option}>{option}</DropdownMenuRadioItem>)}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function Help({ label, text }: { label: string; text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button type="button" variant="ghost" size="icon-sm" aria-label={`About ${label}`} className="text-muted-foreground" />}><CircleHelpIcon /></TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  )
}

function savedEvidence(candidate: ReportCpInlineCandidate) {
  if (candidate.filterReason === "INLINE_CONSTANT") return "上游标记 Inline 为常量。"
  if (candidate.filterReason === "CP_CONSTANT") return "上游标记 CP 为常量。"
  if (candidate.filterReason === "INSUFFICIENT_SAMPLE") return `上游标记样本不足；有效配对 ${candidate.pairedCount}/${candidate.assignedWaferCount}。`
  if (candidate.level === "LOW" && candidate.filterReason == null) return "上游保存等级为 LOW，未提供过滤原因。"
  return "—"
}
