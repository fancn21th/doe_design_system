"use client"

import * as React from "react"

export function ReportWaferLink({ label, sourceWaferId, title, onSelect }: {
  label: string
  sourceWaferId: string
  title?: string
  onSelect?: () => void
}) {
  const className = "font-mono text-sky-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  return onSelect
    ? <button type="button" className={className} title={title ?? sourceWaferId} onClick={onSelect}>{label}</button>
    : <b className="font-mono text-sky-700" title={title ?? sourceWaferId}>{label}</b>
}

export function ReportWaferIdentity({ children, role }: { children: React.ReactNode; role?: string }) {
  return <span className="inline-flex items-center gap-2 whitespace-nowrap">{children}{role && <span className="text-xs text-muted-foreground">{role}</span>}</span>
}
