"use client"

import type { ReactNode } from "react"
import { Download, Maximize2, Minimize2, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  stageDashboardPanelInputSchema,
  type StageDashboardPanelInput,
} from "@/schemas/domain-component-inputs"

type StageDashboardPanelProps = {
  input: StageDashboardPanelInput
  children?: ReactNode
  fullscreen?: boolean
  onFullscreenChange?: (fullscreen: boolean) => void
  onDownload?: () => void
  onClose?: () => void
  onRetry?: () => void
  className?: string
}

export function StageDashboardPanel({
  input,
  children,
  fullscreen = false,
  onFullscreenChange,
  onDownload,
  onClose,
  onRetry,
  className,
}: StageDashboardPanelProps) {
  const parsedInput = stageDashboardPanelInputSchema.parse(input)
  const surface = (
    <aside
      className={cn(
        "not-prose domain-ui-typography flex h-full min-h-0 min-w-0 flex-col overflow-hidden border-l bg-muted/20",
        className
      )}
    >
      <header className="flex min-h-14 shrink-0 items-center gap-3 border-b bg-background px-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {parsedInput.eyebrow}
          </p>
          <h2 className="truncate font-semibold">
            {parsedInput.stageLabel ?? parsedInput.stageId ?? "Stage Dashboard"}
          </h2>
        </div>
        {parsedInput.state === "ready" ? (
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
            数据已返回
          </Badge>
        ) : null}
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <span>
                    <Button
                      aria-label="下载 Stage Dashboard"
                      size="icon-sm"
                      variant="ghost"
                      disabled={!parsedInput.downloadAvailable || !onDownload}
                      onClick={onDownload}
                    >
                      <Download />
                    </Button>
                  </span>
                }
              />
              <TooltipContent>
                {parsedInput.downloadAvailable && onDownload
                  ? "下载 Stage Dashboard"
                  : parsedInput.downloadUnavailableReason ?? "下载能力尚未接入"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            aria-label={fullscreen ? "退出全屏" : "全屏"}
            size="icon-sm"
            variant="ghost"
            onClick={() => onFullscreenChange?.(!fullscreen)}
          >
            {fullscreen ? <Minimize2 /> : <Maximize2 />}
          </Button>
          <Button
            aria-label="关闭 Stage Dashboard"
            size="icon-sm"
            variant="ghost"
            onClick={onClose}
          >
            <X />
          </Button>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-auto">
        <StageDashboardBody input={parsedInput} onRetry={onRetry}>
          {children}
        </StageDashboardBody>
      </div>
    </aside>
  )

  if (!fullscreen) {
    return surface
  }

  return (
    <Dialog open onOpenChange={(open) => onFullscreenChange?.(open)}>
      <DialogContent
        showCloseButton={false}
        className="inset-3 h-auto w-auto max-w-none translate-x-0 translate-y-0 gap-0 overflow-hidden rounded-xl bg-background p-0"
      >
        <DialogTitle className="sr-only">
          {parsedInput.stageLabel ?? parsedInput.stageId ?? "Stage Dashboard"}
        </DialogTitle>
        {surface}
      </DialogContent>
    </Dialog>
  )
}

function StageDashboardBody({
  input,
  onRetry,
  children,
}: {
  input: StageDashboardPanelInput
  onRetry?: () => void
  children?: ReactNode
}) {
  if (input.state === "loading") {
    return (
      <div className="grid gap-4 p-5" aria-label="正在加载 Stage Dashboard">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-52 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (input.state === "error") {
    return (
      <div className="p-5">
        <div className="rounded-lg border border-destructive/30 bg-background p-5">
          <h2 className="font-semibold">Stage Dashboard 读取失败</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {input.errorMessage ?? "请稍后重试。"}
          </p>
          <Button className="mt-4" variant="outline" disabled={!onRetry} onClick={onRetry}>
            重试
          </Button>
        </div>
      </div>
    )
  }

  if (input.state === "empty") {
    return (
      <div className="p-5">
        <div className="rounded-lg border border-dashed bg-background p-5 text-sm text-muted-foreground">
          {input.message ?? "该 Stage 暂无可展示的数据。"}
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 p-4">
      {input.message ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
          {input.message}
        </div>
      ) : null}
      {children}
    </div>
  )
}
