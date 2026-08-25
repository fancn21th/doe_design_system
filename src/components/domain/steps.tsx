import { Clock3, MoreHorizontal, Plus, Send } from "lucide-react"

import { stepsFixture } from "@/components/domain/fixtures"
import { AssignmentBadge, DomainSection } from "@/components/domain/shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { stepsInputSchema, type StepsInput } from "@/schemas/domain-component-inputs"

export function Steps({ input = {} }: { input?: StepsInput }) {
  stepsInputSchema.parse(input)

  return (
    <DomainSection title="Step × Wafer Split Table">
      <div className="space-y-5 p-6">
        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" size="lg">
            <Plus />
            新增Step
          </Button>
          <Button variant="outline" size="lg">
            选择模板
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {["Stage", "Step / Seq", "Baseline", "Condition", "Factor", "Recipe", "操作"].map((head) => (
                  <TableHead key={head} className="text-base">
                    {head}
                  </TableHead>
                ))}
                {Array.from({ length: 12 }, (_, index) => (
                  <TableHead key={index} className="text-center text-base">
                    #{index + 1}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {stepsFixture.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-base font-semibold text-primary">
                    {row.stage}
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-36 items-center gap-3">
                      <Badge
                        variant="outline"
                        className="size-6 rounded-full border-orange-100 bg-orange-50 p-0 text-orange-600"
                      >
                        <Clock3 className="size-3.5" />
                      </Badge>
                      <div className="leading-tight">
                        <div className="text-base font-semibold">{row.step}</div>
                        <div className="font-mono text-sm text-muted-foreground">
                          {row.seq}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Checkbox checked={row.baseline} aria-label={`${row.id} baseline`} />
                  </TableCell>
                  <TableCell className="text-base">{row.condition}</TableCell>
                  <TableCell className="text-base">{row.factor}</TableCell>
                  <TableCell className="text-base">{row.recipe}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="icon-sm" variant="ghost">
                        <Plus />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button size="icon-sm" variant="ghost">
                              <MoreHorizontal />
                            </Button>
                          }
                        />
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Send />
                            下发step
                          </DropdownMenuItem>
                          <DropdownMenuItem>AddTime</DropdownMenuItem>
                          <DropdownMenuItem>SPEC配置</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive">删除</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                  {row.assignments.map((assignment, index) => (
                    <TableCell key={`${row.id}-${index}`} className="text-center">
                      <AssignmentBadge value={assignment} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-4 text-base text-muted-foreground">
            {[
              ["B", "Baseline"],
              ["V", "Variant"],
              ["↔", "Assigned to another Variant"],
              ["E", "Excluded"],
            ].map(([value, label]) => (
              <span key={value} className="flex items-center gap-2">
                <AssignmentBadge value={value} />
                {label}
              </span>
            ))}
          </div>
          <Button size="lg">
            <Send />
            下发配置
          </Button>
        </div>
      </div>
    </DomainSection>
  )
}
