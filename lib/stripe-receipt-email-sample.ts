/** Stripe 領収書メール（通知テンプレプレビュー）用サンプル */

export type StripeReceiptLine = {
  name: string
  amountYen: number
}

export type StripeReceiptEmailSample = {
  receiptNumber: string
  /** 表示用（例: 2026年6月5日） */
  paidAtLabel: string
  paymentMethodLabel: string
  lines: StripeReceiptLine[]
  totalYen: number
}

/** デモプレビュー用（Stripe テスト領収書に近い見た目） */
export function getStripeReceiptEmailSample(): StripeReceiptEmailSample {
  return {
    receiptNumber: "1234-5678",
    paidAtLabel: "2026年6月5日",
    paymentMethodLabel: "VISA - 4242",
    lines: [
      { name: "弁当A", amountYen: 1999 },
      { name: "弁当B", amountYen: 2599 },
      { name: "ドリンク", amountYen: 399 },
    ],
    totalYen: 4997,
  }
}
