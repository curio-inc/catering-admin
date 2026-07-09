import { notFound } from "next/navigation"
import { DemoCustomerDetailPage } from "@/app/admin/customers/[id]/demo-customer-detail-page"
import { getAppBrand } from "@/lib/app-brand"
import { getDemoCustomerById } from "@/lib/build-demo-customers"

export const dynamic = "force-dynamic"

export default async function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  const brand = getAppBrand()
  const backUrl = process.env.NEXT_PUBLIC_DEMO_BACK_URL?.trim() || undefined
  const customer = getDemoCustomerById(params.id)

  if (!customer) {
    notFound()
  }

  return <DemoCustomerDetailPage customer={customer} brandName={brand.displayName} backUrl={backUrl} />
}
