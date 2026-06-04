import Link from "next/link"
import { DemoOrderDetail } from "@/components/demo/demo-order-detail"
import { DemoPageShell } from "@/components/demo/demo-page-shell"
import { orderToDemoView } from "@/lib/build-demo-view-model"
import type { OrderItemRow, OrderRow } from "@/lib/orders"

type DemoOrderDetailPageProps = {
  order: OrderRow
  items: OrderItemRow[]
  brandName: string
  backUrl?: string
}

export function DemoOrderDetailPage({ order, items, brandName, backUrl }: DemoOrderDetailPageProps) {
  const view = orderToDemoView(order, items)

  return (
    <DemoPageShell brandName={brandName} backUrl={backUrl}>
      <main className="demo-main demo-main--standalone">
        <p className="demo-standalone-nav">
          <Link href="/admin/orders" className="demo-back">
            ← 注文一覧
          </Link>
        </p>
        <h1 className="demo-panel-title">注文内容</h1>
        <p className="demo-order-meta">
          <span>{view.orderNumber}</span>
          <span className="demo-order-meta-sep">·</span>
          <span>{view.customerName}</span>
        </p>
        <div className="admin-workspace">
          <DemoOrderDetail view={view} />
        </div>
      </main>
    </DemoPageShell>
  )
}
