import { AdminDemoApp } from "@/components/demo/admin-demo-app"
import { getAppBrand } from "@/lib/app-brand"
import { buildDemoOrdersForClient } from "@/lib/build-demo-view-model"
import { isDemoMode } from "@/lib/demo-mode"
import OrdersProductionPage from "./orders-production"

export const dynamic = "force-dynamic"

type SearchParams = {
  from?: string
  to?: string
  order?: string
  panel?: string
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  if (isDemoMode()) {
    const brand = getAppBrand()
    const backUrl = process.env.NEXT_PUBLIC_DEMO_BACK_URL?.trim() || undefined
    const panelParam = searchParams.panel?.trim()
    const initialPanel =
      panelParam === "invoices"
        ? "invoices"
        : panelParam === "settings"
          ? "settings"
          : panelParam === "orders-calendar"
            ? "orders-calendar"
            : "orders"
    const invoiceOrderId = panelParam === "invoices" ? searchParams.order?.trim() : undefined

    return (
      <AdminDemoApp
        brandName={brand.displayName}
        backUrl={backUrl}
        initialOrders={buildDemoOrdersForClient()}
        initialSelectedId={invoiceOrderId}
        initialPanel={initialPanel}
      />
    )
  }

  return <OrdersProductionPage searchParams={searchParams} />
}
