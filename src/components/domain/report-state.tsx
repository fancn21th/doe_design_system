import type { ReactNode } from "react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

/** Report presentation only: consumers retain request and evidence ownership. */
export function ReportState({
  status = "empty",
  title = "暂无报告数据",
  description,
  className,
}: {
  status?: "loading" | "empty"
  title?: ReactNode
  description?: ReactNode
  className?: string
}) {
  const isLoading = status === "loading"
  const detail = isLoading ? "请稍候，数据加载完成后将自动显示。" : description

  return (
    <Empty
      className={cn("min-h-80 w-full border-0", className)}
      role="status"
      aria-live="polite"
      aria-busy={isLoading}
    >
      <EmptyHeader>
        {isLoading && (
          <EmptyMedia variant="icon" className="size-12 rounded-2xl" aria-hidden="true">
            <Spinner className="size-6 motion-reduce:animate-none" />
          </EmptyMedia>
        )}
        <EmptyTitle className="text-lg">{isLoading ? "正在加载报告数据" : title}</EmptyTitle>
        {detail && <EmptyDescription>{detail}</EmptyDescription>}
      </EmptyHeader>
    </Empty>
  )
}
