import { notFound } from "next/navigation"
import { InvoicePrintToolbar } from "@/components/invoice-print-toolbar"
import { StoreOrderEmailBody } from "@/components/store-order-email-body"
import { fetchOrderWithItems } from "@/lib/orders"

export const dynamic = "force-dynamic"

export default async function InvoicePrintPage({ params }: { params: { id: string } }) {
  const res = await fetchOrderWithItems(params.id)
  if (!res.ok) {
    if (res.message === "注文が見つかりません。") notFound()
    return (
      <div className="p-6">
        <p className="text-red-700">{res.message}</p>
      </div>
    )
  }

  const { order, items } = res
  const isInvoice = order.payment_method === "invoice"
  const mainTitle = isInvoice ? "請求書" : "注文確認（印刷用）"

  return (
    <div className="min-h-screen bg-white print:bg-white">
      <InvoicePrintToolbar orderId={params.id} />
      <main className="print-invoice-root mx-auto max-w-[600px] bg-white px-2 pb-12 pt-4 print:px-0 print:pt-0">
        <p className="no-print mb-2 text-center text-xs text-stone-500">SPAMS GOOD · {mainTitle}</p>
        <StoreOrderEmailBody order={order} items={items} mainTitle={mainTitle} />
      </main>
    </div>
  )
}
