import { Badge } from "@/components/ui/badge"
import type { EvaluationState } from "@/schemas/data-state"

interface DataStateProps {
  state: EvaluationState
}

export function DataState({ state }: DataStateProps) {
  return (
    <Badge variant="outline">
      {state}
    </Badge>
  )
}
