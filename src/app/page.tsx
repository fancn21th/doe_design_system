import { Button } from "@/components/ui/button"
import { History, Lot, Steps } from "@/components/domain"

export default function Home() {
  return (
    <main className="mx-auto max-w-7xl space-y-8 p-10">
      <section>
        <h2 className="mb-4 text-xl font-semibold">基础 UI / UI</h2>
        <Button>发布 Round</Button>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">领域组件 / Domain</h2>
        <History />
      </section>

      <section>
        <Lot />
      </section>

      <section>
        <Steps />
      </section>
    </main>
  )
}
