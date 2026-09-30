"use client"

import { useMemo, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  MoreHorizontal,
  RefreshCw,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  reportManagementListInputSchema,
  type ReportManagementItem,
  type ReportManagementListInput,
  type ReportSourceStatus,
} from "@/schemas/domain-component-inputs"

type ReportManagementListProps = {
  input: ReportManagementListInput
  onSelect?: (sourceId: string) => void
  onDownload?: (sourceId: string) => void
  onRegenerate?: (sourceId: string) => void
  onDelete?: (sourceId: string) => void
  onRetry?: () => void
  className?: string
}

export function ReportManagementList({
  input,
  onSelect,
  onDownload,
  onRegenerate,
  onDelete,
  onRetry,
  className,
}: ReportManagementListProps) {
  const parsedInput = reportManagementListInputSchema.parse(input)
  const [lotQuery, setLotQuery] = useState("")
  const [productQuery, setProductQuery] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<10 | 20 | 50>(
    parsedInput.initialPageSize
  )
  const filteredReports = useMemo(() => {
    const normalizedLot = lotQuery.trim().toLowerCase()
    const normalizedProduct = productQuery.trim().toLowerCase()

    return parsedInput.reports.filter((report) => {
      const lotMatches =
        normalizedLot.length === 0 ||
        report.lotId.toLowerCase().includes(normalizedLot)
      const productMatches =
        normalizedProduct.length === 0 ||
        (report.productName ?? "").toLowerCase().includes(normalizedProduct)

      return lotMatches && productMatches
    })
  }, [lotQuery, parsedInput.reports, productQuery])
  const pageCount = Math.max(1, Math.ceil(filteredReports.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visibleReports = filteredReports.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  function updateLotQuery(value: string) {
    setLotQuery(value)
    setPage(1)
  }

  function updateProductQuery(value: string) {
    setProductQuery(value)
    setPage(1)
  }

  return (
    <section
      className={cn(
        "not-prose domain-ui-typography flex min-h-0 flex-col overflow-hidden rounded-xl border bg-background",
        className
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-4 border-b px-5 py-4">
        <div>
          <h1 className="text-lg font-semibold">{parsedInput.title}</h1>
          {parsedInput.description ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {parsedInput.description}
            </p>
          ) : null}
        </div>
        <Badge variant="outline">共 {parsedInput.reports.length} 份报告</Badge>
      </header>

      <div className="grid gap-3 border-b bg-muted/20 p-4 md:grid-cols-2">
        <Input
          value={lotQuery}
          aria-label="按 Lot ID 筛选"
          placeholder="筛选 Lot ID"
          onChange={(event) => updateLotQuery(event.target.value)}
        />
        <Input
          value={productQuery}
          aria-label="按 Product Name 筛选"
          placeholder="筛选 Product Name"
          onChange={(event) => updateProductQuery(event.target.value)}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {parsedInput.status === "loading" ? <LoadingRows /> : null}
        {parsedInput.status === "error" ? (
          <div className="m-4 rounded-lg border border-destructive/30 bg-destructive/5 p-5">
            <h2 className="font-semibold text-destructive">报告目录读取失败</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {parsedInput.errorMessage ?? "请稍后重试。"}
            </p>
            {onRetry ? (
              <Button className="mt-4" variant="outline" onClick={onRetry}>
                重试
              </Button>
            ) : null}
          </div>
        ) : null}
        {parsedInput.status === "ready" && visibleReports.length === 0 ? (
          <div className="grid min-h-64 place-items-center p-6 text-center">
            <div>
              <h2 className="font-semibold">没有匹配的报告</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {parsedInput.reports.length === 0
                  ? "当前目录尚无报告。"
                  : "请调整 Lot ID 或 Product Name 筛选条件。"}
              </p>
            </div>
          </div>
        ) : null}
        {parsedInput.status === "ready" && visibleReports.length > 0 ? (
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background">
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>报告</TableHead>
                <TableHead>Lot ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Wafer</TableHead>
                <TableHead>当前版本</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>数据时间</TableHead>
                <TableHead className="w-24 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleReports.map((report) => (
                <ReportRow
                  key={report.sourceId}
                  report={report}
                  readonly={parsedInput.readonly}
                  selected={parsedInput.selectedSourceId === report.sourceId}
                  onSelect={onSelect}
                  onDownload={onDownload}
                  onRegenerate={onRegenerate}
                  onDelete={onDelete}
                />
              ))}
            </TableBody>
          </Table>
        ) : null}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm">
        <span className="text-muted-foreground">
          共 {filteredReports.length} 条 · 第 {currentPage}/{pageCount} 页
        </span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">每页</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              if (value === "10" || value === "20" || value === "50") {
                setPageSize(Number(value) as 10 | 20 | 50)
                setPage(1)
              }
            }}
          >
            <SelectTrigger size="sm" className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="icon-sm"
            variant="outline"
            aria-label="上一页"
            disabled={currentPage <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            <ChevronLeft />
          </Button>
          <Button
            size="icon-sm"
            variant="outline"
            aria-label="下一页"
            disabled={currentPage >= pageCount}
            onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
          >
            <ChevronRight />
          </Button>
        </div>
      </footer>
    </section>
  )
}

