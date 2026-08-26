"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  Minus,
  Plus,
  Trash2,
} from "lucide-react"

import { runCardScenarios } from "@/components/domain/runcard.scenarios"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  runCardInputSchema,
  type RunCardGroup,
  type RunCardInput,
  type RunCardReleaseStep,
} from "@/schemas/domain-component-inputs"

const unassignedValue = "__unassigned__"

export type RunCardReleasePayload = {
  selectedStepIds: string[]
  releasedStepIds: string[]
  runCards: RunCardGroup[]
}

type RunCardProps = {
  input?: RunCardInput
  onCancel?: () => void
  onConfirm?: (payload: RunCardReleasePayload) => void
  className?: string
}

export function RunCard({
  input = runCardScenarios.initial.input,
  onCancel,
  onConfirm,
  className,
}: RunCardProps) {
  const scenarioInput = runCardScenarios.initial.input
  const parsedInput = runCardInputSchema.parse(input)
  const steps = parsedInput.steps ?? scenarioInput.steps ?? []
  const [runCards, setRunCards] = useState<RunCardGroup[]>(
    parsedInput.runCards ?? scenarioInput.runCards ?? []
  )
  const [selectedStepIds, setSelectedStepIds] = useState<string[]>(
    parsedInput.selectedStepIds ?? []
  )
  const [releasedStepIds, setReleasedStepIds] = useState<string[]>(
    parsedInput.releasedStepIds ?? []
  )
  const [message, setMessage] = useState("")
  const releasedSet = new Set(releasedStepIds)
  const selectedSet = new Set(selectedStepIds)
  const assignedStepIds = new Set(runCards.flatMap((runCard) => runCard.stepIds))
  const unassignedSteps = steps.filter((step) => !assignedStepIds.has(step.id))
  const selectedCount = selectedStepIds.length

  function stepById(stepId: string) {
    return steps.find((step) => step.id === stepId)
  }

  function availableStepIds(runCard: RunCardGroup) {
    return runCard.stepIds.filter((stepId) => !releasedSet.has(stepId))
  }

  function setStepSelected(stepId: string, checked: boolean) {
    if (releasedSet.has(stepId)) {
      return
    }

    setSelectedStepIds((current) => {
      const next = new Set(current)
      if (checked) {
        next.add(stepId)
      } else {
        next.delete(stepId)
      }
      return [...next]
    })
    setMessage("")
  }

  function setRunCardSelected(runCardId: string, checked: boolean) {
    const runCard = runCards.find((item) => item.id === runCardId)
    if (!runCard) {
      return
    }

    const available = availableStepIds(runCard)
    setSelectedStepIds((current) => {
      const next = new Set(current)
      for (const stepId of available) {
        if (checked) {
          next.add(stepId)
        } else {
          next.delete(stepId)
        }
      }
      return [...next]
    })
    setMessage("")
  }

  function toggleRunCard(runCardId: string) {
    setRunCards((current) =>
      current.map((runCard) =>
        runCard.id === runCardId
          ? { ...runCard, collapsed: !runCard.collapsed }
          : runCard
      )
    )
  }

  function nextRunCardId() {
    const max = runCards.reduce((currentMax, runCard) => {
      const match = /^RC-(\d+)$/.exec(runCard.id)
      return Math.max(currentMax, match ? Number(match[1]) : 0)
    }, 0)

    return `RC-${String(max + 1).padStart(3, "0")}`
  }

  function addRunCard() {
    setRunCards((current) => [
      ...current,
      { id: nextRunCardId(), stepIds: [], collapsed: false },
    ])
    setMessage("已新增RunCard")
  }

  function deleteRunCard(runCardId: string) {
    const runCard = runCards.find((item) => item.id === runCardId)
    if (!runCard) {
      return
    }

    if (runCard.stepIds.length > 0) {
      setMessage("请先将该RunCard下的Step移动到其他RunCard")
      return
    }

    setRunCards((current) => current.filter((item) => item.id !== runCardId))
    setMessage("已删除空RunCard")
  }

  function moveReleaseStep(stepId: string, targetRunCardId: string) {
    if (releasedSet.has(stepId)) {
      return
    }

    setRunCards((current) => {
      const withoutStep = current.map((runCard) => ({
        ...runCard,
        stepIds: runCard.stepIds.filter((id) => id !== stepId),
      }))

      if (targetRunCardId === unassignedValue) {
        return withoutStep
      }

      return withoutStep.map((runCard) =>
        runCard.id === targetRunCardId
          ? { ...runCard, stepIds: [...runCard.stepIds, stepId] }
          : runCard
      )
    })

    if (targetRunCardId === unassignedValue) {
      setSelectedStepIds((current) => current.filter((id) => id !== stepId))
    }

    setMessage("")
  }

  function ownerForStep(stepId: string) {
    return runCards.find((runCard) => runCard.stepIds.includes(stepId))?.id ?? ""
  }

  function confirmRelease() {
    if (selectedStepIds.length === 0) {
      return
    }

    const nextReleasedStepIds = Array.from(
      new Set([...releasedStepIds, ...selectedStepIds])
    )
    const payload = {
      selectedStepIds,
      releasedStepIds: nextReleasedStepIds,
      runCards,
    }

    setReleasedStepIds(nextReleasedStepIds)
    setSelectedStepIds([])
    setMessage(`已提交 ${selectedStepIds.length} 个Step至MES`)
    onConfirm?.(payload)
  }

  return (
    <div className={cn("not-prose domain-ui-typography", className)}>
      <Card className="domain-ui-release-modal mx-auto flex flex-col gap-0 overflow-hidden rounded-xl py-0 shadow-sm">
        <CardHeader className="border-b p-6">
          <CardTitle className="text-2xl">配置RunCard并下发</CardTitle>
        </CardHeader>
        <CardContent className="min-h-0 overflow-auto p-0">
          <div className="space-y-5 p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold">选择本次下发的Step</h3>
              <Button variant="outline" size="lg" onClick={addRunCard}>
                <Plus />
                新增RunCard
              </Button>
            </div>

            <div className="space-y-3" role="tree" aria-label="RunCard下发配置">
              {runCards.map((runCard) => (
                <RunCardNode
                  key={runCard.id}
                  runCard={runCard}
                  selectedSet={selectedSet}
                  releasedSet={releasedSet}
                  allRunCards={runCards}
                  availableStepIds={availableStepIds(runCard)}
                  ownerForStep={ownerForStep}
                  onToggleRunCard={toggleRunCard}
                  onRunCardSelected={setRunCardSelected}
                  onStepSelected={setStepSelected}
                  onMoveStep={moveReleaseStep}
                  onDeleteRunCard={deleteRunCard}
                  stepById={stepById}
                />
              ))}

              {unassignedSteps.length > 0 && (
                <div className="overflow-hidden rounded-lg border bg-background">
                  <div className="grid grid-cols-[auto_auto_1fr_auto_auto] items-center gap-4 bg-muted/40 px-4 py-3">
                    <Checkbox disabled aria-label="未分配Step不可下发" />
                    <span />
                    <b className="font-mono text-base">未分配</b>
                    <span className="text-sm text-muted-foreground">
                      {unassignedSteps.length}个Step
                    </span>
                    <span />
                  </div>
                  <div className="domain-ui-release-tree divide-y px-12">
                    {unassignedSteps.map((step) => (
                      <RunCardStepRow
                        key={step.id}
                        step={step}
                        ownerId=""
                        selected={false}
                        released={false}
                        selectable={false}
                        runCards={runCards}
                        onSelectedChange={() => undefined}
                        onMoveStep={moveReleaseStep}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="flex items-center justify-end gap-3 p-6">
          <span className="mr-auto text-sm text-muted-foreground">
            {message || (selectedCount ? `已选择 ${selectedCount} 个Step` : "未选择Step")}
          </span>
          <Button variant="outline" size="lg" onClick={onCancel}>
            取消
          </Button>
          <Button size="lg" disabled={selectedCount === 0} onClick={confirmRelease}>
            {selectedCount ? `下发 ${selectedCount} 个Step` : "下发所选Step"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function RunCardNode({
  runCard,
  selectedSet,
  releasedSet,
  allRunCards,
  availableStepIds,
  ownerForStep,
  onToggleRunCard,
  onRunCardSelected,
  onStepSelected,
  onMoveStep,
  onDeleteRunCard,
  stepById,
}: {
  runCard: RunCardGroup
  selectedSet: Set<string>
  releasedSet: Set<string>
  allRunCards: RunCardGroup[]
  availableStepIds: string[]
  ownerForStep: (stepId: string) => string
  onToggleRunCard: (runCardId: string) => void
  onRunCardSelected: (runCardId: string, checked: boolean) => void
  onStepSelected: (stepId: string, checked: boolean) => void
  onMoveStep: (stepId: string, targetRunCardId: string) => void
  onDeleteRunCard: (runCardId: string) => void
  stepById: (stepId: string) => RunCardReleaseStep | undefined
}) {
  const releasedCount = runCard.stepIds.filter((stepId) =>
    releasedSet.has(stepId)
  ).length
  const selectedCount = availableStepIds.filter((stepId) =>
    selectedSet.has(stepId)
  ).length
  const allSelected =
    availableStepIds.length > 0 && selectedCount === availableStepIds.length
  const partiallySelected =
    selectedCount > 0 && selectedCount < availableStepIds.length

  return (
    <div
      className="overflow-hidden rounded-lg border bg-background"
      role="treeitem"
      aria-expanded={!runCard.collapsed}
      aria-selected={allSelected}
    >
      <div className="domain-ui-release-tree grid grid-cols-[2rem_2rem_minmax(0,1fr)_auto_2rem] items-center gap-4 bg-muted/40 px-5 py-3">
        <div className="relative">
          <Checkbox
            checked={allSelected}
            disabled={availableStepIds.length === 0}
            indeterminate={partiallySelected}
            aria-label={`选择${runCard.id}下未下发Step`}
            onCheckedChange={(checked) =>
              onRunCardSelected(runCard.id, Boolean(checked))
            }
          />
          {partiallySelected && (
            <Minus className="pointer-events-none absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 text-primary-foreground" />
          )}
        </div>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label={`${runCard.collapsed ? "展开" : "收起"}${runCard.id}`}
          onClick={() => onToggleRunCard(runCard.id)}
        >
          {runCard.collapsed ? <ChevronRight /> : <ChevronDown />}
        </Button>
        <b className="font-mono text-base">{runCard.id}</b>
        <span className="text-sm text-muted-foreground">
          {releasedCount}/{runCard.stepIds.length}已下发
        </span>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label={`删除${runCard.id}`}
          onClick={() => onDeleteRunCard(runCard.id)}
        >
          <Trash2 />
        </Button>
      </div>

      {!runCard.collapsed && (
        <div className="domain-ui-release-tree divide-y px-12" role="group">
          {runCard.stepIds.length === 0 ? (
            <div className="py-5 text-sm text-muted-foreground">暂无Step</div>
          ) : (
            runCard.stepIds.map((stepId) => {
              const step = stepById(stepId)
              if (!step) {
                return null
              }

              return (
                <RunCardStepRow
                  key={step.id}
                  step={step}
                  ownerId={ownerForStep(step.id)}
                  selected={selectedSet.has(step.id)}
                  released={releasedSet.has(step.id)}
                  selectable
                  runCards={allRunCards}
                  onSelectedChange={(checked) =>
                    onStepSelected(step.id, checked)
                  }
                  onMoveStep={onMoveStep}
                />
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

function RunCardStepRow({
  step,
  ownerId,
  selected,
  released,
  selectable,
  runCards,
  onSelectedChange,
  onMoveStep,
}: {
  step: RunCardReleaseStep
  ownerId: string
  selected: boolean
  released: boolean
  selectable: boolean
  runCards: RunCardGroup[]
  onSelectedChange: (checked: boolean) => void
  onMoveStep: (stepId: string, targetRunCardId: string) => void
}) {
  const selectValue = ownerId || unassignedValue

  return (
    <div className="domain-ui-release-step-row grid items-center gap-4 py-4">
      <Checkbox
        checked={selected}
        disabled={released || !selectable}
        aria-label={
          released
            ? `已下发 ${step.stage} ${step.name}`
            : selectable
              ? `选择下发 ${step.stage} ${step.name}`
              : `${step.stage} ${step.name}尚未分配RunCard`
        }
        onCheckedChange={(checked) => onSelectedChange(Boolean(checked))}
      />
      <span className="font-mono text-2xl text-muted-foreground/50">└</span>
      <div className="min-w-0">
        <div className="truncate text-base font-semibold">
          {step.stage} / {step.name}
        </div>
        <div className="min-w-0">
          <span className="text-sm text-muted-foreground">
            {step.seq} · {step.detail}
          </span>
          {released && (
            <Badge variant="outline" className="ml-2 h-6 border-emerald-200 bg-emerald-50 text-emerald-700">
              已下发
            </Badge>
          )}
        </div>
      </div>
      <Select
        value={selectValue}
        onValueChange={(value) =>
          onMoveStep(step.id, value ?? unassignedValue)
        }
        disabled={released}
      >
        <SelectTrigger className="w-full min-w-0">
          <SelectValue>{ownerId || "未分配"}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={unassignedValue}>未分配</SelectItem>
          {runCards.map((runCard) => (
            <SelectItem key={runCard.id} value={runCard.id}>
              {runCard.id}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
