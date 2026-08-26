import { ChevronLeft, ChevronRight } from "lucide-react"

import { defectWafersFixture } from "@/components/domain/fixtures"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  waferDefectInputSchema,
  type WaferDefectInput,
} from "@/schemas/domain-component-inputs"

export function WaferDefect({ input = {} }: { input?: WaferDefectInput }) {
  waferDefectInputSchema.parse(input)

  return (
    <Card className="not-prose domain-ui-typography gap-0 overflow-hidden rounded-lg py-0">
      <CardHeader className="border-b p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Wafer Defect Map</CardTitle>
            <p className="mt-2 text-lg text-muted-foreground">
              按异常Wafer查看缺陷数量、类型、Die位置与缺陷明细
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="h-9 rounded-md border-sky-200 bg-sky-50 px-3 text-sky-700">
              SPC
            </Badge>
            <Badge variant="outline" className="h-9 rounded-md border-sky-200 bg-sky-50 px-3 text-sky-700">
              DEFECT
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border-b bg-amber-50 px-5 py-3 text-base text-amber-900">
          <b>Source-backed:</b> Wafer缺陷数量与采样时间来自SPC；点位、坐标、类型和缺陷图为原型示意。
        </div>
        <div className="grid min-h-[760px] grid-cols-[220px_minmax(0,1fr)_360px]">
          <aside className="space-y-3 border-r bg-muted/20 p-5">
            {defectWafersFixture.map(([wafer, defects], index) => (
              <button
                key={wafer}
                className={
                  index === 0
                    ? "w-full rounded-lg border border-primary bg-sky-50 p-4 text-left"
                    : "w-full rounded-lg border bg-background p-4 text-left"
                }
              >
                <b className="block font-mono text-lg">{wafer}</b>
                <span className="mt-2 block text-base text-red-600">{defects}</span>
              </button>
            ))}
          </aside>
          <main className="border-r bg-[linear-gradient(#e8edf1_1px,transparent_1px),linear-gradient(90deg,#e8edf1_1px,transparent_1px)] bg-[size:32px_32px] p-8">
            <h3 className="text-xl font-semibold">W01 Defect Position View</h3>
            <div className="mt-10 flex justify-center">
              <WaferMapSvg />
            </div>
            <p className="mt-8 max-w-xl text-lg text-muted-foreground">
              悬停点位查看Wafer、坐标、缺陷数量和类型；点击后在右侧查看缺陷图。
            </p>
          </main>
          <aside className="p-6">
            <div className="flex items-end gap-4">
              <b className="font-mono text-4xl">W01</b>
              <span className="text-base text-muted-foreground">2026-04-11 02:27:41</span>
            </div>
            <Separator className="my-6" />
            <div className="flex items-center justify-between">
              <span className="text-base text-muted-foreground">缺陷总数</span>
              <b className="text-4xl text-red-700">2</b>
            </div>
            <div className="mt-8 space-y-4">
              <div className="text-base text-muted-foreground">缺陷类型分布</div>
              <DefectBar label="Particle" value="1" />
              <DefectBar label="Scratch" value="1" />
            </div>
            <Separator className="my-16" />
            <div className="flex items-center justify-between">
              <b className="text-xl">坐标 X 14 / Y 24</b>
              <span className="text-lg text-muted-foreground">1 / 2</span>
            </div>
            <div className="mt-5 overflow-hidden rounded-lg bg-zinc-900 p-5 text-white">
              <div className="relative h-72">
                <div className="absolute inset-0 rotate-[-45deg] rounded-full border-[18px] border-zinc-600/50" />
                <div className="absolute left-32 top-24 size-28 rounded-full bg-zinc-300/80" />
                <div className="absolute left-14 top-16 size-7 rounded-full bg-zinc-400" />
                <div className="absolute right-24 top-20 size-8 rounded-full bg-zinc-500" />
                <Button className="absolute left-0 top-1/2 rounded-full" size="icon-lg" variant="outline">
                  <ChevronLeft />
                </Button>
                <Button className="absolute right-0 top-1/2 rounded-full" size="icon-lg" variant="outline">
                  <ChevronRight />
                </Button>
                <div className="absolute bottom-0 left-0">
                  <b className="block text-xl">Particle ×1</b>
                  <span className="font-mono text-lg">DF-01-001-01</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </CardContent>
    </Card>
  )
}

function DefectBar({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7rem_1fr_auto] items-center gap-3">
      <span>{label}</span>
      <div className="h-3 bg-muted">
        <div className="h-full w-1/2 bg-red-500" />
      </div>
      <b>{value}</b>
    </div>
  )
}

function WaferMapSvg() {
  return (
    <svg className="h-[430px] w-[430px]" viewBox="0 0 430 430" role="img" aria-label="W01 defect map">
      <circle cx="215" cy="215" r="170" fill="#eef3f4" stroke="#657783" strokeWidth="4" />
      <circle cx="215" cy="215" r="100" fill="none" stroke="#cbd5db" strokeWidth="2" />
      <circle cx="215" cy="215" r="55" fill="none" stroke="#cbd5db" strokeWidth="2" />
      <line x1="45" y1="215" x2="385" y2="215" stroke="#cbd5db" strokeDasharray="8 8" />
      <line x1="215" y1="45" x2="215" y2="385" stroke="#cbd5db" strokeDasharray="8 8" />
      <path d="M195 385h40l-10 26h-20z" fill="#fff" stroke="#657783" strokeWidth="4" />
      <circle cx="100" cy="100" r="14" fill="#c94f45" stroke="#fff" strokeWidth="5" />
    </svg>
  )
}
