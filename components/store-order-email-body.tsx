import { Fragment } from "react"
import { getDeliveryContext } from "@/lib/order-delivery-context"
import type { OrderItemRow, OrderRow } from "@/lib/orders"

type StoreOrderEmailBodyProps = {
  order: OrderRow
  items: OrderItemRow[]
  /** 既定は店舗メールと同じ「新規注文を受け付けました」。印刷用ページでは「請求書」などに差し替え可能 */
  mainTitle?: string
}

/** 店舗向けメール（send-order-email の storeEmailHtml）と同じ情報・並び（HTML＋Tailwind） */
export function StoreOrderEmailBody({ order, items, mainTitle = "新規注文を受け付けました" }: StoreOrderEmailBodyProps) {
  const { hasAddress, receivingText, deliveryFeeYen, deliveryFeeNote } = getDeliveryContext(order)

  const paymentText = paymentTextLikeStoreEmail(order)

  const caseLine = order.management_number?.trim() || ""

  return (
    <div
      className="store-order-email-view mx-auto max-w-[600px] px-5 py-5 text-[#333] print:px-4 print:py-4"
      style={{ fontFamily: "'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', Meiryo, sans-serif", lineHeight: 1.6 }}
    >
      <div className="mb-6 print:mb-5">
        <h2 className="m-0 text-xl font-semibold leading-snug text-[#d97706] print:text-[22px]">{mainTitle}</h2>
      </div>

      <div className="mb-8 print:mb-6">
        <h3 className="mb-2 border-b-2 border-[#d97706] pb-1 text-base font-semibold text-[#d97706]">お客様情報</h3>
        <div className="rounded-md border border-stone-200 bg-[#f3f4f6] p-4 print:border-stone-300">
          <p>
            <strong>お名前:</strong> {order.customer_name}
          </p>
          <p>
            <strong>会社名:</strong> {order.invoice_company_name ?? ""}
          </p>
          <p>
            <strong>電話番号:</strong> {order.customer_phone}
          </p>
          <p>
            <strong>メールアドレス:</strong> {order.customer_email}
          </p>
          <p>
            <strong>案件名・案件番号:</strong> {caseLine}
          </p>
        </div>
      </div>

      <div className="mb-8 print:mb-6">
        <h3 className="mb-2 border-b-2 border-[#d97706] pb-1 text-base font-semibold text-[#d97706]">受け取り方法</h3>
        <div className="rounded-md border border-stone-200 bg-[#f3f4f6] p-4 print:border-stone-300">
          <p>
            <strong>ご希望:</strong> {receivingText}
          </p>
        </div>
      </div>

      {hasAddress ? (
        <div className="mb-8 print:mb-6">
          <h3 className="mb-2 border-b-2 border-[#d97706] pb-1 text-base font-semibold text-[#d97706]">お届け先</h3>
          <div className="rounded-md border border-stone-200 bg-[#f3f4f6] p-4 print:border-stone-300">
            <p className="whitespace-pre-wrap">{order.customer_address}</p>
          </div>
        </div>
      ) : null}

      <div className="mb-8 print:mb-6 print:break-inside-avoid">
        <h3 className="mb-2 border-b-2 border-[#d97706] pb-1 text-base font-semibold text-[#d97706]">ご注文内容</h3>
        <div className="overflow-hidden rounded-md border border-stone-200 bg-white shadow-sm print:shadow-none">
          <table className="w-full border-collapse text-sm print:text-[11px]">
            <thead>
              <tr className="bg-[#d97706] text-white">
                <th className="px-3 py-3 text-left">商品名</th>
                <th className="px-3 py-3 text-center">数量</th>
                <th className="px-3 py-3 text-right">単価</th>
                <th className="px-3 py-3 text-right">小計</th>
              </tr>
            </thead>
            <tbody>
              {items.map((line) => (
                <Fragment key={line.id}>
                  <tr className="border-b border-[#e5e7eb]">
                    <td className="px-3 py-3 text-left">{line.menu_name_snapshot}</td>
                    <td className="px-3 py-3 text-center">{line.quantity}個</td>
                    <td className="px-3 py-3 text-right">¥{line.unit_price_yen_snapshot.toLocaleString("ja-JP")}</td>
                    <td className="px-3 py-3 text-right">
                      ¥{(line.unit_price_yen_snapshot * line.quantity).toLocaleString("ja-JP")}
                    </td>
                  </tr>
                  <CustomRowsBlock line={line} />
                  <CustomTextRow line={line} />
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-8 print:mb-6 print:break-inside-avoid">
        <h3 className="mb-2 border-b-2 border-[#d97706] pb-1 text-base font-semibold text-[#d97706]">お支払い・合計金額</h3>
        <div className="rounded-md border border-stone-200 bg-[#f3f4f6] p-4 print:border-stone-300">
          <p>
            <strong>小計（商品）:</strong> ¥{order.subtotal_yen.toLocaleString("ja-JP")}
          </p>
          {hasAddress ? (
            <p>
              <strong>配達料:</strong> ¥{deliveryFeeYen.toLocaleString("ja-JP")}
            </p>
          ) : null}
          <p>
            <strong>消費税(8%):</strong> ¥{order.tax_yen.toLocaleString("ja-JP")}
          </p>
          <p className="text-lg font-bold text-[#d97706]">
            <strong>合計金額:</strong> ¥{order.total_yen.toLocaleString("ja-JP")}
          </p>
          <p className="mt-1.5 text-sm text-[#6b7280]">{deliveryFeeNote}</p>
          <p className="mt-2">
            <strong>支払い方法:</strong> {paymentText}
          </p>
          {order.payment_method === "invoice" && order.invoice_company_name ? (
            <>
              <p>
                <strong>宛名:</strong> {order.invoice_company_name}
              </p>
              <p>
                <strong>住所:</strong> {order.invoice_billing_address ?? ""}
              </p>
            </>
          ) : null}
        </div>
      </div>

      {order.notes?.trim() ? (
        <div className="mb-8 print:mb-6">
          <h3 className="mb-2 border-b-2 border-[#d97706] pb-1 text-base font-semibold text-[#d97706]">特別なご要望</h3>
          <div className="rounded-md border border-stone-200 bg-[#f3f4f6] p-4 print:border-stone-300">
            <p className="whitespace-pre-wrap">{order.notes}</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

/** 店舗向けメールの `paymentText` と同じ（支払い方法の行） */
function paymentTextLikeStoreEmail(order: OrderRow): string {
  const m = order.payment_method?.toLowerCase() ?? ""
  if (m === "invoice") return "請求書払い"
  if (m === "credit" || m === "card") return "クレジットカード"
  if (m === "cash") return "現金払い（領収書必要）"
  return order.payment_method || ""
}

function CustomRowsBlock({ line }: { line: OrderItemRow }) {
  const rows = Array.isArray(line.custom_rows) ? (line.custom_rows as { text?: string; quantity?: number }[]) : []
  if (rows.length === 0) return null
  return (
    <tr>
      <td colSpan={4} className="bg-[#f9fafb] px-3 py-2">
        <div className="mb-2 text-[13px] text-[#6b7280]">文字・個数明細</div>
        <table className="w-full border-collapse bg-white text-sm">
          <thead>
            <tr className="bg-[#f3f4f6]">
              <th className="border border-[#e5e7eb] px-2 py-2 text-left">文字</th>
              <th className="w-[100px] border border-[#e5e7eb] px-2 py-2 text-center">個数</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="border border-[#e5e7eb] px-2 py-2">{row.text || "-"}</td>
                <td className="border border-[#e5e7eb] px-2 py-2 text-center">{row.quantity ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </td>
    </tr>
  )
}

function CustomTextRow({ line }: { line: OrderItemRow }) {
  const rows = Array.isArray(line.custom_rows) ? line.custom_rows.length : 0
  if (!line.custom_text?.trim() || rows > 0) return null
  return (
    <tr>
      <td colSpan={4} className="bg-[#f9fafb] px-3 py-2 text-sm text-[#6b7280]">
        焼印文字: {line.custom_text}
      </td>
    </tr>
  )
}
