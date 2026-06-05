import type { OrderRow } from "@/lib/orders"

/** 領収書の日付（例: 2026年05月28日） */
export function formatReceiptDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  const parts = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tokyo",
  }).formatToParts(d)
  const y = parts.find((p) => p.type === "year")?.value ?? ""
  const m = parts.find((p) => p.type === "month")?.value ?? ""
  const day = parts.find((p) => p.type === "day")?.value ?? ""
  return `${y}年${m}月${day}日`
}

/** 領収書番号（例: 20260528-1） */
export function formatReceiptNumber(order: OrderRow): string {
  const iso = order.invoice_issued_at ?? order.updated_at ?? order.created_at
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return order.order_number ?? order.id

  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  const tail = order.order_number?.split("-").pop()?.replace(/\D/g, "") || "1"
  return `${y}${m}${day}-${tail}`
}

/** 合計金額表示（例: ¥ 11,000） */
export function formatReceiptTotalYen(amount: number): string {
  return `¥ ${amount.toLocaleString("ja-JP")}`
}

/** 税抜・税額などの数値表示 */
export function formatReceiptAmount(amount: number): string {
  return amount.toLocaleString("ja-JP")
}

/** 宛名（例: RK Project（代表者：森本涼子 様）御中） */
export function formatReceiptRecipient(order: OrderRow): string {
  const company = order.invoice_company_name?.trim()
  const name = order.customer_name?.trim() || "—"
  if (company) return `${company}（代表者：${name} 様）御中`
  return `${name} 様`
}
