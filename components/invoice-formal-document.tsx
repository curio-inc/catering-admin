import { getInvoiceIssuer } from "@/lib/invoice-issuer"
import { formatInvoiceNumber, formatJapaneseDate, formatYen, inferTaxPercentLabel } from "@/lib/invoice-format"
import { getDeliveryContext } from "@/lib/order-delivery-context"
import type { OrderItemRow, OrderRow } from "@/lib/orders"

/** 印刷1枚に収めやすいよう空行は最小限 */
const MIN_LINE_ROWS = 2

const jpSans =
  "'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', Meiryo, 'Noto Sans JP', sans-serif"

type InvoiceFormalDocumentProps = {
  order: OrderRow
  items: OrderItemRow[]
}

export function InvoiceFormalDocument({ order, items }: InvoiceFormalDocumentProps) {
  const issuer = getInvoiceIssuer()
  const { hasAddress, deliveryFeeYen } = getDeliveryContext(order)

  const billIso = order.invoice_issued_at ?? new Date().toISOString()
  const billDateLabel = formatJapaneseDate(billIso)
  const invoiceNo = formatInvoiceNumber(order)

  const recipientLine = order.invoice_company_name?.trim()
    ? `${order.invoice_company_name} 御中`
    : `${order.customer_name} 様`

  const billingAddr = order.invoice_billing_address?.trim()

  const due = new Date(billIso)
  due.setDate(due.getDate() + issuer.paymentDueDays)
  const dueLabel = formatJapaneseDate(due.toISOString())

  const tableRows = buildTableRows(order, items, hasAddress, deliveryFeeYen)
  const padCount = Math.max(0, MIN_LINE_ROWS - tableRows.length)

  const taxableBase = order.subtotal_yen + (hasAddress ? deliveryFeeYen : 0)
  const taxLabel = inferTaxPercentLabel(order.tax_yen, taxableBase)

  const remarks: string[] = [issuer.transferFeeNote]
  const management = order.management_number?.trim()
  if (management) remarks.push(`案件管理番号: ${management}`)

  return (
    <div
      className="invoice-formal invoice-formal-a4 mx-auto max-w-[210mm] px-6 py-8 text-[13px] text-black print:max-w-none print:px-0 print:py-0 print:text-[11px] print:leading-snug"
      style={{ fontFamily: jpSans, lineHeight: 1.65 }}
    >
      <h1 className="m-0 text-center text-2xl font-bold tracking-[0.2em] print:text-[20px] print:tracking-[0.15em]">
        請求書
      </h1>

      <div className="mt-8 flex flex-wrap items-start justify-between gap-6 print:mt-3 print:gap-3">
        <div className="min-w-[200px] flex-1">
          <p className="m-0 text-[17px] font-semibold leading-snug print:text-[13px]">{recipientLine}</p>
          {billingAddr ? (
            <p className="mt-3 whitespace-pre-wrap text-[12px] leading-relaxed text-stone-700 print:mt-1 print:text-[10px]">
              {billingAddr}
            </p>
          ) : null}
        </div>
        <div className="w-full max-w-[300px] text-right sm:w-auto print:max-w-[48%]">
          <p className="m-0">
            <span className="text-stone-600">請求日</span>{" "}
            <span className="font-medium">{billDateLabel}</span>
          </p>
          <p className="mt-2 print:mt-1">
            <span className="text-stone-600">請求書番号</span>{" "}
            <span className="font-medium">{invoiceNo}</span>
          </p>
          <div className="mt-6 border-t border-stone-200 pt-4 text-left text-[12px] leading-relaxed print:mt-2 print:pt-2 print:text-[10px]">
            <p className="m-0 font-semibold">{issuer.companyName}</p>
            {issuer.repName.trim() ? <p className="m-0 mt-1">{issuer.repName}</p> : null}
            <p className={`m-0 ${issuer.repName.trim() ? "mt-2" : "mt-1"}`}>
              {issuer.postalCode}
              <br />
              {issuer.addressLines}
            </p>
            <p className="m-0 mt-2">
              {issuer.tel}
              <br />
              {issuer.email}
            </p>
          </div>
        </div>
      </div>

      <section className="mt-10 print:mt-3 print:break-inside-avoid">
        <p className="m-0 text-sm font-medium text-stone-800 print:text-xs">請求金額</p>
        <p className="mt-2 border-b-[3px] border-black pb-0.5 text-3xl font-bold tracking-wide print:mt-1 print:border-b-2 print:text-[22px]">
          {formatYen(order.total_yen)}
        </p>
      </section>

      <section className="mt-8 print:mt-3 print:break-inside-avoid">
        <table className="w-full border-collapse border border-black text-[12px] print:text-[10px]">
          <thead>
            <tr className="bg-black text-white">
              <th className="border border-black px-2 py-2 text-left font-semibold print:px-1.5 print:py-1">品名</th>
              <th className="w-[22%] border border-black px-2 py-2 text-right font-semibold print:px-1.5 print:py-1">単価</th>
              <th className="w-[14%] border border-black px-2 py-2 text-center font-semibold print:px-1.5 print:py-1">数量</th>
              <th className="w-[22%] border border-black px-2 py-2 text-right font-semibold print:px-1.5 print:py-1">金額</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, i) => (
              <tr key={i} className="align-top">
                <td className="border border-stone-400 px-2 py-1.5 text-left print:px-1.5 print:py-1">{row.name}</td>
                <td className="border border-stone-400 px-2 py-1.5 text-right tabular-nums print:px-1.5 print:py-1">
                  {formatYen(row.unit)}
                </td>
                <td className="border border-stone-400 px-2 py-1.5 text-center print:px-1.5 print:py-1">{row.qtyLabel}</td>
                <td className="border border-stone-400 px-2 py-1.5 text-right tabular-nums print:px-1.5 print:py-1">
                  {formatYen(row.amount)}
                </td>
              </tr>
            ))}
            {Array.from({ length: padCount }).map((_, i) => (
              <tr key={`pad-${i}`}>
                <td className="h-7 border border-stone-300 px-2 py-0.5 print:h-6">&nbsp;</td>
                <td className="border border-stone-300 px-2 py-0.5">&nbsp;</td>
                <td className="border border-stone-300 px-2 py-0.5">&nbsp;</td>
                <td className="border border-stone-300 px-2 py-0.5">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end print:mt-2 print:break-inside-avoid">
          <table className="w-full max-w-[260px] border-collapse border border-stone-400 text-[12px] print:max-w-[220px] print:text-[10px]">
            <tbody>
              <tr>
                <th className="border border-stone-400 bg-stone-200 px-3 py-1.5 text-left font-normal print:px-2 print:py-1">
                  小計
                </th>
                <td className="border border-stone-400 px-3 py-1.5 text-right tabular-nums font-medium print:px-2 print:py-1">
                  {formatYen(taxableBase)}
                </td>
              </tr>
              <tr>
                <th className="border border-stone-400 bg-stone-200 px-3 py-1.5 text-left font-normal print:px-2 print:py-1">
                  消費税（{taxLabel}%）
                </th>
                <td className="border border-stone-400 px-3 py-1.5 text-right tabular-nums font-medium print:px-2 print:py-1">
                  {formatYen(order.tax_yen)}
                </td>
              </tr>
              <tr>
                <th className="border border-stone-400 bg-stone-300 px-3 py-1.5 text-left font-semibold print:px-2 print:py-1">
                  合計
                </th>
                <td className="border border-stone-400 px-3 py-1.5 text-right text-base font-bold tabular-nums print:px-2 print:py-1 print:text-[12px]">
                  {formatYen(order.total_yen)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <footer className="mt-10 space-y-4 text-[12px] print:mt-3 print:space-y-1.5 print:text-[10px]">
        <div>
          <p className="m-0 font-semibold text-stone-900">振込期日</p>
          <p className="m-0 mt-1">{dueLabel}</p>
        </div>
        <div>
          <p className="m-0 font-semibold text-stone-900">お振込先</p>
          <pre className="m-0 mt-1 whitespace-pre-wrap font-sans leading-relaxed">{issuer.bankLines}</pre>
        </div>
        <div className="rounded-sm border border-stone-800 px-3 py-3 print:px-2 print:py-2 print:break-inside-auto">
          <p className="m-0 mb-2 text-xs font-semibold text-stone-800 print:mb-1 print:text-[10px]">備考</p>
          <p className="m-0 whitespace-pre-wrap leading-relaxed text-stone-800 print:leading-snug">
            {remarks.filter(Boolean).join("\n\n")}
          </p>
        </div>
      </footer>
    </div>
  )
}

type TableRow = { name: string; unit: number; qtyLabel: string; amount: number }

function buildTableRows(
  order: OrderRow,
  items: OrderItemRow[],
  hasAddress: boolean,
  deliveryFeeYen: number,
): TableRow[] {
  const rows: TableRow[] = []

  for (const line of items) {
    rows.push({
      name: line.menu_name_snapshot,
      unit: line.unit_price_yen_snapshot,
      qtyLabel: String(line.quantity),
      amount: line.unit_price_yen_snapshot * line.quantity,
    })
  }

  if (hasAddress && deliveryFeeYen > 0) {
    rows.push({
      name: "配達料",
      unit: deliveryFeeYen,
      qtyLabel: "1",
      amount: deliveryFeeYen,
    })
  }

  return rows
}
