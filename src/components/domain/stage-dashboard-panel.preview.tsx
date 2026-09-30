"use client"

import { useState } from "react"

import { StageDashboardPanel } from "@/components/domain/stage-dashboard-panel"
import { stageDashboardPanelScenarios } from "@/components/domain/stage-dashboard-panel.scenarios"
import { Badge } from "@/components/ui/badge"

export function StageDashboardPanelPreview() {
  const [fullscreen, setFullscreen] = useState(false)

  return (
    <div className="h-[34rem] overflow-hidden rounded-xl border">
      <StageDashboardPanel
        input={stageDashboardPanelScenarios.ready.input}
        fullscreen={fullscreen}
        onFullscreenChange={setFullscreen}
        onClose={() => undefined}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Wafer", "25"],
            ["Inline Parameters", "6"],
            ["Defect Wafers", "3"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border bg-background p-4">
              <p className="text-sm text-muted-foreground">{label}</p>
              <strong className="mt-2 block text-2xl">{value}</strong>
              <Badge variant="outline" className="mt-3">prototype-backed</Badge>
            </div>
          ))}
        </div>
        <div className="rounded-lg border bg-background p-5 text-sm text-muted-foreground">
          消费方在 ready 状态下注入真实 Stage 业务组件；面板不生成或推断 MES、Inline、Defect 事实。
        </div>
      </StageDashboardPanel>
    </div>
  )
}
