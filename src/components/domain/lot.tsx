import { ChevronDown } from "lucide-react"

import { lotFixture, waferIds } from "@/components/domain/fixtures"
import { DomainSection } from "@/components/domain/shared"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { lotInputSchema, type LotInput } from "@/schemas/domain-component-inputs"

export function Lot({ input = {} }: { input?: LotInput }) {
  lotInputSchema.parse(input)

  const fields = [
    ["Lot ID", lotFixture.lotId],
    ["Product Name", lotFixture.productName],
    ["试验名称", lotFixture.experimentName],
    ["试验描述", lotFixture.experimentDescription],
    ["Step数量", String(lotFixture.stepCount)],
  ]

  return (
    <DomainSection title="Lot与Round基础信息">
      <div className="grid gap-x-24 gap-y-6 p-6 md:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label} className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              {label}
            </div>
            <div className="text-base font-semibold">{value}</div>
          </div>
        ))}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Wafer数量
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="link" className="h-auto px-0 text-base font-semibold">
                  {lotFixture.waferCount}片
                  <ChevronDown />
                </Button>
              }
            />
            <DropdownMenuContent className="w-80 p-3">
              <div className="mb-3 text-sm font-medium text-muted-foreground">
                Wafer ID（{waferIds.length}片）
              </div>
              <div className="grid grid-cols-5 gap-2">
                {waferIds.map((waferId) => (
                  <Badge key={waferId} variant="outline" className="justify-center font-mono">
                    {waferId}
                  </Badge>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </DomainSection>
  )
}
