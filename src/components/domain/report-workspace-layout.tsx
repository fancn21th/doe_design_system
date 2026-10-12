"use client"

import type { ReactNode } from "react"

import { LayoutShell } from "@/components/domain/layout-shell"
import { Separator } from "@/registry/new-york-v4/ui/separator"

/**
 * The report-workspace composition used by the Layout Shell preview.
 *
 * This asset owns only the fixed workspace regions. Applications inject
 * source-aware navigation, breadcrumbs, actions, report-tab interaction, and
 * report content through slots; no fixture data or application workflow lives
 * here.
 */
export function ReportWorkspaceLayout({
  sidebar,
  breadcrumbs,
  headerActions,
  tabs,
  syncStatus,
  children,
  scrollContent = false,
}: {
  sidebar: ReactNode
  breadcrumbs: ReactNode
  headerActions?: ReactNode
  tabs: ReactNode
  syncStatus?: ReactNode
  children: ReactNode
  /** App shells with a viewport-bounded body can opt into one content scroller. */
  scrollContent?: boolean
}) {
  return (
    <LayoutShell defaultOpen sidebarWidth="18rem" className={`[--doe-report-workspace-gutter:16px] lg:[--doe-report-workspace-gutter:24px] ${scrollContent ? "h-screen" : ""}`}>
      {sidebar}
      <LayoutShell.Main>
        <LayoutShell.Header className="px-(--doe-report-workspace-gutter)!">
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
        <LayoutShell.Content className={scrollContent ? "min-h-0" : undefined}>
          <div data-report-navigation className="flex h-12 shrink-0 items-center gap-3 border-b px-(--doe-report-workspace-gutter) [&_[data-slot=tabs-list]]:gap-0! [&_[data-slot=tabs-list]]:p-0! [&_[data-slot=tabs-trigger]]:border-x-0! [&_[data-slot=tabs-trigger]]:px-0! [&_[data-slot=tabs-trigger]]:mr-[30px] [&_[data-slot=tabs-trigger]:last-child]:mr-0">
            <div className="min-w-0 flex-1 self-stretch">{tabs}</div>
            {syncStatus}
          </div>
          <LayoutShell.ContentStack className={`domain-ui-report-content [&_.domain-ui-report-pane]:px-(--doe-report-workspace-gutter) ${scrollContent ? "min-h-0 overflow-y-auto" : ""}`}>
            {children}
          </LayoutShell.ContentStack>
        </LayoutShell.Content>
      </LayoutShell.Main>
    </LayoutShell>
  )
}
