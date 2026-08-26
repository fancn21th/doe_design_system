import { runCardHistoryScenarios } from "@/components/domain/runcard-history.scenarios"
import { DomainSection, StatusBadge } from "@/components/domain/shared"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  runCardHistoryInputSchema,
  type RunCardHistoryInput,
} from "@/schemas/domain-component-inputs"

export function RunCardHistory({
  input = runCardHistoryScenarios.normal.input,
}: {
  input?: RunCardHistoryInput
}) {
  const scenarioInput = runCardHistoryScenarios.normal.input
  const parsedInput = runCardHistoryInputSchema.parse(input)
  const events = parsedInput.events ?? scenarioInput.events ?? []

  return (
    <DomainSection title="MES事件记录">
      <div className="p-6">
        {events.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            暂无MES事件记录
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {["RunCard ID", "时间", "Step", "状态", "描述", "操作人"].map((head) => (
                  <TableHead key={head}>
                    {head}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={`${event.runCardId}-${event.time}-${event.step}`}>
                  <TableCell className="font-mono font-semibold">
                    {event.runCardId}
                  </TableCell>
                  <TableCell className="font-mono">{event.time}</TableCell>
                  <TableCell>{event.step}</TableCell>
                  <TableCell>
                    <StatusBadge status={event.status} />
                  </TableCell>
                  <TableCell>{event.description}</TableCell>
                  <TableCell>{event.operator}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </DomainSection>
  )
}
