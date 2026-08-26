import { parameterFixture, parameterListFixture } from "@/components/domain/fixtures"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { waferInputSchema, type WaferInput } from "@/schemas/domain-component-inputs"

export function Wafer({ input = {} }: { input?: WaferInput }) {
  waferInputSchema.parse(input)

  return (
    <Card className="not-prose domain-ui-typography gap-0 overflow-hidden rounded-lg py-0">
      <CardHeader className="border-b p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Process Capability by Wafer</CardTitle>
            <p className="mt-2 text-lg text-muted-foreground">
              按Wafer比较原始测量值、Mean ± 3σ、规格窗口与Cpk
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="h-9 rounded-md border-sky-200 bg-sky-50 px-3 text-sky-700">
              SPC
            </Badge>
            <Badge variant="outline" className="h-9 rounded-md border-sky-200 bg-sky-50 px-3 text-sky-700">
              PARAMETER
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid min-h-[700px] grid-cols-[260px_minmax(0,1fr)]">
          <aside className="border-r bg-muted/20 p-4">
            <div className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground">
              PARAMETER
            </div>
            <b className="block text-lg">5 available</b>
            <div className="mt-6 grid gap-2">
              {parameterListFixture.map(([name, detail], index) => (
                <button
                  key={name}
                  className={
                    index === 0
                      ? "rounded-lg border border-sky-300 bg-sky-50 p-3 text-left"
                      : "rounded-lg p-3 text-left hover:bg-muted"
                  }
                >
                  <b className="block break-all font-mono text-sm">{name}</b>
                  <span className="mt-2 block text-sm text-muted-foreground">{detail}</span>
                </button>
              ))}
            </div>
          </aside>
          <main>
            <div className="grid grid-cols-[minmax(0,1fr)_repeat(4,8rem)] border-b">
              <div className="p-5">
                <h3 className="font-mono text-xl font-semibold">{parameterFixture.name}</h3>
                <p className="mt-2 text-base text-muted-foreground">{parameterFixture.observed}</p>
              </div>
              {[
                ["LSL", parameterFixture.lsl],
                ["TARGET", parameterFixture.target],
                ["USL", parameterFixture.usl],
                ["CPK", parameterFixture.cpk],
              ].map(([label, value]) => (
                <div key={label} className="border-l p-5">
                  <div className="text-sm font-semibold text-muted-foreground">{label}</div>
                  <b className="mt-2 block font-mono text-xl">{value}</b>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-[14rem_1fr_1fr] gap-4 border-b bg-muted/20 p-5">
              <div>
                <div className="font-mono text-sm font-semibold text-muted-foreground">
                  DERIVED VARIANTS
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Reference candidate is inferred, not official BSL.
                </p>
              </div>
              <VariantCard color="emerald" title="S007-V01" kind="Reference Candidate · Baseline" />
              <VariantCard color="sky" title="S007-V02" kind="Variant Candidate" />
            </div>

            <section>
              <div className="flex items-center justify-between border-b p-5">
                <div>
                  <h3 className="text-xl font-semibold">Cpk / 3σ by Wafer</h3>
                  <p className="text-base text-muted-foreground">
                    Mean ± 3 sample σ with raw measurement overlay
                  </p>
                </div>
                <Button variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
                  SOURCE SNAPSHOT
                </Button>
              </div>
              <div className="p-6">
                <CapabilitySvg />
              </div>
              <Separator />
              <div className="flex flex-wrap gap-5 p-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <i className="size-3 rounded-full bg-sky-300" />
                  Raw value
                </span>
                <span className="flex items-center gap-2">
                  <i className="h-0.5 w-6 bg-slate-700" />
                  Mean ± 3σ
                </span>
                <span>◆ Mean</span>
                <span className="text-red-500">--- Active source SPEC</span>
              </div>
            </section>
          </main>
        </div>
      </CardContent>
    </Card>
  )
}

function VariantCard({
  title,
  kind,
  color,
}: {
  title: string
  kind: string
  color: "emerald" | "sky"
}) {
  return (
    <div
      className={
        color === "emerald"
          ? "border-t-4 border-emerald-600 bg-background p-4 ring-1 ring-border"
          : "border-t-4 border-sky-600 bg-background p-4 ring-1 ring-border"
      }
    >
      <b className="block font-mono">{title}</b>
      <span className="mt-2 block text-base">{kind}</span>
      <span className="mt-2 block text-sm text-muted-foreground">Wafer W24 · Tool ALILIO1</span>
    </div>
  )
}

function CapabilitySvg() {
  return (
    <svg className="h-[520px] w-full" viewBox="0 0 920 430" role="img" aria-label="Cpk by wafer chart">
      {[4.4, 4.2, 4.0, 3.8, 3.6].map((value, index) => {
        const y = 60 + index * 70
        return (
          <g key={value}>
            <line x1="70" y1={y} x2="820" y2={y} stroke={value === 4 || value === 4.4 || value === 3.6 ? "currentColor" : "#e5e7eb"} opacity={value === 4 ? 0.6 : 0.25} strokeDasharray={value === 4.4 || value === 3.6 ? "6 6" : undefined} className={value === 4.4 || value === 3.6 ? "text-red-500" : "text-sky-600"} />
            <text x="20" y={y + 6} className="fill-muted-foreground font-mono text-base">{value.toFixed(1)}</text>
          </g>
        )
      })}
      <text x="835" y="66" className="fill-red-500 text-base">USL 4.4</text>
      <text x="835" y="206" className="fill-sky-700 text-base">TARGET 4.0</text>
      <text x="835" y="346" className="fill-red-500 text-base">LSL 3.6</text>
      {[
        [300, "W01", "Cpk 10.422"],
        [620, "W24", "Cpk 11.722"],
      ].map(([x, wafer, cpk]) => (
        <g key={String(wafer)}>
          <line x1={Number(x)} y1="165" x2={Number(x)} y2="235" stroke="#24556f" strokeWidth="4" />
          <line x1={Number(x) - 28} y1="165" x2={Number(x) + 28} y2="165" stroke="#24556f" strokeWidth="4" />
          <line x1={Number(x) - 28} y1="235" x2={Number(x) + 28} y2="235" stroke="#24556f" strokeWidth="4" />
          {Array.from({ length: 9 }, (_, index) => (
            <circle key={index} cx={Number(x) - 24 + index * 6} cy={200 + ((index % 3) - 1) * 5} r="5" fill="#8bbbd2" stroke="#fff" strokeWidth="2" />
          ))}
          <rect x={Number(x) - 8} y="192" width="16" height="16" transform={`rotate(45 ${Number(x)} 200)`} fill="#1676a8" />
          <text x={Number(x)} y="395" textAnchor="middle" className="fill-muted-foreground font-mono text-lg">{wafer}</text>
          <text x={Number(x)} y="420" textAnchor="middle" className="fill-sky-700 text-base">{cpk}</text>
        </g>
      ))}
      <text x="460" y="430" textAnchor="middle" className="fill-muted-foreground text-base">Observed Wafer ID</text>
    </svg>
  )
}
