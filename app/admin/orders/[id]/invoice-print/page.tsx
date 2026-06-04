import { notFound, redirect } from "next/navigation"
import { isDemoMode } from "@/lib/demo-mode"
import { InvoiceFormalDocument } from "@/components/invoice-formal-document"
import { InvoicePrintToolbar } from "@/components/invoice-print-toolbar"
import { StoreOrderEmailBody } from "@/components/store-order-email-body"
import { fetchOrderWithItems } from "@/lib/orders"

export const dynamic = "force-dynamic"

export default async function InvoicePrintPage({ params }: { params: { id: string } }) {
  if (isDemoMode()) {
    redirect(`/admin/orders?panel=invoices&order=${encodeURIComponent(params.id)}`)
  }

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
      <main className="print-invoice-root mx-auto max-w-[210mm] bg-white px-2 pb-12 pt-4 print:max-w-none print:px-0 print:pb-0 print:pt-0">
        {isInvoice ? (
          <InvoiceFormalDocument order={order} items={items} />
        ) : (
          <StoreOrderEmailBody order={order} items={items} mainTitle={mainTitle} />
        )}
      </main>
    </div>
  )
}
