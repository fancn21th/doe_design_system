/** Screen-space annotation placement only; supplied measurements stay unchanged. */
export type FitLabelPoint = { id: string; label: string; x: number; y: number }
type PlotBounds = { x: number; y: number; width: number; height: number }
export type FitLabelPlacement = FitLabelPoint & {
  text: string
  left: number
  top: number
  width: number
  height: number
}

export function placeFitPointLabels(points: FitLabelPoint[], plot: PlotBounds): FitLabelPlacement[] {
  const placed: FitLabelPlacement[] = []
  const height = 16
  const gap = 4
  for (const point of points) {
    const availableCharacters = Math.floor((plot.width - 8) / 6.5)
    if (availableCharacters < 3 || plot.height < height) continue
    const text = point.label.length > Math.min(24, availableCharacters)
      ? `${point.label.slice(0, Math.min(24, availableCharacters) - 1)}…`
      : point.label
    const width = [...text].reduce((sum, character) => sum + (character.charCodeAt(0) > 255 ? 11 : 6.5), 8)
    if (width > plot.width) continue
    // Try nearby rows before moving farther away. A leader keeps the label tied
    // to its real scatter point; cramped labels remain available in the tooltip.
    const candidates: Array<{ left: number; top: number }> = []
    for (let row = 0; row < 8; row++) {
      const distance = 10 + row * (height + gap)
      for (const horizontal of [0, 1, -1]) {
        const left = Math.min(Math.max(point.x - width / 2 + horizontal * (width + gap), plot.x), plot.x + plot.width - width)
        candidates.push({ left, top: point.y - distance - height }, { left, top: point.y + distance })
      }
    }
    const candidate = candidates.find((box) =>
      box.top >= plot.y && box.top + height <= plot.y + plot.height &&
      !placed.some((other) => box.left < other.left + other.width + gap && box.left + width + gap > other.left && box.top < other.top + other.height + gap && box.top + height + gap > other.top) &&
      !points.some((other) => other.x >= box.left - gap && other.x <= box.left + width + gap && other.y >= box.top - gap && other.y <= box.top + height + gap)
    )
    if (candidate) placed.push({ ...point, text, ...candidate, width, height })
  }
  return placed
}
