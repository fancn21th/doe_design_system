import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { SplitMatrix } from "@/components/domain/split-matrix"
import { splitMatrixScenarios } from "@/components/domain/split-matrix.scenarios"

describe("SplitMatrix", () => {
  it("distinguishes actual Lot wafers from absent physical slots", () => {
    const { lot, draft } = splitMatrixScenarios.lotDraft
    const markup = renderToStaticMarkup(<SplitMatrix lot={lot} draft={draft} onChange={() => {}} />)
    expect(markup.match(/scope="col"/g)).toHaveLength(25)
    expect(markup).toContain('aria-label="S-WFST-N-01 #13 BASELINE"')
    expect(markup).toContain('aria-label="S-WFST-N-01 #1 不属于当前 Lot"')
  })

  it("shows portable template positions with editing disabled in readonly mode", () => {
    const { lot, draft, templateSlots, readOnly } = splitMatrixScenarios.templateReadonly
    const markup = renderToStaticMarkup(<SplitMatrix lot={lot} draft={draft} onChange={() => {}} templateSlots={templateSlots.map((step) => step.map((variant) => [...variant]))} readOnly={readOnly} />)
    expect(markup).toContain('disabled="" title="模板槽位 #1" aria-label="S-WFST-N-01 #1 BASELINE"')
    expect(markup).toContain('disabled="" title="模板槽位 #25" aria-label="S-WFST-N-01 #25 VARIANT"')
    expect(markup).not.toContain('aria-label="新增Variant"')
  })

  it("locks released Step configuration", () => {
    const { lot, draft, lockedStepIds } = splitMatrixScenarios.released
    const markup = renderToStaticMarkup(<SplitMatrix lot={lot} draft={draft} onChange={() => {}} lockedStepIds={[...lockedStepIds]} />)
    expect(markup).toContain('title="已下发"')
    expect(markup).toMatch(/disabled=""[^>]*aria-label="新增Variant"/)
    expect(markup).toContain('disabled="" title="Wafer #13" aria-label="S-WFST-N-01 #13 BASELINE"')
  })
})
