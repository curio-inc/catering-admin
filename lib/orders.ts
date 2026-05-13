import { describeSupabaseEnvGap, getSupabaseAdmin } from "@/lib/supabase-admin"

/** `public.orders`（管理用カラム含む） */
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

const listSelectWithAdmin = [
  "id",
  "created_at",
  "updated_at",
  "status",
  "payment_status",
  "subtotal_yen",
  "tax_yen",
  "total_yen",
  "payment_method",
  "payment_method_label",
  "customer_name",
  "customer_phone",
  "delivery_date",
  "delivery_time",
  "admin_opened_at",
  "invoice_issued_at",
  "invoice_sent_at",
].join(", ")

const listSelectLegacy = [
  "id",
  "created_at",
  "updated_at",
  "status",
  "payment_status",
  "subtotal_yen",
  "tax_yen",
  "total_yen",
  "payment_method",
  "payment_method_label",
  "customer_name",
  "customer_phone",
  "delivery_date",
  "delivery_time",
].join(", ")

function listQuery(supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>, select: string) {
  return supabase.from("orders").select(select).order("delivery_date", { ascending: true, nullsFirst: true }).order("created_at", {
    ascending: true,
  })
}

export async function fetchOrdersList(limit = 200): Promise<{ ok: true; rows: OrderRow[] } | { ok: false; message: string }> {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    const gap = describeSupabaseEnvGap()
    return { ok: false, message: gap ?? "Supabase に接続できません。" }
  }

  let { data, error } = await listQuery(supabase, listSelectWithAdmin).limit(limit)

  if (error && /admin_opened_at|invoice_issued_at|invoice_sent_at|column.*does not exist/i.test(error.message)) {
    ;({ data, error } = await listQuery(supabase, listSelectLegacy).limit(limit))
  }

  if (error) {
    const hint =
      /admin_opened_at|invoice_issued_at|invoice_sent_at|column/i.test(error.message)
        ? " Supabase の SQL エディタで `supabase/migrations/20260513120000_order_admin_invoice.sql` を実行してください。"
        : ""
    return { ok: false, message: `${error.message}${hint}` }
  }

  const rows = (data ?? []) as unknown as OrderRow[]
  return { ok: true, rows }
}

export async function fetchOrderWithItems(
  id: string,
): Promise<{ ok: true; order: OrderRow; items: OrderItemRow[] } | { ok: false; message: string }> {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    const gap = describeSupabaseEnvGap()
    return { ok: false, message: gap ?? "Supabase に接続できません。" }
  }

  const { data: order, error: orderErr } = await supabase.from("orders").select("*").eq("id", id).maybeSingle()

  if (orderErr) {
    const hint =
      /admin_opened_at|invoice_issued_at|invoice_sent_at|column/i.test(orderErr.message)
        ? " `supabase/migrations/20260513120000_order_admin_invoice.sql` を Supabase に適用してください。"
        : ""
    return { ok: false, message: `${orderErr.message}${hint}` }
  }
  if (!order) {
    return { ok: false, message: "注文が見つかりません。" }
  }

  const { data: items, error: itemsErr } = await supabase
    .from("order_items")
    .select("id, order_id, menu_name_snapshot, unit_price_yen_snapshot, quantity, custom_text, custom_rows, sort_order")
    .eq("order_id", id)
    .order("sort_order", { ascending: true })

  if (itemsErr) {
    return { ok: false, message: itemsErr.message }
  }

  return {
    ok: true,
    order: order as unknown as OrderRow,
    items: (items ?? []) as unknown as OrderItemRow[],
  }
}
