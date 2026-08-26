import Link from "next/link"
import { BookOpen } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Experiment,
  History,
  Lot,
  RunCard,
  RunCardHistory,
  Steps,
  Wafer,
  WaferDefect,
} from "@/components/domain"

export default function Home() {
  return (
    <main className="domain-ui-typography mx-auto max-w-7xl space-y-5 p-6">
      <section className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">DOE Domain UI</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            业务组件资产库预览
          </p>
        </div>
        <Link href="/docs" className={buttonVariants({ size: "lg" })}>
          <BookOpen data-icon="inline-start" />
          Docs
        </Link>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">基础 UI / UI</h2>
        <Button>发布 Round</Button>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">领域组件 / Domain</h2>
        <Experiment />
      </section>

      <section>
        <History />
      </section>

      <section>
        <Lot />
      </section>

      <section>
        <Steps />
      </section>

      <section>
        <RunCard />
      </section>

      <section>
        <RunCardHistory />
      </section>

      <section>
        <Wafer />
      </section>

      <section>
        <WaferDefect />
      </section>
    </main>
  )
}
