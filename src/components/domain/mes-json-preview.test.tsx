import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { MesJsonPreview } from "./mes-json-preview"

describe("MES JSON read-only preview", () => {
  it("renders nested payloads with collapsible objects and preserves distinct primitive values", () => {
    const json = JSON.stringify({ data: { PURPOSE: "测试", EMPTY: "", MISSING: null, ENABLED: false, LOTQTY: 0, STEPLIST: [{ STEPSEQ: "000100.1.000100" }] } })
    const html = renderToStaticMarkup(<MesJsonPreview json={json} />)
    expect(html).toContain("<details open=")
    expect(html).toContain("STEPLIST")
    expect(html).toContain("000100.1.000100")
    expect(html).toContain("null")
    expect(html).toContain("false")
    expect(html).toContain("测试")
    expect(html).not.toContain("<input")
    expect(html).toContain("复制 JSON")
  })
  it("preserves malformed payloads as escaped raw text instead of dropping them", () => {
    const html = renderToStaticMarkup(<MesJsonPreview json={'{"PURPOSE":<script>alert(1)</script>'} />)
    expect(html).toContain("无法解析 JSON")
    expect(html).toContain("&lt;script&gt;")
    expect(html).not.toContain("<script>")
  })
  it.each(["null", "0", "false", "[]", "{}", '""'])("accepts a valid JSON root %s", (json) => {
    expect(renderToStaticMarkup(<MesJsonPreview json={json} />)).not.toContain("无法解析 JSON")
  })
})
