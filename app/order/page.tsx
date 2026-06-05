import { CustomerOrderPage } from "@/components/order/customer-order-page"
import { getAppBrand } from "@/lib/app-brand"
import { isDemoMode } from "@/lib/demo-mode"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "オンライン注文",
}

export default function PublicOrderPage() {
  if (!isDemoMode()) {
    notFound()
  }

  const brand = getAppBrand()
  return <CustomerOrderPage brandName={brand.displayName} />
}
