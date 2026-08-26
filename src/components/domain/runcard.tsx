import { ChevronDown, Plus, Trash2 } from "lucide-react"

import { runCardsFixture } from "@/components/domain/fixtures"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { runCardInputSchema, type RunCardInput } from "@/schemas/domain-component-inputs"

export function RunCard({ input = {} }: { input?: RunCardInput }) {
  runCardInputSchema.parse(input)

  return (
    <div className="not-prose domain-ui-typography rounded-lg border bg-muted/40 p-6">
      <Card className="mx-auto max-w-5xl gap-0 overflow-hidden rounded-xl py-0 shadow-sm">
        <CardHeader className="border-b p-6">
          <CardTitle className="text-3xl">配置RunCard并下发</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-5 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold">选择本次下发的Step</h3>
              <Button variant="outline" size="lg">
                <Plus />
                新增RunCard
              </Button>
            </div>

            {runCardsFixture.map((runCard) => (
              <div key={runCard.id} className="overflow-hidden rounded-lg border bg-background">
                <div className="grid grid-cols-[auto_auto_1fr_auto_auto] items-center gap-5 bg-muted/40 px-5 py-4">
                  <Checkbox aria-label={`${runCard.id} selected`} />
                  <ChevronDown className="size-5" />
                  <b className="font-mono text-xl">{runCard.id}</b>
                  <span className="text-xl text-muted-foreground">{runCard.released}</span>
                  <Button size="icon-sm" variant="ghost">
                    <Trash2 />
                  </Button>
                </div>
                <div className="divide-y px-14">
                  {runCard.steps.map((step) => (
                    <div
                      key={step.id}
                      className="grid grid-cols-[auto_1fr_16rem] items-center gap-6 py-5"
                    >
                      <Checkbox aria-label={`${step.label} selected`} />
                      <div className="flex items-center gap-5">
                        <span className="font-mono text-3xl text-muted-foreground/50">└</span>
                        <div>
                          <div className="text-xl font-semibold">{step.label}</div>
                          <div className="text-base text-muted-foreground">{step.detail}</div>
                        </div>
                      </div>
                      <Select defaultValue={step.selectedRunCard}>
                        <SelectTrigger className="h-12 w-full text-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RC-001">RC-001</SelectItem>
                          <SelectItem value="RC-002">RC-002</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="flex items-center justify-end gap-3 p-6">
          <span className="mr-auto text-lg text-muted-foreground">未选择Step</span>
          <Button variant="outline" size="lg">
            取消
          </Button>
          <Button size="lg" disabled>
            下发所选Step
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
