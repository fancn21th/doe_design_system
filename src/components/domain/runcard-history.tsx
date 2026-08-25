import { runCardEventsFixture } from "@/components/domain/fixtures"
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

export function RunCardHistory({ input = {} }: { input?: RunCardHistoryInput }) {
  runCardHistoryInputSchema.parse(input)

  return (
    <DomainSection title="MES事件记录">
      <div className="p-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {["RunCard ID", "时间", "Step", "状态", "描述", "操作人"].map((head) => (
                <TableHead key={head} className="text-base">
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {runCardEventsFixture.map(([runCardId, time, step, status, description, operator]) => (
              <TableRow key={`${runCardId}-${time}`}>
                <TableCell className="font-mono text-base font-semibold">{runCardId}</TableCell>
                <TableCell className="font-mono text-base">{time}</TableCell>
                <TableCell className="text-base">{step}</TableCell>
                <TableCell>
                  <StatusBadge status={status} />
                </TableCell>
                <TableCell className="text-base">{description}</TableCell>
                <TableCell className="text-base">{operator}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DomainSection>
  )
}
