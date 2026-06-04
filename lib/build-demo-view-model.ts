import { getDeliveryContext } from "@/lib/order-delivery-context"
import { formatPaymentMethod } from "@/lib/payment-labels"
import { MOCK_ORDER_ITEMS, MOCK_ORDERS } from "@/lib/mock-orders"
import type { OrderItemRow, OrderRow } from "@/lib/orders"

export type DemoUiStatus = "new" | "processing" | "done" | "cancelled"

export type DemoOrderView = {
  id: string
  orderNumber: string
  receivedLabel: string
  customerName: string
  deliveryLabel: string
  deliveryYear: number | null
  deliveryMonth: number | null
  /** お届け日 YYYY-MM-DD（カレンダー用） */
  deliveryDateKey: string | null
  totalYen: number
  uiStatus: DemoUiStatus
  order: OrderRow
  items: OrderItemRow[]
  form: {
    receiving: string
    pay: string
    companyName: string
    billingAddress: string
    name: string
    phone: string
    email: string
    address: string
    date: string
    time: string
    note: string
    caseNameAndNumber: string
  }
  isInvoicePay: boolean
  createdAtMs: number
  deliveryMs: number
}

export function statusToUi(status: string): DemoUiStatus {
  if (status === "cancelled") return "cancelled"
  if (status === "requested") return "new"
  if (status === "delivered") return "done"
  if (status === "confirmed" || status === "preparing") return "processing"
  return "new"
}

export function uiStatusToDb(ui: DemoUiStatus): string {
  if (ui === "new") return "requested"
  if (ui === "processing") return "confirmed"
  if (ui === "done") return "delivered"
  return "cancelled"
}

function formatReceived(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ja-JP", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Tokyo",
    }).format(new Date(iso))
  } catch {
    return "—"
  }
}

function formatDelivery(order: OrderRow): string {
  if (!order.delivery_date?.trim()) return "—"
  const d = order.delivery_date.trim()
  const t = order.delivery_time?.trim()
  return t ? `${d} ${t}` : d
}

function parseDeliveryYm(deliveryDate: string | null): { y: number; mo: number } | null {
  if (!deliveryDate?.trim()) return null
  const m = /^(\d{4})-(\d{2})/.exec(deliveryDate.trim())
  if (!m) return null
  return { y: Number(m[1]), mo: Number(m[2]) }
}

function deliveryTimestamp(order: OrderRow): number {
  const d = order.delivery_date?.trim()
  if (!d) return Number.MAX_SAFE_INTEGER
  const t = order.delivery_time?.trim() ?? "00:00"
  const parsed = Date.parse(`${d}T${t}:00+09:00`)
  return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed
}

export function orderToDemoView(order: OrderRow, items: OrderItemRow[]): DemoOrderView {
  const { hasAddress, receivingText } = getDeliveryContext(order)
  const pay = formatPaymentMethod(order.payment_method, order.payment_method_label)
  const ym = parseDeliveryYm(order.delivery_date)

  return {
    id: order.id,
    orderNumber: order.order_number?.trim() || order.id,
    receivedLabel: formatReceived(order.created_at),
    customerName: order.customer_name,
    deliveryLabel: formatDelivery(order),
    deliveryYear: ym?.y ?? null,
    deliveryMonth: ym?.mo ?? null,
    deliveryDateKey: order.delivery_date?.trim() || null,
    totalYen: order.total_yen,
    uiStatus: statusToUi(order.status),
    order,
    items,
    form: {
      receiving: receivingText,
      pay,
      companyName: order.invoice_company_name?.trim() ?? "",
      billingAddress: order.invoice_billing_address?.trim() ?? "",
      name: order.customer_name,
      phone: order.customer_phone,
      email: order.customer_email,
      address: order.customer_address?.trim() ?? "",
      date: order.delivery_date?.trim() ?? "",
      time: order.delivery_time?.trim() ?? "",
      note: order.notes?.trim() ?? "",
      caseNameAndNumber: order.management_number?.trim() || "—",
    },
    isInvoicePay: order.payment_method === "invoice",
    createdAtMs: Date.parse(order.created_at) || 0,
    deliveryMs: deliveryTimestamp(order),
  }
}

export function buildDemoOrdersForClient(): DemoOrderView[] {
  return MOCK_ORDERS.map((o) => orderToDemoView(o, MOCK_ORDER_ITEMS[o.id] ?? []))
}

export function filterOrdersByDeliveryMonth(
  list: DemoOrderView[],
  year: number,
  month: number,
): DemoOrderView[] {
  return list.filter((o) => o.deliveryYear === year && o.deliveryMonth === month)
}

export function sortDemoOrders(list: DemoOrderView[], mode: "recent" | "delivery"): DemoOrderView[] {
  const copy = [...list]
  if (mode === "delivery") {
    copy.sort((a, b) => {
      if (a.deliveryMs !== b.deliveryMs) return a.deliveryMs - b.deliveryMs
      return a.id.localeCompare(b.id)
    })
  } else {
    copy.sort((a, b) => {
      if (b.createdAtMs !== a.createdAtMs) return b.createdAtMs - a.createdAtMs
      return b.id.localeCompare(a.id)
    })
  }
  return copy
}
