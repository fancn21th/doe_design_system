"use client"

import { reportCpInlineScenarios } from "@/components/domain/report-cp-inline.scenarios"
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
  reportCpInlineInputSchema,
  type ReportCpInlineInput,
} from "@/schemas/domain-component-inputs"

type ReportCpInlineProps = {
  input?: ReportCpInlineInput
  className?: string
}

export function ReportCpInline({
  input = reportCpInlineScenarios.normal.input,
  className,
}: ReportCpInlineProps) {
  const scenarioInput = reportCpInlineScenarios.normal.input
  const parsedInput = reportCpInlineInputSchema.parse(input)
  const rows = parsedInput.rows ?? scenarioInput.rows ?? []

  return (
    <ReportCard
      title={parsedInput.title ?? scenarioInput.title ?? "CP x Inline"}
      subtitle={parsedInput.subtitle ?? scenarioInput.subtitle}
      sourceLabel={parsedInput.sourceLabel ?? scenarioInput.sourceLabel}
      className={className}
    >
      {rows.length === 0 ? (
        <EmptyState>暂无 CP x Inline 数据</EmptyState>
      ) : (
        <div className="grid gap-4 p-4">
          <div className="grid gap-2 md:grid-cols-3">
            <ReportBadge tone="neutral">Step: {parsedInput.step}</ReportBadge>
            <ReportBadge tone="neutral">
              Inline: {parsedInput.inlineParameter}
            </ReportBadge>
            <ReportBadge tone="neutral">CP: {parsedInput.cpParameter}</ReportBadge>
          </div>
          <section className="grid gap-3 md:grid-cols-2">
            <WaferScope title="Baseline" wafers={parsedInput.baselineWafers ?? []} />
            <WaferScope title="Split" wafers={parsedInput.splitWafers ?? []} />
          </section>
          <div className="overflow-hidden rounded-lg border">
            <Table className="min-w-[60rem]">
              <TableHeader>
                <TableRow>
                  <TableHead>Stage</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>BSL/Split</TableHead>
                  <TableHead>Inline-Metrology Wafers</TableHead>
                  <TableHead>CP-Tested Wafers</TableHead>
                  <TableHead>Mean(Inline)</TableHead>
                  <TableHead>Median(Inline)</TableHead>
                  <TableHead>Mean(CP)</TableHead>
                  <TableHead>Median(CP)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={`${row.stage}-${row.condition}-${row.role}`}>
                    <TableCell>{row.stage}</TableCell>
                    <TableCell>{row.condition}</TableCell>
                    <TableCell>
                      <ReportBadge tone={row.role === "BSL" ? "good" : "neutral"}>
                        {row.role}
                      </ReportBadge>
                    </TableCell>
                    <TableCell>{row.inlineWafers}</TableCell>
                    <TableCell>{row.cpWafers}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {formatCompactNumber(row.meanInline)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {formatCompactNumber(row.medianInline)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {formatCompactNumber(row.meanCp)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {formatCompactNumber(row.medianCp)}
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

function WaferScope({ title, wafers }: { title: string; wafers: string[] }) {
  return (
    <div className="rounded-lg border p-3">
      <b className="text-sm">{title}</b>
      <div className="mt-3 flex flex-wrap gap-2">
        {wafers.map((wafer) => (
          <ReportBadge key={wafer} tone="neutral">{wafer}</ReportBadge>
        ))}
      </div>
    </div>
  )
}
