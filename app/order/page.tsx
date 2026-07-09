import { CustomerOrderPage } from "@/components/order/customer-order-page"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "オンライン注文",
}

export default function PublicOrderPage() {
  const memberSignupUrl = process.env.NEXT_PUBLIC_MEMBER_SIGNUP_URL?.trim() || "/order/signup"

  return <CustomerOrderPage memberSignupUrl={memberSignupUrl} />
}
