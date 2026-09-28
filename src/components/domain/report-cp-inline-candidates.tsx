"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState, ReportBadge } from "@/components/domain/report-parts"
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
  const firstRank = (parsed.page - 1) * parsed.pageSize + 1
  const lastRank = Math.min(parsed.page * parsed.pageSize, parsed.total)

  return (
    <div className="not-prose domain-ui-typography">
      <Card className="gap-0 overflow-hidden rounded-lg py-0 shadow-none">
        <CardHeader className="border-b py-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle>{parsed.title}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {parsed.subtitle ??
                  "按当前 Generation 的 Backend 顺序查看同片配对候选；打开候选只更新下方分析范围。"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ReportBadge tone="good">Backend order</ReportBadge>
              <ReportBadge>{parsed.total} candidates</ReportBadge>
              <ReportBadge>{parsed.calculationVersion}</ReportBadge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 p-3">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <CandidateSelect
              label="CP Parameter"
              value={parsed.filters.cpParameter}
              allLabel="All CP"
              options={parsed.cpParameterOptions}
              onChange={(value) => patchFilters({ cpParameter: value })}
            />
            <CandidateSelect
              label="Inline Parameter"
              value={parsed.filters.inlineParameter}
              allLabel="All Inline"
              options={parsed.inlineParameterOptions}
              onChange={(value) => patchFilters({ inlineParameter: value })}
            />
            <CandidateSelect
              label="Level"
              value={parsed.filters.level}
              options={[
                ["RECOMMENDED", "High + Medium"],
                ["HIGH_TREND", "High"],
                ["MEDIUM_TREND", "Medium"],
                ["LOW", "Low"],
                ["ALL", "All / filtered"],
              ]}
              onChange={(value) =>
                value &&
                patchFilters({
                  level: value as ReportCpInlineCandidateFilter["level"],
                })
              }
              allowAll={false}
            />
            <CandidateSelect
              label="Direction"
              value={parsed.filters.direction}
              allLabel="All directions"
              options={[
                ["POSITIVE", "Positive"],
                ["NEGATIVE", "Negative"],
              ]}
              onChange={(value) =>
                patchFilters({
                  direction: value as ReportCpInlineCandidateFilter["direction"],
                })
              }
            />
            <CandidateSelect
              label="Min N"
              value={parsed.filters.minN == null ? null : String(parsed.filters.minN)}
              allLabel="Any"
              options={[
                ["3", "3"],
                ["6", "6"],
              ]}
              onChange={(value) => patchFilters({ minN: value ? Number(value) : null })}
            />
          </div>

          {parsed.items.length === 0 ? (
            <EmptyState>当前筛选没有候选组合。</EmptyState>
          ) : (
            <div className="max-w-full overflow-x-auto rounded-lg border">
              <Table className="min-w-[1120px] text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Step / Factor</TableHead>
                    <TableHead>CP</TableHead>
                    <TableHead>Inline</TableHead>
                    <TableHead>N</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Spearman</TableHead>
                    <TableHead>R²</TableHead>
                    <TableHead>CP Response</TableHead>
                    <TableHead>CP Spread</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead className="text-right">Open</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsed.items.map((candidate, index) => (
                    <TableRow
                      key={`${candidate.experimentGroupId}-${candidate.cpParameter}-${candidate.inlineParameter}`}
                    >
                      <TableCell className="font-mono">{firstRank + index}</TableCell>
                      <TableCell>
                        <b className="block">{candidate.factorLabel}</b>
                        <span className="text-muted-foreground">{candidate.stepLabel}</span>
                      </TableCell>
                      <TableCell className="font-mono">{candidate.cpParameter}</TableCell>
                      <TableCell className="font-mono">{candidate.inlineParameter}</TableCell>
                      <TableCell className="font-mono">
                        {candidate.pairedCount}/{candidate.assignedWaferCount}
                      </TableCell>
                      <TableCell>{directionLabel(candidate.direction)}</TableCell>
                      <NumericCell value={candidate.spearman} />
                      <NumericCell value={candidate.rSquared} />
                      <NumericCell value={candidate.cpResponse} />
                      <NumericCell value={candidate.cpSpread} />
                      <NumericCell value={candidate.score} strong />
                      <TableCell>
                        <ReportBadge tone={candidateTone(candidate.level)}>
                          {candidate.level}
                        </ReportBadge>
                        {candidate.sampleBand === "SMALL_SAMPLE" ||
                        candidate.sampleBand === "N_LT_3" ? (
                          <small className="mt-1 block text-amber-700">Small sample</small>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          onClick={() => onOpenCandidate?.(candidate)}
                        >
                          View fit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-3 text-xs text-muted-foreground">
            <span>
              {parsed.total === 0 ? "0" : `${firstRank}–${lastRank}`} / {parsed.total}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={parsed.page <= 1}
              onClick={() => onPageChange?.(parsed.page - 1)}
            >
              Previous
            </Button>
            <span>Page {parsed.page}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={parsed.page * parsed.pageSize >= parsed.total}
              onClick={() => onPageChange?.(parsed.page + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CandidateSelect({
  label,
  value,
  options,
  allLabel = "All",
  allowAll = true,
  onChange,
}: {
  label: string
  value: string | null
  options: string[] | Array<readonly [string, string]>
  allLabel?: string
  allowAll?: boolean
  onChange: (value: string | null) => void
}) {
  const entries = options.map((option) =>
    typeof option === "string" ? ([option, option] as const) : option
  )
  return (
    <label className="grid gap-1 text-xs text-muted-foreground">
      <span>{label}</span>
      <Select
        value={value ?? ALL}
        onValueChange={(next) => next && onChange(next === ALL ? null : next)}
      >
        <SelectTrigger className="w-full" aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {allowAll ? <SelectItem value={ALL}>{allLabel}</SelectItem> : null}
          {entries.map(([optionValue, optionLabel]) => (
            <SelectItem key={optionValue} value={optionValue}>
              {optionLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  )
}

function NumericCell({ value, strong = false }: { value: number | null; strong?: boolean }) {
  return (
    <TableCell className="font-mono tabular-nums">
      {strong ? <b>{formatNumber(value)}</b> : formatNumber(value)}
    </TableCell>
  )
}

function formatNumber(value: number | null) {
  if (value == null || !Number.isFinite(value)) return "—"
  return value.toLocaleString(undefined, { maximumSignificantDigits: 6 })
}

function directionLabel(direction: ReportCpInlineCandidate["direction"]) {
  if (direction === "POSITIVE") return "↑ Positive"
  if (direction === "NEGATIVE") return "↓ Negative"
  return "—"
}

function candidateTone(level: ReportCpInlineCandidate["level"]) {
  if (level === "HIGH_TREND") return "good" as const
  if (level === "MEDIUM_TREND") return "watch" as const
  return "neutral" as const
}
