"use client"

import { useState } from "react"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

import { layoutShellScenarios } from "@/components/domain/layout-shell.scenarios"
import { ReportBadge } from "@/components/domain/report-parts"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  layoutShellInputSchema,
  type LayoutShellInput,
} from "@/schemas/domain-component-inputs"

type LayoutShellProps = {
  input?: LayoutShellInput
  className?: string
}

export function LayoutShell({
  input = layoutShellScenarios.normal.input,
  className,
}: LayoutShellProps) {
  const scenarioInput = layoutShellScenarios.normal.input
  const parsedInput = layoutShellInputSchema.parse(input)
  const [collapsed, setCollapsed] = useState(
    parsedInput.collapsed ?? scenarioInput.collapsed ?? false
  )
  const navItems = parsedInput.navItems ?? scenarioInput.navItems ?? []
  const topLinks = parsedInput.topLinks ?? scenarioInput.topLinks ?? []

  return (
    <div className={cn("not-prose domain-ui-typography", className)}>
      <section
        className={cn(
          "grid min-h-[42rem] overflow-hidden rounded-lg border bg-background",
          collapsed
            ? "grid-cols-[3.5rem_minmax(0,1fr)]"
            : "grid-cols-[17rem_minmax(0,1fr)]"
        )}
      >
        <aside className="border-r bg-muted/25">
          <div className="flex h-14 items-center justify-between gap-2 border-b px-3">
            {!collapsed && (
              <div className="min-w-0">
                <b className="block truncate text-sm">
                  {parsedInput.sidebarTitle ?? scenarioInput.sidebarTitle}
                </b>
                <span className="text-xs text-muted-foreground">Navigation</span>
              </div>
            )}
            <Button
              aria-label={collapsed ? "展开左侧导航" : "收起左侧导航"}
              title={collapsed ? "展开左侧导航" : "收起左侧导航"}
              variant="ghost"
              size="icon-sm"
              onClick={() => setCollapsed((value) => !value)}
            >
              {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </Button>
          </div>
          <nav className="grid gap-1 p-3" aria-label="Layout shell sidebar">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "h-9 rounded-md px-3 text-left text-sm text-muted-foreground",
                  item.active && "bg-sky-50 font-medium text-sky-700",
                  collapsed && "px-0 text-center"
                )}
                title={item.label}
              >
                {collapsed ? item.label.slice(0, 1) : item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">
          <header className="flex min-h-14 items-center justify-between gap-4 border-b px-4">
            <div className="min-w-0">
              <b className="block truncate text-sm">
                {parsedInput.title ?? scenarioInput.title}
              </b>
              {(parsedInput.subtitle ?? scenarioInput.subtitle) && (
                <span className="text-xs text-muted-foreground">
                  {parsedInput.subtitle ?? scenarioInput.subtitle}
                </span>
              )}
            </div>
            <nav className="flex shrink-0 gap-2" aria-label="Layout shell top links">
              {topLinks.map((link) => (
                <ReportBadge key={link.id} tone={link.active ? "good" : "neutral"}>
                  {link.label}
                </ReportBadge>
              ))}
            </nav>
          </header>

          <div className="grid gap-4 p-4">
            <Skeleton className="h-24" />
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
              <section className="grid gap-3 rounded-lg border p-4">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-64" />
              </section>
              <aside className="grid content-start gap-3 rounded-lg border p-4">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </aside>
            </div>
            <section className="grid gap-3 rounded-lg border p-4">
              <Skeleton className="h-5 w-40" />
              <div className="grid gap-2">
                <Skeleton className="h-9" />
                <Skeleton className="h-9" />
                <Skeleton className="h-9" />
              </div>
            </section>
          </div>
        </main>
      </section>
    </div>
  )
}
