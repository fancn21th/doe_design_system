import { ChevronDown } from "lucide-react"

import { lotScenarios } from "@/components/domain/lot.scenarios"
import { DomainSection } from "@/components/domain/shared"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { lotInputSchema, type LotInput } from "@/schemas/domain-component-inputs"

export function Lot({ input = lotScenarios.normal.input }: { input?: LotInput }) {
  const parsedInput = lotInputSchema.parse(input)

  const fields = [
    ["Lot ID", parsedInput.lotId],
    ["Product Name", parsedInput.productName],
    ["试验名称", parsedInput.experimentName],
    ["试验描述", parsedInput.experimentDescription],
    ["Step数量", String(parsedInput.stepCount)],
  ]

  return (
    <DomainSection title="Lot与Round基础信息">
      <Collapsible>
        <div className="grid gap-x-6 gap-y-4 p-4 md:grid-cols-2">
          {fields.map(([label, value]) => (
            <div key={label}>
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className="mt-1 text-sm font-semibold leading-5">
                {value || "—"}
              </div>
            </div>
          ))}
          <div>
            <div className="text-xs text-muted-foreground">Wafer数量</div>
            <CollapsibleTrigger
              render={
                <Button
                  variant="link"
                  className="group mt-0.5 h-auto gap-1 px-0 py-0 text-sm font-semibold"
                  disabled={parsedInput.waferIds.length === 0}
                >
                  {parsedInput.waferCount}片
                  <ChevronDown className="size-4 transition-transform group-data-[panel-open]:rotate-180" />
                </Button>
              }
            />
          </div>
        </div>
        <CollapsibleContent className="border-t px-4 py-3">
          <div className="mb-2 text-xs text-muted-foreground">
            Wafer ID（{parsedInput.waferIds.length}片）
          </div>
          <div className="flex flex-wrap gap-1.5">
            {parsedInput.waferIds.map((waferId) => (
              <Badge
                key={waferId}
                variant="outline"
                className="h-7 justify-center rounded-md bg-muted/40 font-mono text-xs"
              >
                {waferId}
              </Badge>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </DomainSection>
  )
}
