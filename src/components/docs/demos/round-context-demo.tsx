import { RoundContext } from "@/components/domain/round-context"

const round = {
  id: "round-03",
  name: "Round 03",
  lot: "LOT-2408",
  splitVersion: "Split V3",
  waferCount: 25,
}

export function RoundContextDemo() {
  return (
    <div className="not-prose rounded-md border bg-background p-6">
      <RoundContext round={round} />
    </div>
  )
}
