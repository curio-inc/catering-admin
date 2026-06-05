import type { OrderItemRow, OrderRow } from "@/lib/orders"
import type { StripeReceiptEmailSample } from "@/lib/stripe-receipt-email-sample"

function formatPaidAtLabel(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Tokyo",
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

/** 注文データから Stripe 領収書プレビュー用データを生成 */
export function buildStripeReceiptFromOrder(order: OrderRow, items: OrderItemRow[]): StripeReceiptEmailSample {
  const receiptNumber =
    order.order_number?.replace(/^DM-/, "").replace(/-/g, "-") ||
    order.id.replace(/^mock-/, "").padStart(8, "0")

  return {
    receiptNumber,
    paidAtLabel: formatPaidAtLabel(order.updated_at || order.created_at),
    paymentMethodLabel: "VISA - 4242",
    lines: items.map((line) => ({
      name: line.menu_name_snapshot,
      amountYen: line.unit_price_yen_snapshot * line.quantity,
    })),
    totalYen: order.total_yen,
  }
}
