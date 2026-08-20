import type { Round } from "../../schemas/round"

interface RoundContextProps {
  round: Round
}

export function RoundContext({
  round,
}: RoundContextProps) {
  return (
    <div className="flex gap-6 text-sm">
      <div>
        <div className="text-muted-foreground">轮次 / Round</div>
        <div>{round.name}</div>
      </div>

      <div>
        <div className="text-muted-foreground">批次 / Lot</div>
        <div>{round.lot}</div>
      </div>

      {round.splitVersion && (
        <div>
          <div className="text-muted-foreground">Split 版本</div>
          <div>{round.splitVersion}</div>
        </div>
      )}

      <div>
        <div className="text-muted-foreground">晶圆数 / Wafers</div>
        <div>{round.waferCount}</div>
      </div>
    </div>
  )
}
