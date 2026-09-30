"use client"

import { useState } from "react"

import { LayoutShell } from "@/components/domain/layout-shell"
import { ReportManagementList } from "@/components/domain/report-management-list"
import { ReportManagementWorkspace } from "@/components/domain/report-management-workspace"
import {
  reportManagementListFixture,
  reportVersionControlFixture,
} from "@/components/domain/report-management.fixtures"
import { ReportVersionControl } from "@/components/domain/report-version-control"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function ReportManagementPreview() {
  const [selectedReportId, setSelectedReportId] = useState<string>()
  const [previewMode, setPreviewMode] = useState<"split" | "fullscreen">("split")
  const [selectedVersionId, setSelectedVersionId] = useState(
    reportVersionControlFixture.selectedVersionId
  )
  const selectedReport = reportManagementListFixture.reports.find(
    (report) => report.sourceId === selectedReportId
  )

  return (
    <ReportManagementWorkspace
      className="h-[42rem]"
      sidebar={
        <LayoutShell.Sidebar variant="inset">
          <LayoutShell.SidebarHeader>
            <div className="rounded-lg border bg-background p-3">
              <b>DOE Workbench</b>
              <p className="text-xs text-muted-foreground">Report Center</p>
            </div>
          </LayoutShell.SidebarHeader>
          <LayoutShell.SidebarContent className="p-3 text-sm text-muted-foreground">
            报告目录由 App 注入；此处仅演示布局插槽。
          </LayoutShell.SidebarContent>
        </LayoutShell.Sidebar>
      }
      breadcrumbs={<span className="font-medium">Report Center</span>}
      headerActions={<Badge variant="outline">Domain UI Preview</Badge>}
      list={
        <ReportManagementList
          className="h-full"
          input={{
            ...reportManagementListFixture,
            selectedSourceId: selectedReportId,
          }}
          onSelect={setSelectedReportId}
        />
      }
      selectedReportId={selectedReportId}
      previewMode={previewMode}
      onPreviewModeChange={setPreviewMode}
      onPreviewClose={() => {
        setSelectedReportId(undefined)
        setPreviewMode("split")
      }}
      previewHeader={
        <div>
          <p className="truncate font-semibold">{selectedReport?.label}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {selectedReport?.lotId}
          </p>
        </div>
      }
      previewActions={<Badge variant="outline">只读快照</Badge>}
      previewTabs={
        <div className="flex gap-1">
          <Button size="sm" variant="secondary">Overview</Button>
          <Button size="sm" variant="ghost">Split Table</Button>
          <Button size="sm" variant="ghost">Yield</Button>
        </div>
      }
      syncStatus={<span className="text-xs text-muted-foreground">已同步</span>}
      previewContent={
        <div className="grid gap-4 p-4">
          <ReportVersionControl
            input={{ ...reportVersionControlFixture, selectedVersionId }}
            onVersionSelect={setSelectedVersionId}
            onCurrentVersionSelect={() =>
              setSelectedVersionId(
                reportVersionControlFixture.versions.find((version) => version.isCurrent)
                  ?.versionId
              )
            }
          />
          <div className="rounded-xl border bg-background p-6">
            <h2 className="text-lg font-semibold">报告预览内容</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              App 在此插入选中 source/version 对应的 Report tab，不由工作区组件请求数据。
            </p>
          </div>
        </div>
      }
    />
  )
}
