import type { ReactNode } from "react"
import { ChevronDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

export function DomainSection({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <Collapsible defaultOpen className={cn("not-prose domain-ui-typography", className)}>
      <Card className="gap-0 rounded-lg py-0 shadow-none">
        <CardHeader className="border-b py-4">
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardAction>
            <CollapsibleTrigger
              render={
                <Button aria-label={`Toggle ${title}`} size="icon-sm" variant="ghost">
                  <ChevronDown />
                </Button>
              }
            />
          </CardAction>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="p-0">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const color =
    status === "进行中" || status === "运行中"
      ? "border-sky-200 bg-sky-50 text-sky-700"
      : status === "已暂停" || status === "OPEN" || status === "TIMEOUT"
        ? "border-orange-200 bg-orange-50 text-orange-700"
        : status === "已终止"
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"

  return (
    <Badge variant="outline" className={cn("h-7 rounded-full px-3", color)}>
      {status}
    </Badge>
  )
}

export function AssignmentBadge({ value }: { value: string }) {
  const color =
    value === "B"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : value === "↔"
        ? "border-violet-200 bg-violet-50 text-violet-700"
        : value === "E"
          ? "border-muted bg-muted text-muted-foreground"
          : "border-sky-200 bg-sky-50 text-sky-700"

  return (
    <Badge
      variant="outline"
      className={cn("size-8 justify-center rounded-md px-0 text-sm font-semibold", color)}
    >
      {value}
    </Badge>
  )
}