function ReportRow({
  report,
  readonly,
  selected,
  onSelect,
  onDownload,
  onRegenerate,
  onDelete,
}: {
  report: ReportManagementItem
  readonly: boolean
  selected: boolean
  onSelect?: (sourceId: string) => void
  onDownload?: (sourceId: string) => void
  onRegenerate?: (sourceId: string) => void
  onDelete?: (sourceId: string) => void
}) {
  const canDownload = report.downloadAvailable && Boolean(onDownload)
  const canRegenerate =
    !readonly && !report.readOnly && report.regenerateAvailable && Boolean(onRegenerate)
  const canDelete =
    !readonly && !report.readOnly && report.deleteAvailable && Boolean(onDelete)

  return (
    <TableRow data-state={selected ? "selected" : undefined}>
      <TableCell>
        <Button
          variant="ghost"
          className="h-auto max-w-72 justify-start px-2 py-1 text-left"
          onClick={() => onSelect?.(report.sourceId)}
        >
          <span className="min-w-0">
            <span className="block truncate font-semibold">{report.label}</span>
            <span className="block truncate font-mono text-xs text-muted-foreground">
              {report.sourceId}
            </span>
          </span>
        </Button>
      </TableCell>
      <TableCell className="font-mono">{report.lotId}</TableCell>
      <TableCell>{report.productName ?? "—"}</TableCell>
      <TableCell>{report.waferCount ?? "—"}</TableCell>
      <TableCell>{report.currentVersion ?? "—"}</TableCell>
      <TableCell>
        <StatusBadge status={report.status} />
      </TableCell>
      <TableCell>{report.dataAsOf ?? "—"}</TableCell>
      <TableCell>
        <div className="flex justify-end gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <span>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`下载 ${report.label}`}
                      disabled={!canDownload}
                      onClick={() => onDownload?.(report.sourceId)}
                    >
                      <Download />
                    </Button>
                  </span>
                }
              />
              <TooltipContent>
                {canDownload
                  ? "下载当前版本"
                  : report.downloadUnavailableReason ?? "下载能力尚未接入"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button size="icon-sm" variant="ghost" aria-label="更多报告操作">
                  <MoreHorizontal />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                disabled={!canRegenerate}
                title={
                  canRegenerate
                    ? undefined
                    : report.regenerateUnavailableReason ?? "重新生成能力尚未接入"
                }
                onClick={() => onRegenerate?.(report.sourceId)}
              >
                <RefreshCw />
                重新生成
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                disabled={!canDelete}
                title={
                  canDelete
                    ? undefined
                    : report.deleteUnavailableReason ?? "删除能力尚未接入"
                }
                onClick={() => onDelete?.(report.sourceId)}
              >
                <Trash2 />
                删除报告
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  )
}

function StatusBadge({ status }: { status: ReportSourceStatus }) {
  const label = {
    READY: "可用",
    PARTIAL: "部分可用",
    UNAVAILABLE: "不可用",
    FAILED: "失败",
    UNKNOWN: "未知",
  }[status]

  return (
    <Badge
      variant="outline"
      className={cn(
        status === "READY" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        status === "PARTIAL" && "border-amber-200 bg-amber-50 text-amber-700",
        status === "FAILED" && "border-destructive/30 bg-destructive/5 text-destructive"
      )}
    >
      {label}
    </Badge>
  )
}

function LoadingRows() {
  return (
    <div className="space-y-3 p-4" aria-label="正在加载报告目录">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  )
}
