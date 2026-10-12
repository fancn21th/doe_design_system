"use client"

import { useState } from "react"
import { SplitMatrix } from "@/components/domain/split-matrix"
import { splitMatrixScenarios } from "@/components/domain/split-matrix.scenarios"
import type { SplitMatrixDraft } from "@/schemas/split-matrix-inputs"

export function SplitMatrixPreview() {
  const [draft, setDraft] = useState<SplitMatrixDraft>(splitMatrixScenarios.lotDraft.draft)
  return <SplitMatrix lot={splitMatrixScenarios.lotDraft.lot} draft={draft} onChange={setDraft} />
}
