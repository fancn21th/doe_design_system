"use client"

import { type ChangeEvent, type MouseEvent, type ReactNode, useState } from "react"
import {
  Check,
  ChevronRight,
  ChevronsUpDown,
  GalleryVerticalEnd,
  PanelLeft,
  Search,
} from "lucide-react"

import { layoutSidebarShellScenarios } from "@/components/domain/layout-sidebar-shell.scenarios"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  layoutSidebarShellInputSchema,
  type LayoutShellNavItem,
  type LayoutSidebarShellBreadcrumb,
  type LayoutSidebarShellInput,
  type LayoutSidebarShellNavGroup,
} from "@/schemas/domain-component-inputs"

export type LayoutSidebarShellItem = LayoutShellNavItem

export type LayoutSidebarShellProps = {
  input?: LayoutSidebarShellInput
  children?: ReactNode
  sidebarHeaderContent?: ReactNode
  sidebarContent?: ReactNode
  headerContent?: ReactNode
  headerActions?: ReactNode
  navGroups?: LayoutSidebarShellNavGroup[]
  topLinks?: LayoutSidebarShellItem[]
  breadcrumbs?: LayoutSidebarShellBreadcrumb[]
  collapsed?: boolean
  defaultCollapsed?: boolean
  searchValue?: string
  onSearchChange?: (value: string) => void
  onCollapsedChange?: (collapsed: boolean) => void
  onNavSelect?: (item: LayoutSidebarShellItem) => void
  onTopLinkSelect?: (item: LayoutSidebarShellItem) => void
  onVersionSelect?: (version: string) => void
  className?: string
  sidebarClassName?: string
  headerClassName?: string
  contentClassName?: string
}

