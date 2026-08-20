import { DataState } from "@/components/domain/data-state"

export function DataStateDemo() {
  return (
    <div className="not-prose flex flex-wrap gap-2 rounded-md border bg-background p-6">
      <DataState state="READY" />
      <DataState state="PARTIAL" />
      <DataState state="NO_DATA" />
      <DataState state="DQ_ERROR" />
      <DataState state="FAILED" />
      <DataState state="N/A" />
      <DataState state="INSUFFICIENT_DATA" />
    </div>
  )
}
