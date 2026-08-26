import { Search } from "lucide-react"

import { historyFixture } from "@/components/domain/fixtures"
import { StatusBadge } from "@/components/domain/shared"
import { Input } from "@/components/ui/input"
import { historyInputSchema, type HistoryInput } from "@/schemas/domain-component-inputs"

export function History({ input = {} }: { input?: HistoryInput }) {
  historyInputSchema.parse(input)

  return (
    <div className="not-prose domain-ui-typography w-[28rem] rounded-lg border bg-muted/30 p-4">
      <h3 className="text-sm font-medium text-muted-foreground">历史试验</h3>
      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="rounded-lg bg-background pl-9"
          placeholder="搜索试验名称或Lot ID"
        />
      </div>
      <div className="mt-4 grid gap-2">
        {historyFixture.map(([name, lotId, status], index) => (
          <button
            key={lotId}
            className={
              index === 0
                ? "rounded-lg bg-muted px-4 py-3 text-left"
                : "rounded-lg px-4 py-3 text-left hover:bg-muted"
            }
          >
            <div className="text-base font-semibold">{name}</div>
            <div className="mt-2 flex items-center justify-between gap-4">
              <span className="font-mono text-sm text-muted-foreground">
                Lot ID · {lotId}
              </span>
              <StatusBadge status={status} />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
