import type { Round } from "@/schemas/round"

interface RoundContextProps {
  round: Round
}

export function RoundContext({
  round,
}: RoundContextProps) {
  return (
    <div className="flex gap-6 text-sm">
      <div>
        <div className="text-muted-foreground">Round</div>
        <div>{round.name}</div>
      </div>

      <div>
        <div className="text-muted-foreground">Lot</div>
        <div>{round.lot}</div>
      </div>

      {round.splitVersion && (
        <div>
          <div className="text-muted-foreground">Split</div>
          <div>{round.splitVersion}</div>
        </div>
      )}

      <div>
        <div className="text-muted-foreground">Wafers</div>
        <div>{round.waferCount}</div>
      </div>
    </div>
  )
}
