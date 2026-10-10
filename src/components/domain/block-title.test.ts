import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { BlockTitle } from "@/components/domain/block-title"
import { blockTitleScenarios } from "@/components/domain/block-title.scenarios"
import { blockTitleInputSchema } from "@/schemas/domain-component-inputs"

describe("BlockTitle contract", () => {
  it("renders a semantic stable heading and named focusable help button", () => {
    const html = renderToStaticMarkup(React.createElement(BlockTitle, { input: blockTitleScenarios.normal.input }))
    expect(html).toMatch(/<h2[^>]*id="wafer-split-table-preview"[^>]*>Wafer Split Table<\/h2>/)
    expect(html).toContain('aria-label="关于 Wafer Split Table"')
    expect(html).toMatch(/<button[^>]*type="button"/)
    expect(html).not.toContain('tabindex="-1"')
  })

  it("requires meaningful help and a stable fragment identifier", () => {
    const input = blockTitleScenarios.normal.input
    expect(blockTitleInputSchema.safeParse({ ...input, id: "two words" }).success).toBe(false)
    expect(blockTitleInputSchema.safeParse({ ...input, helpText: " " }).success).toBe(false)
    expect(blockTitleInputSchema.parse(input)).toEqual(input)
  })
})
