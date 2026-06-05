"use client"

import Link from "next/link"
import { useCallback, useMemo, useRef, useState } from "react"
import { DemoOrderDetail } from "@/components/demo/demo-order-detail"
import { DemoPageShell } from "@/components/demo/demo-page-shell"
import { orderToDemoView, type DemoOrderView } from "@/lib/build-demo-view-model"
import { applyDemoDeliveries } from "@/lib/demo-order-delivery"
import type { OrderItemRow, OrderRow } from "@/lib/orders"

type DemoOrderDetailPageProps = {
  order: OrderRow
  items: OrderItemRow[]
  brandName: string
  backUrl?: string
}

export function DemoOrderDetailPage({ order, items, brandName, backUrl }: DemoOrderDetailPageProps) {
  const baseView = useMemo(() => orderToDemoView(order, items), [order, items])
  const [view, setView] = useState<DemoOrderView>(() => applyDemoDeliveries([baseView])[0] ?? baseView)
  const [toast, setToast] = useState("")
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(""), 2800)
  }, [])

  return (
    <DemoPageShell brandName={brandName} backUrl={backUrl}>
      <main className="demo-main demo-main--standalone">
        <p className="demo-standalone-nav">
          <Link href="/admin/orders" className="demo-back">
            ← 注文一覧
          </Link>
        </p>
        <div className="demo-order-detail-head">
          <div>
            <h1 className="demo-panel-title">注文詳細</h1>
            <p className="demo-order-meta">
              <span>{view.orderNumber}</span>
              <span className="demo-order-meta-sep">·</span>
              <span>{view.customerName}</span>
            </p>
          </div>
        </div>
        <div className="admin-workspace">
          <DemoOrderDetail
            view={view}
            onDeliveryChange={setView}
            onSaved={showToast}
          />
        </div>
      </main>
      {toast ? (
        <div className="demo-toast" role="status">
          {toast}
        </div>
      ) : null}
    </DemoPageShell>
  )
}
