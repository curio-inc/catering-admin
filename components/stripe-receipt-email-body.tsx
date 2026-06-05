import type { StripeReceiptEmailSample } from "@/lib/stripe-receipt-email-sample"

type StripeReceiptEmailBodyProps = StripeReceiptEmailSample

function yen(n: number) {
  return `¥ ${n.toLocaleString("ja-JP")}`
}

/** クレジットカード決済（Stripe）の領収書メール */
export function StripeReceiptEmailBody({
  receiptNumber,
  paidAtLabel,
  paymentMethodLabel,
  lines,
  totalYen,
}: StripeReceiptEmailBodyProps) {
  const [cardBrand, cardLast4] = splitPaymentMethod(paymentMethodLabel)

  return (
    <div
      className="stripe-receipt-email-view mx-auto max-w-[560px] bg-white text-[#30313d]"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif", lineHeight: 1.5 }}
    >
      <div className="bg-gradient-to-b from-[#f6ebe3] to-[#fdf8f5] px-6 pb-8 pt-10 text-center">
        <div className="mx-auto mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="text-center">
            <span className="mx-auto block h-6 w-5 rounded-sm border-2 border-[#8898aa]" aria-hidden>
              <span className="mt-1 block h-[2px] w-full bg-[#8898aa]" />
              <span className="mt-[3px] block h-[2px] w-full bg-[#cbd5e1]" />
              <span className="mt-[3px] block h-[2px] w-3/4 bg-[#cbd5e1]" />
            </span>
            <span className="mt-1.5 block text-[11px] font-semibold text-[#525f7f]">ロゴ</span>
          </div>
        </div>
        <h1 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[#30313d]">【店舗名】からの領収書</h1>
        <p className="mb-0 mt-2 text-[15px] text-[#8898aa]">領収書 #{receiptNumber}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 border-b border-[#e6ebf1] px-6 py-6">
        <div>
          <p className="mb-1 text-[13px] text-[#8898aa]">支払い金額</p>
          <p className="m-0 text-[15px] font-semibold text-[#30313d]">{yen(totalYen)}</p>
        </div>
        <div>
          <p className="mb-1 text-[13px] text-[#8898aa]">支払い日</p>
          <p className="m-0 text-[15px] font-semibold text-[#30313d]">{paidAtLabel}</p>
        </div>
        <div>
          <p className="mb-1 text-[13px] text-[#8898aa]">支払い方法</p>
          <p className="m-0 flex items-center gap-1.5 text-[15px] font-semibold text-[#30313d]">
            {cardBrand ? <span className="text-[13px] font-bold tracking-wide text-[#1a1f71]">{cardBrand}</span> : null}
            <span>{cardLast4 ? `- ${cardLast4}` : paymentMethodLabel}</span>
          </p>
        </div>
      </div>

      <div className="px-6 py-6">
        <h2 className="mb-3 text-[15px] font-semibold text-[#30313d]">サマリー</h2>
        <div className="overflow-hidden rounded-lg bg-[#f6f9fc] px-5 py-4">
          <table className="w-full border-collapse text-[15px]">
            <tbody>
              {lines.map((line) => (
                <tr key={line.name}>
                  <td className="py-2 pr-4 text-left text-[#30313d]">{line.name}</td>
                  <td className="py-2 text-right font-normal text-[#30313d]">{yen(line.amountYen)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="my-3 border-t border-[#e6ebf1]" />
          <div className="flex items-baseline justify-between">
            <span className="text-[15px] font-semibold text-[#30313d]">ご請求額</span>
            <span className="text-[18px] font-bold text-[#30313d]">{yen(totalYen)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function splitPaymentMethod(label: string): [string | null, string | null] {
  const m = /^([A-Za-z]+)\s*-\s*(\d{4})$/.exec(label.trim())
  if (!m) return [null, null]
  return [m[1].toUpperCase(), m[2]]
}
