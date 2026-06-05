import { MOCK_ORDER_ITEMS, MOCK_ORDERS } from "@/lib/mock-orders"

/** デモ用 `public.orders` 相当 */
export type OrderRow = {
  id: string
  order_number?: string
  created_at: string
  updated_at: string
  status: string
  payment_status: string
  subtotal_yen: number
  tax_yen: number
  total_yen: number
  payment_method: string
  payment_method_label: string | null
  cash_receipt_required: boolean | null
  invoice_company_name: string | null
  invoice_billing_address: string | null
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_address: string | null
  delivery_date: string | null
  delivery_time: string | null
  notes: string | null
  management_number: string | null
  source: string
  admin_opened_at?: string | null
  invoice_issued_at?: string | null
  invoice_sent_at?: string | null
}

export type OrderItemRow = {
  id: string
  order_id: string
  menu_name_snapshot: string
  unit_price_yen_snapshot: number
  quantity: number
  custom_text: string | null
  custom_rows: unknown | null
  sort_order: number
}

export async function fetchOrderWithItems(
  id: string,
): Promise<{ ok: true; order: OrderRow; items: OrderItemRow[] } | { ok: false; message: string }> {
  const order = MOCK_ORDERS.find((o) => o.id === id)
  if (!order) return { ok: false, message: "注文が見つかりません。" }
  const items = MOCK_ORDER_ITEMS[id] ?? []
  return { ok: true, order, items }
}