export function LayoutSidebarShell({
  input = layoutSidebarShellScenarios.normal.input,
  children,
  sidebarHeaderContent,
  sidebarContent,
  headerContent,
  headerActions,
  navGroups: navGroupsProp,
  topLinks: topLinksProp,
  breadcrumbs: breadcrumbsProp,
  collapsed: collapsedProp,
  defaultCollapsed,
  searchValue,
  onSearchChange,
  onCollapsedChange,
  onNavSelect,
  onTopLinkSelect,
  onVersionSelect,
  className,
  sidebarClassName,
  headerClassName,
  contentClassName,
}: LayoutSidebarShellProps) {
  const scenarioInput = layoutSidebarShellScenarios.normal.input
  const parsedInput = layoutSidebarShellInputSchema.parse(input)
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(
    defaultCollapsed ?? parsedInput.collapsed ?? scenarioInput.collapsed ?? false
  )
  const [selectedVersion, setSelectedVersion] = useState(
    parsedInput.selectedVersion ??
      parsedInput.versions?.[0] ??
      scenarioInput.selectedVersion ??
      scenarioInput.versions?.[0]
  )
  const collapsed = collapsedProp ?? uncontrolledCollapsed
  const navGroups =
    navGroupsProp ?? parsedInput.navGroups ?? scenarioInput.navGroups ?? []
  const topLinks =
    topLinksProp ?? parsedInput.topLinks ?? scenarioInput.topLinks ?? []
  const breadcrumbs =
    breadcrumbsProp ??
    parsedInput.breadcrumbs ??
    scenarioInput.breadcrumbs ??
    []
  const versions = parsedInput.versions ?? scenarioInput.versions ?? []

  function setCollapsed(nextCollapsed: boolean) {
    if (collapsedProp === undefined) setUncontrolledCollapsed(nextCollapsed)
    onCollapsedChange?.(nextCollapsed)
  }

  function selectVersion(version: string) {
    setSelectedVersion(version)
    onVersionSelect?.(version)
  }

  return (
    <div className={cn("not-prose domain-ui-typography", className)}>
      <section
        data-collapsed={collapsed}
        className={cn(
          "group/layout-sidebar-shell grid min-h-[42rem] overflow-hidden rounded-xl border bg-muted/30 text-foreground shadow-xs transition-[grid-template-columns]",
          collapsed
            ? "grid-cols-[3.5rem_minmax(0,1fr)]"
            : "grid-cols-[18rem_minmax(0,1fr)]"
        )}
      >
        <aside
          className={cn(
            "relative flex min-w-0 flex-col border-r bg-sidebar text-sidebar-foreground",
            sidebarClassName
          )}
        >
          <div className="flex flex-col gap-2 p-2">
            {sidebarHeaderContent ?? (
              <LayoutSidebarShellIdentity
                title={parsedInput.sidebarTitle ?? scenarioInput.sidebarTitle}
                subtitle={
                  parsedInput.sidebarSubtitle ?? scenarioInput.sidebarSubtitle
                }
                versions={versions}
                selectedVersion={selectedVersion}
                collapsed={collapsed}
                onVersionSelect={selectVersion}
              />
            )}
            {!collapsed && (
              <LayoutSidebarShellSearch
                placeholder={
                  parsedInput.searchPlaceholder ??
                  scenarioInput.searchPlaceholder ??
                  "Search..."
                }
                value={searchValue}
                onValueChange={onSearchChange}
              />
            )}
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-2 pt-0">
            {sidebarContent ??
              navGroups.map((group) => (
                <LayoutSidebarShellNavGroup
                  key={group.id}
                  group={group}
                  collapsed={collapsed}
                  onNavSelect={onNavSelect}
                />
              ))}
          </div>

          <button
            type="button"
            aria-label={collapsed ? "展开左侧导航" : "收起左侧导航"}
            title={collapsed ? "展开左侧导航" : "收起左侧导航"}
            className="absolute inset-y-0 -right-2 z-10 hidden w-4 cursor-ew-resize justify-center sm:flex"
            onClick={() => setCollapsed(!collapsed)}
          >
            <span className="h-full w-px bg-transparent transition-colors hover:bg-sidebar-border" />
          </button>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col bg-background">
          <header
            className={cn(
              "flex h-12 shrink-0 items-center justify-between gap-3 border-b px-4 transition-[width,height] ease-linear lg:px-6",
              headerClassName
            )}
          >
            <div className="flex min-w-0 items-center gap-2">
              <Button
                aria-label={collapsed ? "展开左侧导航" : "收起左侧导航"}
                title={collapsed ? "展开左侧导航" : "收起左侧导航"}
                variant="ghost"
                size="icon-sm"
                className="-ml-1"
                onClick={() => setCollapsed(!collapsed)}
              >
                <PanelLeft />
              </Button>
              <Separator
                orientation="vertical"
                className="mr-2 data-vertical:h-4"
              />
              {headerContent ?? (
                <div className="min-w-0">
                  <LayoutSidebarShellBreadcrumbs breadcrumbs={breadcrumbs} />
                  <div className="sr-only">
                    {parsedInput.title ?? scenarioInput.title}
                    {(parsedInput.subtitle ?? scenarioInput.subtitle) &&
                      ` - ${parsedInput.subtitle ?? scenarioInput.subtitle}`}
                  </div>
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {topLinks.length > 0 && (
                <nav className="hidden gap-1 sm:flex" aria-label="Top links">
                  {topLinks.map((link) => (
                    <LayoutSidebarShellTopLink
                      key={link.id}
                      item={link}
                      onSelect={onTopLinkSelect}
                    />
                  ))}
                </nav>
              )}
              {headerActions}
            </div>
          </header>

          <div className="@container/main flex flex-1 flex-col">
            <div
              className={cn(
                "flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6",
                contentClassName
              )}
            >
              {children ?? <LayoutSidebarShellSkeleton />}
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

function LayoutSidebarShellIdentity({
  title,
  subtitle,
  versions,
  selectedVersion,
  collapsed,
  onVersionSelect,
}: {
  title?: string
  subtitle?: string
  versions: string[]
  selectedVersion?: string
  collapsed: boolean
  onVersionSelect: (version: string) => void
}) {
  if (collapsed) {
    return (
      <div className="flex justify-center">
        <div
          className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
          title={title}
        >
          <GalleryVerticalEnd className="size-4" />
        </div>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-12 w-full justify-start gap-2 px-2 data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 leading-none">
              <span className="max-w-full truncate font-medium">{title}</span>
              {selectedVersion ? (
                <span className="max-w-full truncate text-xs text-muted-foreground">
                  v{selectedVersion}
                </span>
              ) : (
                <span className="max-w-full truncate text-xs text-muted-foreground">
                  {subtitle}
                </span>
              )}
            </span>
            <ChevronsUpDown className="ml-auto" />
          </Button>
        }
      />
      <DropdownMenuContent className="w-(--anchor-width)" align="start">
        {versions.map((version) => (
          <DropdownMenuItem key={version} onClick={() => onVersionSelect(version)}>
            v{version}
            {version === selectedVersion && <Check className="ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function LayoutSidebarShellSearch({
  placeholder,
  value,
  onValueChange,
}: {
  placeholder: string
  value?: string
  onValueChange?: (value: string) => void
}) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onValueChange?.(event.target.value)
  }

  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <div className="relative">
        <Label htmlFor="layout-sidebar-shell-search" className="sr-only">
          Search
        </Label>
        <Input
          id="layout-sidebar-shell-search"
          placeholder={placeholder}
          className="h-8 bg-background pl-8 shadow-none"
          value={value}
          onChange={handleChange}
        />
        <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 opacity-50" />
      </div>
    </form>
  )
}

function LayoutSidebarShellNavGroup({
  group,
  collapsed,
  onNavSelect,
}: {
  group: LayoutSidebarShellNavGroup
  collapsed: boolean
  onNavSelect?: (item: LayoutSidebarShellItem) => void
}) {
  return (
    <div className="relative flex w-full min-w-0 flex-col">
      {!collapsed && (
        <div className="flex h-8 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70">
          {group.label}
        </div>
      )}
      <ul className="flex w-full min-w-0 flex-col gap-1">
        {group.items.map((item) => (
          <li key={item.id}>
            <LayoutSidebarShellNavItem
              item={item}
              collapsed={collapsed}
              onSelect={onNavSelect}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

function LayoutSidebarShellNavItem({
  item,
  collapsed,
  onSelect,
}: {
  item: LayoutSidebarShellItem
  collapsed: boolean
  onSelect?: (item: LayoutSidebarShellItem) => void
}) {
  const className = cn(
    "flex h-8 w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    item.active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
    collapsed && "justify-center px-0"
  )

  function handleClick(event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) {
    if (item.disabled) {
      event.preventDefault()
      return
    }

    onSelect?.(item)
  }

  const content = collapsed ? (
    <span aria-hidden="true">{item.label.slice(0, 1)}</span>
  ) : (
    <>
      <span className="truncate">{item.label}</span>
      {item.active && <ChevronRight className="ml-auto size-4" />}
    </>
  )

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
        {content}
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
      {content}
    </button>
  )
}

function LayoutSidebarShellBreadcrumbs({
  breadcrumbs,
}: {
  breadcrumbs: LayoutSidebarShellBreadcrumb[]
}) {
  if (breadcrumbs.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1 text-sm text-muted-foreground">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.id} className="flex min-w-0 items-center gap-1">
            {index > 0 && <span className="text-muted-foreground/70">/</span>}
            {breadcrumb.href && !breadcrumb.current ? (
              <a
                href={breadcrumb.href}
                className="hidden truncate transition-colors hover:text-foreground md:block"
              >
                {breadcrumb.label}
              </a>
            ) : (
              <span
                className={cn(
                  "truncate",
                  breadcrumb.current && "font-medium text-foreground"
                )}
                aria-current={breadcrumb.current ? "page" : undefined}
              >
                {breadcrumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

function LayoutSidebarShellTopLink({
  item,
  onSelect,
}: {
  item: LayoutSidebarShellItem
  onSelect?: (item: LayoutSidebarShellItem) => void
}) {
  function handleClick(event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) {
    if (item.disabled) {
      event.preventDefault()
      return
    }

    onSelect?.(item)
  }

  const buttonClassName = buttonVariants({
    variant: item.active ? "secondary" : "ghost",
    size: "sm",
  })

  if (item.href) {
    return (
      <a
        href={item.href}
        aria-current={item.active ? "page" : undefined}
        aria-disabled={item.disabled || undefined}
        className={buttonClassName}
        onClick={handleClick}
        title={item.label}
      >
        {item.label}
      </a>
    )
  }

  return (
    <Button
      variant={item.active ? "secondary" : "ghost"}
      size="sm"
      disabled={item.disabled}
      onClick={handleClick}
    >
      {item.label}
    </Button>
  )
}

function LayoutSidebarShellSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
      </div>
      <div className="px-4 lg:px-6">
        <Skeleton className="min-h-[24rem] rounded-xl" />
      </div>
    </>
  )
}
