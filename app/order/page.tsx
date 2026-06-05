import { CustomerOrderPage } from "@/components/order/customer-order-page"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "オンライン注文",
}

export default function PublicOrderPage() {
  return <CustomerOrderPage />
}
