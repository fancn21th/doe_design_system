"use client"

import type { ComponentProps, ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export type ReportViewNavigationOption = {
  value: string
  label: string
  icon: LucideIcon
  ariaLabel?: string
  disabled?: boolean
}

type ReportViewNavigationProps = Omit<ComponentProps<typeof Tabs>, "children"> & {
  ariaLabel: string
  options: ReportViewNavigationOption[]
  children?: ReactNode
}

/** Level 3 report view navigation; data selection remains controlled by its owner. */
export function ReportViewNavigation({
  ariaLabel,
  options,
  children,
  className,
  ...props
}: ReportViewNavigationProps) {
  return (
    <Tabs data-navigation-level="3" className={cn("min-w-0 max-w-full gap-3", className)} {...props}>
      <div className="min-w-0 max-w-full self-start overflow-x-auto pb-1">
        <TabsList variant="line" className="gap-0 px-0" aria-label={ariaLabel}>
          {options.map(({ value, label, icon: Icon, ariaLabel: optionLabel, disabled }) => (
            <TabsTrigger key={value} value={value} disabled={disabled} aria-label={optionLabel} className="flex-none border-x-0 px-0 mr-[16px] last:mr-0">
              <Icon aria-hidden="true" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {children}
    </Tabs>
  )
}
