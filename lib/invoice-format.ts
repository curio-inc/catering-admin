import type { OrderRow } from "@/lib/orders"

export function formatJapaneseDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Tokyo",
  }).format(d)
}

export function formatInvoiceNumber(order: OrderRow): string {
  const n = order.order_number?.trim()
  if (n) return n
  const d = new Date(order.created_at)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const tail = order.id.replace(/-/g, "").slice(0, 6).toUpperCase()
  return `SG-${y}${m}-${tail}`
}

export function formatYen(amount: number): string {
  return `${amount.toLocaleString("ja-JP")}円`
}

/** 税抜き合計に対する消費税率表示用（整数%に丸め） */
export function inferTaxPercentLabel(taxYen: number, taxableBaseYen: number): string {
  if (taxableBaseYen <= 0) return "10"
  if (taxYen <= 0) return "0"
  const p = Math.round((taxYen / taxableBaseYen) * 1000) / 10
  const rounded = Number.isInteger(p) ? String(p) : p.toFixed(1).replace(/\.0$/, "")
  return rounded
}
