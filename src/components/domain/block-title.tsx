"use client"

import { CircleHelpIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { blockTitleInputSchema, type BlockTitleInput } from "@/schemas/domain-component-inputs"

/** Business heading and help only; the consumer owns the block body and data. */
export function BlockTitle({ input, className }: { input: BlockTitleInput; className?: string }) {
  const { id, title, helpText } = blockTitleInputSchema.parse(input)

  return (
    <header data-slot="block-title" className={cn("flex min-w-0 items-center gap-1", className)}>
      <h2 id={id} className="min-w-0 scroll-mt-24 break-words text-(length:--doe-font-module-title) font-semibold">
        {title}
      </h2>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger render={<Button type="button" variant="ghost" size="icon-xs" aria-label={`关于 ${title}`} className="text-muted-foreground" />}>
            <CircleHelpIcon className="size-3.5" aria-hidden="true" />
          </TooltipTrigger>
          <TooltipContent side="bottom" align="start" className="leading-relaxed">{helpText}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </header>
  )
}
