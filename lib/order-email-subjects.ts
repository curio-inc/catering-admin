import { getAppBrand } from "@/lib/app-brand"
import type { OrderRow } from "@/lib/orders"

/** 店舗向け通知メールの件名（send-order-email と同じ） */
export function buildStoreOrderEmailSubject(order: Pick<OrderRow, "invoice_company_name" | "customer_name">): string {
  const label = order.invoice_company_name?.trim() || order.customer_name?.trim() || "お客様"
  return `【新規注文】${label} 様からのご注文`
}

/** お客様向け確認メールの件名（send-order-email と同じ） */
export function buildCustomerOrderEmailSubject(): string {
  const brand = getAppBrand()
  return `【${brand.displayName}】ご注文ありがとうございました`
}

/** お客様向けキャンセル通知メールの件名 */
export function buildCustomerOrderCancelEmailSubject(): string {
  const brand = getAppBrand()
  return `【${brand.displayName}】ご注文キャンセルのご連絡`
}

/** Stripe 領収書メールの件名 */
export function buildStripeReceiptEmailSubject(): string {
  const brand = getAppBrand()
  return `【${brand.displayName}】からの領収書`
}
