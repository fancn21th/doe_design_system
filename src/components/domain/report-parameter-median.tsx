"use client"

import { reportParameterMedianScenarios } from "@/components/domain/report-parameter-median.scenarios"
import {
  EmptyState,
  ReportBadge,
  ReportCard,
  formatCompactNumber,
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
  reportParameterMedianInputSchema,
  type ReportParameterMedianInput,
} from "@/schemas/domain-component-inputs"

type ReportParameterMedianProps = {
  input?: ReportParameterMedianInput
  className?: string
}

export function ReportParameterMedian({
  input = reportParameterMedianScenarios.normal.input,
  className,
}: ReportParameterMedianProps) {
  const scenarioInput = reportParameterMedianScenarios.normal.input
  const parsedInput = reportParameterMedianInputSchema.parse(input)
  const rows = parsedInput.rows ?? scenarioInput.rows ?? []
  const waferIds = Array.from(
    new Set(rows.flatMap((row) => row.wafers.map((wafer) => wafer.waferId)))
  )

  return (
    <ReportCard
      title={parsedInput.title ?? scenarioInput.title ?? "Parameter Median"}
      subtitle={parsedInput.subtitle ?? scenarioInput.subtitle}
      sourceLabel={parsedInput.sourceLabel ?? scenarioInput.sourceLabel}
      className={className}
    >
      {rows.length === 0 ? (
        <EmptyState>暂无 Parameter Median 数据</EmptyState>
      ) : (
        <div className="grid gap-3 p-4">
          <div className="flex flex-wrap gap-2">
            <ReportBadge tone="neutral">
              CP Parameter: {parsedInput.selectedParameterId ?? "All"}
            </ReportBadge>
            <ReportBadge tone="bad">CPK &lt; 1.33</ReportBadge>
            <ReportBadge tone="watch">1.33 &lt;= CPK &lt; 1.67</ReportBadge>
            <ReportBadge tone="good">CPK &gt;= 1.67</ReportBadge>
          </div>
          <div className="overflow-hidden rounded-lg border">
            <Table className="min-w-[62rem]">
              <TableHeader>
                <TableRow>
                  <TableHead>CP Parameter</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Mock LSL</TableHead>
                  <TableHead>Mock USL</TableHead>
                  {waferIds.map((waferId) => (
                    <TableHead key={waferId}>{waferId}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.parameter}>
                    <TableCell className="font-mono text-xs">{row.parameter}</TableCell>
                    <TableCell>{row.unit}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {formatCompactNumber(row.lsl)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {formatCompactNumber(row.usl)}
                    </TableCell>
                    {waferIds.map((waferId) => {
                      const cell = row.wafers.find((item) => item.waferId === waferId)
                      return (
                        <TableCell key={waferId}>
                          {cell ? (
                            <div>
                              <b className="block font-mono text-xs">
                                {formatCompactNumber(cell.value)}
                              </b>
                              <ReportBadge tone={cell.tone}>
                                CPK={cell.cpk.toFixed(2)}
                              </ReportBadge>
                              {cell.lowYield && (
                                <span className="mt-1 block text-[10px] font-semibold text-red-700">
                                  LOW YIELD
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      )
                    })}
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
