"use client"

import {
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

import { LayoutShell } from "@/components/domain/layout-shell"
import { ChartAreaInteractive } from "@/registry/new-york-v4/blocks/dashboard-01/components/chart-area-interactive"
import { DataTable } from "@/registry/new-york-v4/blocks/dashboard-01/components/data-table"
import { NavDocuments } from "@/registry/new-york-v4/blocks/dashboard-01/components/nav-documents"
import { NavMain } from "@/registry/new-york-v4/blocks/dashboard-01/components/nav-main"
import { NavSecondary } from "@/registry/new-york-v4/blocks/dashboard-01/components/nav-secondary"
import { NavUser } from "@/registry/new-york-v4/blocks/dashboard-01/components/nav-user"
import { SectionCards } from "@/registry/new-york-v4/blocks/dashboard-01/components/section-cards"
import data from "@/registry/new-york-v4/blocks/dashboard-01/data.json"
import { Button } from "@/registry/new-york-v4/ui/button"
import { Separator } from "@/registry/new-york-v4/ui/separator"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/registry/new-york-v4/ui/sidebar"

const navigation = [
  { title: "Dashboard", url: "#dashboard", icon: IconDashboard },
  { title: "Lifecycle", url: "#lifecycle", icon: IconListDetails },
  { title: "Analytics", url: "#analytics", icon: IconChartBar },
  { title: "Projects", url: "#projects", icon: IconFolder },
  { title: "Team", url: "#team", icon: IconUsers },
]
const documents = [
  { name: "Data Library", url: "#data-library", icon: IconDatabase },
  { name: "Reports", url: "#reports", icon: IconReport },
  { name: "Word Assistant", url: "#word-assistant", icon: IconFileWord },
]
const secondaryNavigation = [
  { title: "Settings", url: "#settings", icon: IconSettings },
  { title: "Get Help", url: "#help", icon: IconHelp },
  { title: "Search", url: "#search", icon: IconSearch },
]

/**
 * Documentation-only fixture. It proves LayoutShell reproduces dashboard-01
 * without making Dashboard data part of the public LayoutShell API.
 */
export function LayoutShellDashboardPreview() {
  return (
    <LayoutShell defaultOpen sidebarWidth="18rem">
      <LayoutShell.Sidebar variant="inset">
        <LayoutShell.SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
                <a href="#home">
                  <IconInnerShadowTop className="size-5!" />
                  <span className="text-base font-semibold">Acme Inc.</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </LayoutShell.SidebarHeader>
        <LayoutShell.SidebarContent>
          <NavMain items={navigation} />
          <NavDocuments items={documents} />
          <NavSecondary items={secondaryNavigation} className="mt-auto" />
        </LayoutShell.SidebarContent>
        <LayoutShell.SidebarFooter>
          <NavUser user={{ name: "shadcn", email: "m@example.com", avatar: "/avatars/shadcn.jpg" }} />
        </LayoutShell.SidebarFooter>
      </LayoutShell.Sidebar>
      <LayoutShell.Main>
        <LayoutShell.Header>
          <LayoutShell.Trigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
          <h1 className="text-base font-medium">Documents</h1>
          <LayoutShell.HeaderActions>
            <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
              <a href="https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard" rel="noopener noreferrer" target="_blank">GitHub</a>
            </Button>
          </LayoutShell.HeaderActions>
        </LayoutShell.Header>
        <LayoutShell.Content>
          <LayoutShell.ContentStack>
            <SectionCards />
            <div className="px-4 lg:px-6"><ChartAreaInteractive /></div>
            <DataTable data={data} />
          </LayoutShell.ContentStack>
        </LayoutShell.Content>
      </LayoutShell.Main>
    </LayoutShell>
  )
}
