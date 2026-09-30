"use client"

import { Download, History, RotateCcw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  reportVersionControlInputSchema,
  type ReportVersionControlInput,
} from "@/schemas/domain-component-inputs"

type ReportVersionControlProps = {
  input: ReportVersionControlInput
  onVersionSelect?: (versionId: string) => void
  onCurrentVersionSelect?: () => void
  onDownload?: (versionId: string) => void
  className?: string
}

export function ReportVersionControl({
  input,
  onVersionSelect,
  onCurrentVersionSelect,
  onDownload,
  className,
}: ReportVersionControlProps) {
  const parsedInput = reportVersionControlInputSchema.parse(input)
  const currentVersion = parsedInput.versions.find((version) => version.isCurrent)
  const selectedVersion =
    parsedInput.versions.find(
      (version) => version.versionId === parsedInput.selectedVersionId
    ) ?? currentVersion
  const viewingHistory = Boolean(selectedVersion && !selectedVersion.isCurrent)
  const canDownload = Boolean(
    selectedVersion?.downloadAvailable && onDownload
  )

  if (parsedInput.status === "loading") {
    return <Skeleton className={cn("h-8 w-44", className)} />
  }

  if (parsedInput.status === "error") {
    return (
      <Badge variant="outline" className={cn("text-destructive", className)}>
        {parsedInput.errorMessage ?? "版本历史读取失败"}
      </Badge>
    )
  }

  if (!selectedVersion) {
    return (
      <Badge variant="outline" className={className}>
        暂无版本记录
      </Badge>
    )
  }

  return (
    <div className={cn("not-prose domain-ui-typography grid gap-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="min-w-40 justify-between">
                <span className="flex items-center gap-2">
                  <History />
                  {selectedVersion.versionLabel}
                </span>
                {selectedVersion.isCurrent ? (
                  <Badge variant="secondary">当前</Badge>
                ) : null}
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>报告版本</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {parsedInput.versions.map((version) => (
              <DropdownMenuItem
                key={version.versionId}
                className="items-start py-2"
                onClick={() =>
                  version.isCurrent
                    ? onCurrentVersionSelect?.()
                    : onVersionSelect?.(version.versionId)
                }
              >
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 font-medium">
                    {version.versionLabel}
                    {version.isCurrent ? (
                      <Badge variant="secondary">当前</Badge>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {version.generatedAt}
                    {version.generatedBy ? ` · ${version.generatedBy}` : ""}
                  </span>
                  {version.note ? (
                    <span className="mt-1 block truncate text-xs text-muted-foreground">
                      {version.note}
                    </span>
                  ) : null}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                <span>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    aria-label={`下载 ${selectedVersion.versionLabel}`}
                    disabled={!canDownload}
                    onClick={() => onDownload?.(selectedVersion.versionId)}
                  >
                    <Download />
                  </Button>
                </span>
              }
            />
            <TooltipContent>
              {canDownload
                ? `下载 ${selectedVersion.versionLabel}`
                : selectedVersion.downloadUnavailableReason ?? "下载能力尚未接入"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {viewingHistory ? (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <span className="min-w-0 flex-1">
            正在查看历史版本 {selectedVersion.versionLabel}，页面数据必须来自该版本的不可变快照。
          </span>
          <Button
            size="sm"
            variant="outline"
            className="border-amber-300 bg-background"
            disabled={!currentVersion || !onCurrentVersionSelect}
            onClick={onCurrentVersionSelect}
          >
            <RotateCcw />
            返回当前版本
          </Button>
        </div>
      ) : null}
    </div>
  )
}
