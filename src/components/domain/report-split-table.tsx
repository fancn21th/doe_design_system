"use client"

import { reportSplitTableScenarios } from "@/components/domain/report-split-table.scenarios"
import {
  EmptyState,
  ReportBadge,
  ReportCard,
  formatPercent,
} from "@/components/domain/report-parts"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  reportSplitTableInputSchema,
  type ReportSplitTableInput,
} from "@/schemas/domain-component-inputs"

type ReportSplitTableProps = {
  input?: ReportSplitTableInput
  className?: string
}

export function ReportSplitTable({
  input = reportSplitTableScenarios.normal.input,
  className,
}: ReportSplitTableProps) {
  const scenarioInput = reportSplitTableScenarios.normal.input
  const parsedInput = reportSplitTableInputSchema.parse(input)
  const rows = parsedInput.rows ?? scenarioInput.rows ?? []

  return (
    <ReportCard
      title={parsedInput.title ?? scenarioInput.title ?? "Wafer Split Table"}
      subtitle={parsedInput.subtitle ?? scenarioInput.subtitle}
      sourceLabel={parsedInput.sourceLabel ?? scenarioInput.sourceLabel}
      className={className}
    >
      {rows.length === 0 ? (
        <EmptyState>暂无 Wafer Split Table 数据</EmptyState>
      ) : (
        <div className="p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            <ReportBadge tone="neutral">Stage: 全部</ReportBadge>
            <ReportBadge tone="neutral">Step: 全部</ReportBadge>
          </div>
          <div className="overflow-hidden rounded-lg border">
            <Table className="min-w-[58rem]">
              <TableHeader>
                <TableRow>
                  <TableHead>Wafer ID</TableHead>
                  <TableHead>Stage / Step / Seq</TableHead>
                  <TableHead>Recipe</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Yield</TableHead>
                  <TableHead>Top Fail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.waferId}>
                    <TableCell>
                      <b className="font-mono text-sky-700">{row.waferId}</b>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {row.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span>{row.stage} / {row.step}</span>
                      <span className="block text-xs text-muted-foreground">
                        {row.seq}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.recipe}</TableCell>
                    <TableCell>{row.condition}</TableCell>
                    <TableCell>
                      <ReportBadge tone={row.tone}>{formatPercent(row.yield)}</ReportBadge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-sky-700">
                        {row.topFail}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {row.topFailCount}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </ReportCard>
  )
}
