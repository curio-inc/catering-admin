import Link from "next/link"
import { notFound } from "next/navigation"
import { DemoOrderDetailPage } from "@/app/admin/orders/[id]/demo-order-detail-page"
import { getAppBrand } from "@/lib/app-brand"
import { fetchOrderWithItems } from "@/lib/orders"

export const dynamic = "force-dynamic"

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const brand = getAppBrand()
  const backUrl = process.env.NEXT_PUBLIC_DEMO_BACK_URL?.trim() || undefined
  const res = await fetchOrderWithItems(params.id)

  if (!res.ok) {
    if (res.message === "注文が見つかりません。") notFound()
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{res.message}</p>
        <Link href="/admin/orders" className="demo-back mt-4 inline-block">
          ← 注文一覧
        </Link>
      </div>
    )
  }

  return (
    <DemoOrderDetailPage order={res.order} items={res.items} brandName={brand.displayName} backUrl={backUrl} />
  )
}
