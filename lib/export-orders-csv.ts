import type { DemoOrderView } from "@/lib/build-demo-view-model"

const CSV_HEADERS = ["注文番号", "受注日時", "メニュー名", "単価", "数量", "小計", "消費税", "合計"] as const

function escapeCsvCell(value: string | number): string {
  const s = String(value)
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function formatReceivedForCsv(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Tokyo",
    }).format(new Date(iso))
  } catch {
    return ""
  }
}

function orderToCsvRows(order: DemoOrderView): string[][] {
  const orderNumber = order.orderNumber
  const receivedAt = formatReceivedForCsv(order.order.created_at)
  const taxYen = order.order.tax_yen
  const totalYen = order.order.total_yen

  if (order.items.length === 0) {
    return [[orderNumber, receivedAt, "", "", "", "", taxYen, totalYen]]
  }

  return order.items.map((item) => {
    const lineSubtotal = item.unit_price_yen_snapshot * item.quantity
    return [
      orderNumber,
      receivedAt,
      item.menu_name_snapshot,
      item.unit_price_yen_snapshot,
      item.quantity,
      lineSubtotal,
      taxYen,
      totalYen,
    ]
  })
}

export function buildOrdersCsvContent(orders: DemoOrderView[]): string {
  const rows = orders.flatMap(orderToCsvRows)
  const lines = [CSV_HEADERS.join(","), ...rows.map((row) => row.map(escapeCsvCell).join(","))]
  return `\uFEFF${lines.join("\r\n")}`
}

export function buildOrdersCsvDownloadName(year: number, month: number): string {
  const m = month < 10 ? `0${month}` : String(month)
  return `orders_${year}-${m}.csv`
}

export function downloadOrdersCsv(orders: DemoOrderView[], year: number, month: number): void {
  const content = buildOrdersCsvContent(orders)
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = buildOrdersCsvDownloadName(year, month)
  anchor.click()
  URL.revokeObjectURL(url)
}
