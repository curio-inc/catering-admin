import { notFound } from "next/navigation"
import { InvoicePrintToolbar } from "@/components/invoice-print-toolbar"
import { ReceiptFormalDocument } from "@/components/receipt-formal-document"
import { fetchOrderWithItems } from "@/lib/orders"
import { needsManualReceipt } from "@/lib/payment-labels"

export const dynamic = "force-dynamic"

export default async function ReceiptPrintPage({ params }: { params: { id: string } }) {
  const res = await fetchOrderWithItems(params.id)
  if (!res.ok) {
    if (res.message === "注文が見つかりません。") notFound()
    return (
      <div className="p-6">
        <p className="text-red-700">{res.message}</p>
      </div>
    )
  }

  const { order } = res
  if (!needsManualReceipt(order.payment_method)) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-stone-100 print:bg-white">
      <InvoicePrintToolbar orderId={params.id} />
      <main className="print-invoice-root mx-auto max-w-[210mm] px-4 py-6 print:max-w-none print:px-0 print:py-0">
        <ReceiptFormalDocument order={order} />
      </main>
    </div>
  )
}
