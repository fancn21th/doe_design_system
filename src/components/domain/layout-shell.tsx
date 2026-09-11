"use client"

import type { ComponentProps, CSSProperties, HTMLAttributes } from "react"

import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/registry/new-york-v4/ui/sidebar"

/**
 * The root state container for an application layout.
 *
 * Downstream usage: put `LayoutShell.Sidebar` and `LayoutShell.Main` directly
 * inside this component. Use `open` + `onOpenChange` when the application owns
 * the sidebar state; otherwise `defaultOpen` is sufficient.
 */
export type LayoutShellProps = ComponentProps<typeof SidebarProvider> & {
  /** CSS width, e.g. "18rem". Keep navigation width owned by the shell. */
  sidebarWidth?: string
  /** CSS height, e.g. "3rem". Header content should not set its own height. */
  headerHeight?: string
}

function LayoutShellRoot({
  sidebarWidth = "18rem",
  headerHeight = "3rem",
  style,
  children,
  ...props
}: LayoutShellProps) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": sidebarWidth,
          "--header-height": headerHeight,
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      {children}
    </SidebarProvider>
  )
}

/**
 * The navigation region. Its children are supplied by the app: menu hierarchy,
 * permissions, routes, and user identity are business concerns, not layout API.
 */
function LayoutShellSidebar({ children, ...props }: ComponentProps<typeof Sidebar>) {
  return <Sidebar {...props}>{children}</Sidebar>
}

/** Place brand/workspace controls here. */
function LayoutShellSidebarHeader({ children, ...props }: ComponentProps<typeof SidebarHeader>) {
  return <SidebarHeader {...props}>{children}</SidebarHeader>
}

/** Place navigation groups, search, and other scrolling sidebar content here. */
function LayoutShellSidebarContent({ children, ...props }: ComponentProps<typeof SidebarContent>) {
  return <SidebarContent {...props}>{children}</SidebarContent>
}

/** Place account actions or persistent secondary navigation here. */
function LayoutShellSidebarFooter({ children, ...props }: ComponentProps<typeof SidebarFooter>) {
  return <SidebarFooter {...props}>{children}</SidebarFooter>
}

/**
 * The application canvas next to the sidebar. It must contain the header and
 * content regions so spacing and responsive sidebar behavior stay consistent.
 */
function LayoutShellMain({ children, ...props }: ComponentProps<typeof SidebarInset>) {
  return <SidebarInset {...props}>{children}</SidebarInset>
}

/** Put `LayoutShell.Trigger` at the start so mobile users can open navigation. */
function LayoutShellHeader({ className, children, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <header
      className={cn(
        "flex h-(--header-height) shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear lg:px-6",
        className
      )}
      {...props}
    >
      {children}
    </header>
  )
}

/** The state-aware sidebar toggle. Do not reimplement this with local state. */
function LayoutShellTrigger(props: ComponentProps<typeof SidebarTrigger>) {
  return <SidebarTrigger {...props} />
}

/** Use for right-aligned header actions such as filters, export, or create. */
function LayoutShellHeaderActions({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("ml-auto flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  )
}

/**
 * The scrolling page body. Downstream pages own all business UI inside it:
 * tables, charts, forms, and loading/error states belong to the consuming app.
 */
function LayoutShellContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("@container/main flex flex-1 flex-col", className)} {...props}>
      {children}
    </div>
  )
}

/** A default content stack matching the dashboard reference rhythm. */
function LayoutShellContentStack({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6", className)} {...props}>
      {children}
    </div>
  )
}

/**
 * A compound layout API based on shadcn's dashboard-01 structure.
 *
 * @example
 * <LayoutShell defaultOpen>
 *   <LayoutShell.Sidebar variant="inset">
 *     <LayoutShell.SidebarHeader><Brand /></LayoutShell.SidebarHeader>
 *     <LayoutShell.SidebarContent><Navigation /></LayoutShell.SidebarContent>
 *   </LayoutShell.Sidebar>
 *   <LayoutShell.Main>
 *     <LayoutShell.Header>
 *       <LayoutShell.Trigger />
 *       <Breadcrumbs />
 *       <LayoutShell.HeaderActions><Actions /></LayoutShell.HeaderActions>
 *     </LayoutShell.Header>
 *     <LayoutShell.Content><Page /></LayoutShell.Content>
 *   </LayoutShell.Main>
 * </LayoutShell>
 */
export const LayoutShell = Object.assign(LayoutShellRoot, {
  Sidebar: LayoutShellSidebar,
  SidebarHeader: LayoutShellSidebarHeader,
  SidebarContent: LayoutShellSidebarContent,
  SidebarFooter: LayoutShellSidebarFooter,
  Main: LayoutShellMain,
  Header: LayoutShellHeader,
  Trigger: LayoutShellTrigger,
  HeaderActions: LayoutShellHeaderActions,
  Content: LayoutShellContent,
  ContentStack: LayoutShellContentStack,
})
