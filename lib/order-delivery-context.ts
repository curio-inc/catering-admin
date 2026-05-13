import type { OrderRow } from "@/lib/orders"

/** 店舗メール・請求書 PDF 共通の受取／配達料の解釈 */
export function getDeliveryContext(order: Pick<OrderRow, "customer_address" | "subtotal_yen" | "tax_yen" | "total_yen">) {
  const hasAddress = Boolean(order.customer_address?.trim())
  const receivingText = hasAddress ? "デリバリー" : "店舗受け取り"
  const deliveryFeeYen = hasAddress ? Math.max(0, order.total_yen - order.subtotal_yen - order.tax_yen) : 0
  const deliveryFeeNote = !hasAddress
    ? "※店舗受け取りのため、配達料は不要です。"
    : deliveryFeeYen > 0
      ? `※配達料 ¥${deliveryFeeYen.toLocaleString("ja-JP")}（税抜）を加算し、消費税は商品代と配達料の合計に対して算出しています。`
      : "※お届け先住所に東京23区内の区名が判別できない場合、配達料は確定前に¥0となり、後日確認のご連絡をする場合があります。"
  return { hasAddress, receivingText, deliveryFeeYen, deliveryFeeNote }
}
