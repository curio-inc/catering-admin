import { MOCK_ORDER_ITEMS, MOCK_ORDERS } from "@/lib/mock-orders"
import type { OrderItemRow, OrderRow } from "@/lib/orders"

/** 通知メールテンプレプレビュー用（デリバリー・複数明細・備考あり） */
const SAMPLE_ORDER_ID = "mock-001"
const SAMPLE_CANCEL_ORDER_ID = "mock-005"

export function getOrderEmailSample(): { order: OrderRow; items: OrderItemRow[] } {
  const order = MOCK_ORDERS.find((o) => o.id === SAMPLE_ORDER_ID) ?? MOCK_ORDERS[0]
  const items = MOCK_ORDER_ITEMS[order.id] ?? []
  return { order, items }
}

export function getCancelOrderEmailSample(): { order: OrderRow; items: OrderItemRow[] } {
  const order = MOCK_ORDERS.find((o) => o.id === SAMPLE_CANCEL_ORDER_ID) ?? MOCK_ORDERS[0]
  const items = MOCK_ORDER_ITEMS[order.id] ?? []
  return { order, items }
}
