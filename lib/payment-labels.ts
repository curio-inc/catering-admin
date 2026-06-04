/** DB の payment_method / 表示ラベル */
export function formatPaymentMethod(paymentMethod: string, paymentMethodLabel: string | null): string {
  if (paymentMethodLabel?.trim()) return paymentMethodLabel.trim()
  const m = paymentMethod?.toLowerCase() ?? ""
  if (m === "invoice") return "請求書払い"
  if (m === "credit" || m === "card" || m === "credit_card") return "クレジットカード"
  if (m === "cash") return "現金払い"
  return paymentMethod || "—"
}
