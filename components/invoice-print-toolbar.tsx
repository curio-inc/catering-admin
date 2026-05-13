"use client"

import Link from "next/link"

export function InvoicePrintToolbar({ orderId }: { orderId: string }) {
  return (
    <div className="no-print sticky top-0 z-10 border-b border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
      <div className="mx-auto flex max-w-[210mm] flex-wrap items-center justify-between gap-3">
        <Link href={`/admin/orders/${orderId}`} className="text-sm font-medium text-[#d97706] hover:underline">
          ← 注文詳細に戻る
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-[#d97706] px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-95"
        >
          印刷 / PDFで保存
        </button>
      </div>
    </div>
  )
}
