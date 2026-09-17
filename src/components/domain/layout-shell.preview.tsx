"use client"

import { useState } from "react"
import {
  BookOpen,
  ChevronLeft,
  FlaskConical,
  LayoutTemplate,
  Plus,
  RefreshCw,
  Search,
  Share2,
} from "lucide-react"

import { LayoutShell } from "@/components/domain/layout-shell"
import { ReportWorkspaceLayout } from "@/components/domain/report-workspace-layout"
import {
  layoutShellReportFixture,
  layoutShellSidebarFixture,
} from "@/components/domain/layout-shell.fixtures"
import { ChartAreaInteractive } from "@/registry/new-york-v4/blocks/dashboard-01/components/chart-area-interactive"
import { DataTable } from "@/registry/new-york-v4/blocks/dashboard-01/components/data-table"
import { SectionCards } from "@/registry/new-york-v4/blocks/dashboard-01/components/section-cards"
import data from "@/registry/new-york-v4/blocks/dashboard-01/data.json"
import { Button } from "@/registry/new-york-v4/ui/button"
import { Input } from "@/registry/new-york-v4/ui/input"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/registry/new-york-v4/ui/sidebar"
import { Tabs, TabsList, TabsTrigger } from "@/registry/new-york-v4/ui/tabs"

const statusClassNames = {
  进行中: "text-sky-700",
  已暂停: "text-orange-700",
  已完成: "text-emerald-700",
  已终止: "text-rose-700",
}

/**
 * dashboard-01 is the complete layout reference. Only its left navigation
 * content is replaced with the fixed DOE trial navigation fixture.
 */
export function LayoutShellDoePreview() {
  const [searchValue, setSearchValue] = useState("")
  const visibleTrials = layoutShellSidebarFixture.trials.filter((trial) =>
    `${trial.name} ${trial.lotId}`
      .toLocaleLowerCase()
      .includes(searchValue.toLocaleLowerCase())
  )

  return (
    <ReportWorkspaceLayout
      sidebar={(
        <LayoutShell.Sidebar variant="inset">
        <LayoutShell.SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip={layoutShellSidebarFixture.title}>
                <ChevronLeft />
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <FlaskConical className="size-4" />
                </div>
                <span className="font-medium">{layoutShellSidebarFixture.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </LayoutShell.SidebarHeader>
        <LayoutShell.SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    size="lg"
                    className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                    tooltip="新建DOE试验"
                  >
                    <Plus />
                    <span>新建DOE试验</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="模板库">
                    <LayoutTemplate />
                    <span>模板库</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="知识库">
                    <BookOpen />
                    <span>知识库</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>历史试验</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="relative mb-2">
                <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50" />
                <Input
                  aria-label="搜索历史试验"
                  className="h-8 bg-background pl-8 shadow-none"
                  value={searchValue}
                  placeholder={layoutShellSidebarFixture.searchPlaceholder}
                  onChange={(event) => setSearchValue(event.target.value)}
                />
              </div>
              <SidebarMenu>
                {visibleTrials.map((trial) => (
                  <SidebarMenuItem key={trial.id}>
                    <SidebarMenuButton
                      isActive={trial.active}
                      className="h-auto items-start py-2"
                      tooltip={trial.name}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{trial.name}</span>
                        <span className="mt-1 flex items-center justify-between gap-2 font-mono text-xs text-muted-foreground">
                          <span className="truncate">Lot ID · {trial.lotId}</span>
                          <span className={statusClassNames[trial.status]}>
                            {trial.status}
                          </span>
                        </span>
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </LayoutShell.SidebarContent>
        <LayoutShell.SidebarFooter />
        <SidebarRail />
        </LayoutShell.Sidebar>
      )}
      breadcrumbs={(
        <nav aria-label="当前位置" className="min-w-0">
            <ol className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
              <li className="hidden truncate md:block">DOE试验设计</li>
              <li aria-hidden="true" className="hidden text-muted-foreground/60 md:block">
                /
              </li>
              <li className="truncate">{layoutShellReportFixture.trialName}</li>
              <li aria-hidden="true" className="text-muted-foreground/60">
                /
              </li>
              <li aria-current="page" className="truncate font-medium text-foreground">
                {layoutShellReportFixture.reportName}
              </li>
            </ol>
        </nav>
      )}
      headerActions={(
        <>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            <Share2 />
            分享
          </Button>
          <Button size="sm">导出报告</Button>
        </>
      )}
      tabs={(
        <Tabs defaultValue="overview" className="min-w-0 w-full">
          <TabsList
            variant="line"
            aria-label="实验报告栏目"
            className="h-12 w-full justify-start overflow-x-auto rounded-none p-0"
          >
            {layoutShellReportFixture.tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="h-full flex-none px-3 text-sm after:bottom-0!"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}
      syncStatus={(
        <div className="hidden shrink-0 items-center gap-3 text-sm text-muted-foreground xl:flex">
          <span>最后同步时间：{layoutShellReportFixture.lastSyncedAt}</span>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="刷新报告数据"
            title="刷新报告数据"
          >
            <RefreshCw />
          </Button>
        </div>
      )}
    >
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </ReportWorkspaceLayout>
  )
}
