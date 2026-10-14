"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"

import type { MesJsonPreviewInput } from "@/schemas/mes-json-preview-inputs"

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }

function JsonNode({ value, name, depth, expanded }: { value: JsonValue; name?: string; depth: number; expanded?: boolean }) {
  const label = name === undefined ? null : <><span className="text-blue-700 dark:text-blue-300">{JSON.stringify(name)}</span><span>: </span></>
  if (value === null || typeof value !== "object") {
    const color = value === null ? "text-muted-foreground" : typeof value === "string" ? "text-emerald-700 dark:text-emerald-300" : "text-violet-700 dark:text-violet-300"
    return <div className="py-0.5 break-words whitespace-pre-wrap">{label}<span className={color}>{JSON.stringify(value)}</span></div>
  }
  const array = Array.isArray(value)
  const entries = Object.entries(value)
  const opening = array ? "[" : "{"
  const closing = array ? "]" : "}"
  if (!entries.length) return <div className="py-0.5">{label}{opening}{closing}</div>
  return <details open={expanded ?? depth < 2} className="min-w-0">
    <summary className="cursor-pointer rounded py-1 break-words hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary">{label}{opening}<span className="ml-2 font-sans text-xs text-muted-foreground">{entries.length} {array ? "项" : "个字段"}</span></summary>
    <div className="ml-3 border-l border-border pl-3 sm:ml-4 sm:pl-4">{entries.map(([key, child]) => <JsonNode key={key} value={child} name={key} depth={depth + 1} expanded={expanded} />)}</div>
    <div className="py-0.5">{closing}</div>
  </details>
}

/** Read-only rendering of the authoritative preview; submission keeps its original hash and payload. */
export function MesJsonPreview({ json }: MesJsonPreviewInput) {
  const parsed = useMemo(() => {
    try { return { valid: true as const, value: JSON.parse(json) as JsonValue } }
    catch { return { valid: false as const } }
  }, [json])
  const [mode, setMode] = useState<"tree" | "text">("tree")
  const [expansion, setExpansion] = useState<{ open?: boolean; revision: number }>({ revision: 0 })
  const [copyStatus, setCopyStatus] = useState("")
  async function copy() {
    try {
      // Copy the exact backend JSON, avoiding any numeric precision or escaping changes.
      await navigator.clipboard.writeText(json)
      setCopyStatus("已复制完整 JSON")
    } catch { setCopyStatus("复制失败，请切换到 JSON 文本后手动选择复制。") }
  }
  return <section aria-label="MES JSON 预览" className="min-w-0 overflow-hidden rounded-lg border bg-background">
    <div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 p-3">
      <span className="mr-auto text-sm font-medium">MES JSON <span className="font-normal text-muted-foreground">· 只读预览</span></span>
      {parsed.valid ? <>
        <Button type="button" size="sm" variant="outline" aria-pressed={mode === "tree"} onClick={() => setMode("tree")}>结构视图</Button>
        <Button type="button" size="sm" variant="outline" aria-pressed={mode === "text"} onClick={() => setMode("text")}>JSON 文本</Button>
        {mode === "tree" ? <><Button type="button" size="sm" variant="ghost" onClick={() => setExpansion((old) => ({ open: true, revision: old.revision + 1 }))}>展开全部</Button><Button type="button" size="sm" variant="ghost" onClick={() => setExpansion((old) => ({ open: false, revision: old.revision + 1 }))}>折叠全部</Button></> : null}
      </> : null}
      <Button type="button" size="sm" variant="outline" onClick={() => void copy()}>复制 JSON</Button>
    </div>
    {copyStatus ? <p role="status" className="px-3 pt-2 text-xs text-muted-foreground">{copyStatus}</p> : null}
    {!parsed.valid ? <p role="alert" className="px-4 pt-3 text-sm text-amber-700">无法解析 JSON，以下保留接口返回的原始内容。</p> : null}
    <div className="max-h-[45vh] min-h-24 overflow-auto p-4 font-mono text-xs leading-6 sm:text-sm">
      {parsed.valid && mode === "tree" ? <JsonNode key={`${json}:${expansion.revision}`} value={parsed.value} depth={0} expanded={expansion.open} /> : <pre className="whitespace-pre-wrap break-words">{parsed.valid ? JSON.stringify(parsed.value, null, 2) : json}</pre>}
    </div>
  </section>
}
