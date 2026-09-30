"use client"

import type { ReactNode } from "react"
import { Maximize2, Minimize2, X } from "lucide-react"

import { LayoutShell } from "@/components/domain/layout-shell"
import { Button } from "@/components/ui/button"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export type ReportPreviewMode = "split" | "fullscreen"

type ReportManagementWorkspaceProps = {
  sidebar: ReactNode
  breadcrumbs: ReactNode
  headerActions?: ReactNode
  list: ReactNode
  selectedReportId?: string
  previewHeader?: ReactNode
  previewActions?: ReactNode
  previewTabs?: ReactNode
  syncStatus?: ReactNode
  previewContent?: ReactNode
  previewMode?: ReportPreviewMode
  onPreviewModeChange?: (mode: ReportPreviewMode) => void
  onPreviewClose?: () => void
  className?: string
}

/**
 * Reusable Report Center management composition.
 *
 * The consumer owns selected report identity, URL/workflow state and all data.
 * This component only arranges the catalog and one controlled preview surface.
 */
export function ReportManagementWorkspace({
  sidebar,
  breadcrumbs,
  headerActions,
  list,
  selectedReportId,
  previewHeader,
  previewActions,
  previewTabs,
  syncStatus,
  previewContent,
  previewMode = "split",
  onPreviewModeChange,
  onPreviewClose,
  className,
}: ReportManagementWorkspaceProps) {
  const hasPreview = Boolean(selectedReportId)
  const previewSurface = hasPreview ? (
    <section className="flex h-full min-h-0 min-w-0 flex-col bg-background">
      <header className="flex min-h-14 shrink-0 items-center gap-3 border-b px-4">
        <div className="min-w-0 flex-1">{previewHeader}</div>
        {previewActions ? (
          <div className="flex items-center gap-1">{previewActions}</div>
        ) : null}
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label={previewMode === "fullscreen" ? "退出全屏" : "全屏预览"}
          onClick={() =>
            onPreviewModeChange?.(
              previewMode === "fullscreen" ? "split" : "fullscreen"
            )
          }
        >
          {previewMode === "fullscreen" ? <Minimize2 /> : <Maximize2 />}
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="关闭报告预览"
          onClick={onPreviewClose}
        >
          <X />
        </Button>
      </header>
      {previewTabs || syncStatus ? (
        <div className="flex min-h-12 shrink-0 items-center gap-3 border-b px-4">
          <div className="min-w-0 flex-1">{previewTabs}</div>
          {syncStatus}
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-auto">{previewContent}</div>
    </section>
  ) : null

  return (
    <LayoutShell
      defaultOpen
      sidebarWidth="18rem"
      className={cn("h-screen", className)}
    >
      {sidebar}
      <LayoutShell.Main className="min-h-0 min-w-0">
        <LayoutShell.Header>
          <LayoutShell.Trigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          {breadcrumbs}
          {headerActions ? (
            <LayoutShell.HeaderActions>{headerActions}</LayoutShell.HeaderActions>
          ) : null}
        </LayoutShell.Header>
        <LayoutShell.Content className="min-h-0 overflow-hidden">
          {!hasPreview ? (
            <div className="min-h-0 flex-1 p-4 lg:p-6">{list}</div>
          ) : previewMode === "fullscreen" ? (
            <div className="min-h-0 flex-1 p-4 lg:p-6">{list}</div>
          ) : (
            <>
              <div className="hidden min-h-0 flex-1 md:block">
                <ResizablePanelGroup orientation="horizontal">
                  <ResizablePanel defaultSize={42} minSize={28} className="min-w-0">
                    <div className="h-full min-h-0 p-4 pr-2 lg:p-6 lg:pr-3">
                      {list}
                    </div>
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={58} minSize={36} className="min-w-0">
                    {previewSurface}
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
              <div className="min-h-0 flex-1 md:hidden">{previewSurface}</div>
            </>
          )}
        </LayoutShell.Content>
      </LayoutShell.Main>

      {hasPreview && previewMode === "fullscreen" ? (
        <div className="fixed inset-0 z-50 bg-background">{previewSurface}</div>
      ) : null}
    </LayoutShell>
  )
}
