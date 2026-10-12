import type { SplitMatrixLot } from "@/schemas/split-matrix-inputs"

/** Only explicit physical positions are selectable; array order is not a slot number. */
export function wafersBySlot(wafers: SplitMatrixLot["wafers"]) {
  const positions = new Map<number, SplitMatrixLot["wafers"][number]>()
  const ambiguous = new Set<number>()
  for (const wafer of wafers) {
    const slot = Number(wafer.waferNo ?? wafer.waferId.match(/#(\d+)$/)?.[1])
    if (!Number.isInteger(slot) || slot < 1 || slot > 25 || ambiguous.has(slot)) continue
    if (positions.has(slot)) {
      positions.delete(slot)
      ambiguous.add(slot)
    } else positions.set(slot, wafer)
  }
  return positions
}
