import Link from "next/link"
import { notFound } from "next/navigation"
import { SendInvoiceButton } from "@/components/send-invoice-button"
import { StoreOrderEmailBody } from "@/components/store-order-email-body"
import { fetchOrderWithItems } from "@/lib/orders"
import { issueInvoiceAction, markOrderOpened, sendInvoiceAction } from "../actions"

export const dynamic = "force-dynamic"

function formatTs(iso: string | null | undefined) {
  if (!iso) return null
  try {
    return new Intl.DateTimeFormat("ja-JP", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Tokyo",
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  await markOrderOpened(params.id)
  const res = await fetchOrderWithItems(params.id)
  if (!res.ok) {
    if (res.message === "注文が見つかりません。") notFound()
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{res.message}</p>
        <Link href="/admin/orders" className="mt-4 inline-block text-sg-amber underline">
          一覧へ
        </Link>
      </div>
    )
  }

  const { order, items } = res
  const isInvoice = order.payment_method === "invoice"
  const issued = !!order.invoice_issued_at
  const sent = !!order.invoice_sent_at

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-stone-200 bg-stone-50 px-4 py-3">
        <Link href="/admin/orders" className="text-sm font-medium text-[#d97706] hover:underline">
          ← 注文一覧
        </Link>
      </div>

      <StoreOrderEmailBody order={order} items={items} />

      {isInvoice ? (
        <div className="mx-auto max-w-[600px] border-t border-amber-200 bg-amber-50/80 px-5 py-6">
          <h2 className="mb-3 text-sm font-semibold text-amber-900">請求書発行</h2>
          <ul className="mb-4 space-y-1 text-sm text-amber-950">
            <li>
              発行: {order.invoice_issued_at ? <strong>{formatTs(order.invoice_issued_at)}</strong> : "未発行"}
            </li>
            <li>
              送付: {order.invoice_sent_at ? <strong>{formatTs(order.invoice_sent_at)}</strong> : "未送付"}
            </li>
          </ul>
          <div className="flex flex-wrap items-center gap-3">
            <form action={issueInvoiceAction}>
              <input type="hidden" name="orderId" value={order.id} />
              <button
                type="submit"
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-700"
              >
                PDF発行
              </button>
            </form>
            <SendInvoiceButton
              orderId={order.id}
              issued={issued}
              sent={sent}
              action={sendInvoiceAction}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
