"use client"

import { useState } from "react"
import { ChevronUp, Clock3, MoreHorizontal, Plus, Send } from "lucide-react"

import { createStepRowFromCandidate } from "@/components/domain/steps.fixtures"
import { stepsScenarios } from "@/components/domain/steps.scenarios"
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
import { Input } from "@/components/ui/input"
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
import {
  stepsInputSchema,
  type StepCandidate,
  type StepRow,
  type StepsInput,
} from "@/schemas/domain-component-inputs"

const recipePlaceholder = "选择Recipe"
const recipePlaceholderValue = "__recipe_placeholder__"

export function Steps({ input = stepsScenarios.normal.input }: { input?: StepsInput }) {
  const scenarioInput = stepsScenarios.normal.input
  const parsedInput = stepsInputSchema.parse(input)
  const [rows, setRows] = useState<StepRow[]>(
    parsedInput.rows ?? scenarioInput.rows ?? []
  )
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const candidates = parsedInput.candidates ?? scenarioInput.candidates ?? []
  const waferCount = parsedInput.waferCount ?? scenarioInput.waferCount ?? 25

  const waferColumns = Array.from({ length: waferCount }, (_, index) => index + 1)

  function addCandidate(candidate: StepCandidate) {
    setRows((currentRows) => [
      ...currentRows,
      {
        ...createStepRowFromCandidate(candidate, waferCount),
        id: `added-${candidate.id}-${currentRows.length + 1}`,
      },
    ])
    setAddMenuOpen(false)
  }

  function updateRow(rowId: string, patch: Partial<StepRow>) {
    setRows((currentRows) =>
      currentRows.map((row) => {
        if (row.id !== rowId) {
          return row
        }

        return { ...row, ...patch }
      })
    )
  }

  return (
    <DomainSection title="Step × Wafer Split Table">
      <div className="space-y-5 p-6">
        <div className="flex items-center justify-between gap-3">
          <DropdownMenu open={addMenuOpen} onOpenChange={setAddMenuOpen}>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="lg"
                  className="min-w-40 justify-between"
                >
                  {addMenuOpen ? (
                    <>
                      选择Stage / Step
                      <ChevronUp />
                    </>
                  ) : (
                    <>
                      <Plus />
                      新增Step
                    </>
                  )}
                </Button>
              }
            />
            <DropdownMenuContent className="w-80 p-2">
              {candidates.map((candidate, index) => (
                <DropdownMenuItem
                  key={candidate.id}
                  className="px-3 py-3 text-base"
                  onClick={() => addCandidate(candidate)}
                >
                  <span className={index === 1 ? "font-semibold text-primary" : "font-semibold"}>
                    {candidate.stage}
                    <span className="mx-2 text-muted-foreground">/</span>
                    <span className="font-mono">{candidate.step}</span>
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

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
                {waferColumns.map((index) => (
                  <TableHead key={index} className="text-center text-base">
                    #{index}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-base font-semibold text-primary">
                    {row.stage}
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-44 items-center gap-3">
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
                    <Checkbox defaultChecked={row.baseline} aria-label={`${row.id} baseline`} />
                  </TableCell>
                  <TableCell>
                    {row.editable ? (
                      <Input
                        value={row.condition}
                        placeholder="Condition"
                        className="h-9 min-w-28"
                        onChange={(event) =>
                          updateRow(row.id, { condition: event.target.value })
                        }
                      />
                    ) : (
                      <span className="text-base">{row.condition}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {row.editable ? (
                      <Input
                        value={row.factor}
                        placeholder="Factor"
                        className="h-9 min-w-24"
                        onChange={(event) =>
                          updateRow(row.id, { factor: event.target.value })
                        }
                      />
                    ) : (
                      <span className="text-base">{row.factor}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {row.editable ? (
                      <Select
                        value={row.recipe || recipePlaceholderValue}
                        onValueChange={(recipe) =>
                          updateRow(row.id, {
                            recipe:
                              recipe === recipePlaceholderValue ? "" : recipe ?? "",
                          })
                        }
                      >
                        <SelectTrigger className="h-9 min-w-44">
                          <SelectValue>
                            {row.recipe || recipePlaceholder}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent align="start" className="min-w-48">
                          <SelectItem value={recipePlaceholderValue}>
                            {recipePlaceholder}
                          </SelectItem>
                          {row.recipeOptions.map((recipe) => (
                            <SelectItem key={recipe} value={recipe}>
                              {recipe}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-base">{row.recipe}</span>
                    )}
                  </TableCell>
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
