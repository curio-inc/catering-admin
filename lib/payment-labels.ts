/** DB の payment_method / 表示ラベル */
export function formatPaymentMethod(paymentMethod: string, paymentMethodLabel: string | null): string {
  if (paymentMethodLabel?.trim()) return paymentMethodLabel.trim()
  const m = paymentMethod?.toLowerCase() ?? ""
  if (m === "invoice") return "請求書払い"
  if (m === "credit" || m === "card" || m === "credit_card") return "クレジットカード"
  if (m === "cash") return "現金払い"
  return paymentMethod || "—"
}

export function isCreditCardPayment(paymentMethod: string): boolean {
  const m = paymentMethod?.toLowerCase() ?? ""
  return m === "credit" || m === "card" || m === "credit_card"
}

/** 手動での領収書発行が必要か（クレカは Stripe 自動送付のため不要） */
export function needsManualReceipt(paymentMethod: string): boolean {
  return !isCreditCardPayment(paymentMethod)
}
