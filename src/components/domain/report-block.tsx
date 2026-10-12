import type { ReactNode } from "react"
import { BlockTitle } from "@/components/domain/block-title"
import { cn } from "@/lib/utils"
import type { BlockTitleInput } from "@/schemas/domain-component-inputs"

/** Report composition: a stable title anchor followed by a permanently visible body. */
export function ReportBlock({ input, children, className }: { input: BlockTitleInput; children: ReactNode; className?: string }) {
  return (
    <section data-report-block={input.id} aria-labelledby={input.id} className={cn("grid min-w-0 max-w-full gap-4", className)}>
      <BlockTitle input={input} />
      <div data-slot="block-body" className="grid min-w-0 max-w-full gap-4">{children}</div>
    </section>
  )
}
