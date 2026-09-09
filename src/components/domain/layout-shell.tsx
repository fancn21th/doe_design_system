"use client"

import { type MouseEvent, type ReactNode, useState } from "react"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

import { layoutShellScenarios } from "@/components/domain/layout-shell.scenarios"
import { ReportBadge } from "@/components/domain/report-parts"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  layoutShellInputSchema,
  type LayoutShellInput,
  type LayoutShellNavItem,
} from "@/schemas/domain-component-inputs"

export type LayoutShellItem = LayoutShellNavItem & {
  href?: string
  disabled?: boolean
}

export type LayoutShellProps = {
  input?: LayoutShellInput
  children?: ReactNode
  sidebarContent?: ReactNode
  headerContent?: ReactNode
  headerActions?: ReactNode
  navItems?: LayoutShellItem[]
  topLinks?: LayoutShellItem[]
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  onNavSelect?: (item: LayoutShellItem) => void
  onTopLinkSelect?: (item: LayoutShellItem) => void
  className?: string
  sidebarClassName?: string
  headerClassName?: string
  contentClassName?: string
}

export function LayoutShell({
  input = layoutShellScenarios.normal.input,
  children,
  sidebarContent,
  headerContent,
  headerActions,
  navItems: navItemsProp,
  topLinks: topLinksProp,
  collapsed: collapsedProp,
  defaultCollapsed,
  onCollapsedChange,
  onNavSelect,
  onTopLinkSelect,
  className,
  sidebarClassName,
  headerClassName,
  contentClassName,
}: LayoutShellProps) {
  const scenarioInput = layoutShellScenarios.normal.input
  const parsedInput = layoutShellInputSchema.parse(input)
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(
    defaultCollapsed ?? parsedInput.collapsed ?? scenarioInput.collapsed ?? false
  )
  const collapsed = collapsedProp ?? uncontrolledCollapsed
  const navItems = navItemsProp ?? parsedInput.navItems ?? scenarioInput.navItems ?? []
  const topLinks = topLinksProp ?? parsedInput.topLinks ?? scenarioInput.topLinks ?? []

  function setCollapsed(nextCollapsed: boolean) {
    if (collapsedProp === undefined) setUncontrolledCollapsed(nextCollapsed)
    onCollapsedChange?.(nextCollapsed)
  }

  function toggleCollapsed() {
    setCollapsed(!collapsed)
  }

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
        <aside className={cn("min-w-0 border-r bg-muted/25", sidebarClassName)}>
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
              onClick={toggleCollapsed}
            >
              {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </Button>
          </div>
          <div className="min-h-0">
            {sidebarContent ?? (
              <nav className="grid gap-1 p-3" aria-label="Layout shell sidebar">
                {navItems.map((item) => (
                  <LayoutShellNavButton
                    key={item.id}
                    item={item}
                    collapsed={collapsed}
                    onSelect={onNavSelect}
                  />
                ))}
              </nav>
            )}
          </div>
        </aside>

        <main className="min-w-0">
          <header
            className={cn(
              "flex min-h-14 items-center justify-between gap-4 border-b px-4",
              headerClassName
            )}
          >
            {headerContent ?? (
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
            )}
            <div className="flex shrink-0 items-center gap-2">
              <nav
                className="flex shrink-0 gap-2"
                aria-label="Layout shell top links"
              >
                {topLinks.map((link) => (
                  <LayoutShellTopLink
                    key={link.id}
                    item={link}
                    onSelect={onTopLinkSelect}
                  />
                ))}
              </nav>
              {headerActions}
            </div>
          </header>

          <div className={cn("grid gap-4 p-4", contentClassName)}>
            {children ?? <LayoutShellSkeleton />}
          </div>
        </main>
      </section>
    </div>
  )
}

function LayoutShellNavButton({
  item,
  collapsed,
  onSelect,
}: {
  item: LayoutShellItem
  collapsed: boolean
  onSelect?: (item: LayoutShellItem) => void
}) {
  const className = cn(
    "flex h-9 items-center rounded-md px-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50",
    item.active && "bg-sky-50 font-medium text-sky-700 hover:bg-sky-50",
    collapsed && "justify-center px-0 text-center"
  )

  function handleClick(event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) {
    if (item.disabled) {
      event.preventDefault()
      return
    }

    onSelect?.(item)
  }

  if (item.href) {
    return (
      <a
        href={item.href}
        aria-current={item.active ? "page" : undefined}
        aria-disabled={item.disabled || undefined}
        className={className}
        onClick={handleClick}
        title={item.label}
      >
        {collapsed ? item.label.slice(0, 1) : item.label}
      </a>
    )
  }

  return (
    <button
      type="button"
      aria-current={item.active ? "page" : undefined}
      className={className}
      disabled={item.disabled}
      onClick={handleClick}
      title={item.label}
    >
      {collapsed ? item.label.slice(0, 1) : item.label}
    </button>
  )
}

function LayoutShellTopLink({
  item,
  onSelect,
}: {
  item: LayoutShellItem
  onSelect?: (item: LayoutShellItem) => void
}) {
  const className =
    "inline-flex disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50"

  function handleClick(event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) {
    if (item.disabled) {
      event.preventDefault()
      return
    }

    onSelect?.(item)
  }

  if (item.href) {
    return (
      <a
        href={item.href}
        aria-current={item.active ? "page" : undefined}
        aria-disabled={item.disabled || undefined}
        className={className}
        onClick={handleClick}
        title={item.label}
      >
        <ReportBadge tone={item.active ? "good" : "neutral"}>{item.label}</ReportBadge>
      </a>
    )
  }

  return (
    <button
      type="button"
      aria-current={item.active ? "page" : undefined}
      className={className}
      disabled={item.disabled}
      onClick={handleClick}
      title={item.label}
    >
      <ReportBadge tone={item.active ? "good" : "neutral"}>{item.label}</ReportBadge>
    </button>
  )
}

function LayoutShellSkeleton() {
  return (
    <>
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
    </>
  )
}
