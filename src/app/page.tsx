import { Button } from "@/components/ui/button"
import { DataState } from "@/components/domain/data-state"
import { RoundContext } from "@/components/domain/round-context"

export default function Home() {
  const round = {
    id: "round-03",
    name: "Round 03",
    lot: "LOT-2408",
    splitVersion: "Split V3",
    waferCount: 25,
  }

  return (
    <main className="mx-auto max-w-5xl space-y-12 p-10">
      <section>
        <h2 className="mb-4 text-xl font-semibold">基础 UI / UI</h2>
        <Button>发布 Round</Button>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">数据状态 / Data State</h2>
        <div className="flex gap-2">
          <DataState state="READY" />
          <DataState state="PARTIAL" />
          <DataState state="NO_DATA" />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">轮次上下文 / Round Context</h2>
        <RoundContext round={round} />
      </section>
    </main>
  )
}
