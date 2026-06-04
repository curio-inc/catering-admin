import { getInvoiceIssuer } from "@/lib/invoice-issuer"
import { formatInvoiceNumber, formatJapaneseDate, formatMonthDay, formatYen, inferTaxPercentLabel } from "@/lib/invoice-format"
import { getDeliveryContext } from "@/lib/order-delivery-context"
import type { OrderItemRow, OrderRow } from "@/lib/orders"

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

  const due = new Date(billIso)
  due.setDate(due.getDate() + issuer.paymentDueDays)
  const dueLabel = formatJapaneseDate(due.toISOString())

  const tableRows = buildTableRows(order, items, hasAddress, deliveryFeeYen)

  const taxableBase = order.subtotal_yen + (hasAddress ? deliveryFeeYen : 0)
  const taxLabel = inferTaxPercentLabel(order.tax_yen, taxableBase)

  const remarks: string[] = [issuer.transferFeeNote]
  const management = order.management_number?.trim()
  if (management) remarks.push(`案件管理番号: ${management}`)

  return (
    <div
      className="invoice-formal invoice-formal-a4 invoice-formal-one-page"
      style={{ fontFamily: jpSans }}
    >
      <h1 className="invoice-formal-title">
        請求書<span className="invoice-formal-title-sub">（ケータリングサービス）</span>
      </h1>
      <hr className="invoice-formal-rule" />

      <div className="invoice-formal-header">
        <div className="invoice-formal-header-left">
          <p className="invoice-formal-recipient">{recipientLine}</p>
          <div className="invoice-formal-meta">
            <p>
              <span className="invoice-formal-meta-label">取引方法</span>
              銀行振込
            </p>
            {order.delivery_date ? (
              <p>
                <span className="invoice-formal-meta-label">実施期間</span>
                {formatMonthDay(order.delivery_date)}
              </p>
            ) : null}
            <p>
              <span className="invoice-formal-meta-label">振込期日</span>
              月末締め翌月末迄
            </p>
          </div>
          <div className="invoice-formal-service">
            <p className="invoice-formal-muted">商品及びサービス名</p>
            <p>お弁当/ケータリング</p>
          </div>
        </div>
        <div className="invoice-formal-header-right">
          <p>
            <span className="invoice-formal-muted">請求日</span>{" "}
            <span className="invoice-formal-strong">{billDateLabel}</span>
          </p>
          <p className="invoice-formal-header-gap">
            <span className="invoice-formal-muted">請求書番号</span>{" "}
            <span className="invoice-formal-strong">{invoiceNo}</span>
          </p>
          <div className="invoice-formal-issuer">
            <p className="invoice-formal-strong">{issuer.companyName}</p>
            {issuer.repName.trim() ? <p>{issuer.repName}</p> : null}
            <p className="invoice-formal-issuer-address">
              {issuer.postalCode}
              {"\n"}
              {issuer.addressLines}
            </p>
            <p>
              {issuer.tel}
              <br />
              {issuer.email}
            </p>
            {issuer.registrationNumber.trim() ? (
              <p className="invoice-formal-registration">
                適格請求書発行事業者登録番号
                <br />
                {issuer.registrationNumber}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <section className="invoice-formal-total-block">
        <p className="invoice-formal-total-label">請求金額</p>
        <p className="invoice-formal-total-amount">{formatYen(order.total_yen)}</p>
      </section>

      <section className="invoice-formal-lines">
        <table className="invoice-formal-table">
          <thead>
            <tr>
              <th>品名</th>
              <th className="invoice-formal-col-num">単価</th>
              <th className="invoice-formal-col-qty">数量</th>
              <th className="invoice-formal-col-num">金額</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, i) => (
              <tr key={i}>
                <td>{row.name}</td>
                <td className="invoice-formal-col-num">{formatYen(row.unit)}</td>
                <td className="invoice-formal-col-qty">{row.qtyLabel}</td>
                <td className="invoice-formal-col-num">{formatYen(row.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-formal-summary-wrap">
          <table className="invoice-formal-summary">
            <tbody>
              <tr>
                <th>小計</th>
                <td>{formatYen(taxableBase)}</td>
              </tr>
              <tr>
                <th>消費税（{taxLabel}%）</th>
                <td>{formatYen(order.tax_yen)}</td>
              </tr>
              <tr>
                <th className="invoice-formal-summary-grand-label">合計</th>
                <td className="invoice-formal-summary-grand-value">{formatYen(order.total_yen)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <footer className="invoice-formal-footer">
        <div>
          <p className="invoice-formal-footer-label">振込期日</p>
          <p>{dueLabel}</p>
        </div>
        <div>
          <p className="invoice-formal-footer-label">お振込先</p>
          <pre className="invoice-formal-bank">{issuer.bankLines}</pre>
        </div>
        <div className="invoice-formal-remarks-box">
          <p className="invoice-formal-remarks-title">備考</p>
          <p className="invoice-formal-remarks-body">{remarks.filter(Boolean).join("\n\n")}</p>
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
