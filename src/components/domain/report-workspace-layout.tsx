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
    <LayoutShell defaultOpen sidebarWidth="18rem" className={scrollContent ? "h-screen" : undefined}>
      {sidebar}
      <LayoutShell.Main>
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
        <LayoutShell.Content className={scrollContent ? "min-h-0" : undefined}>
          <div className="flex min-h-12 shrink-0 items-center gap-3 border-b px-4 lg:px-6">
            <div className="min-w-0 flex-1">{tabs}</div>
            {syncStatus}
          </div>
          <LayoutShell.ContentStack className={scrollContent ? "min-h-0 overflow-y-auto" : undefined}>
            {children}
          </LayoutShell.ContentStack>
        </LayoutShell.Content>
      </LayoutShell.Main>
    </LayoutShell>
  )
}
