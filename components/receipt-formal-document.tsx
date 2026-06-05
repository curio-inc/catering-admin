import { getInvoiceIssuer } from "@/lib/invoice-issuer"
import {
  formatReceiptAmount,
  formatReceiptDate,
  formatReceiptNumber,
  formatReceiptRecipient,
  formatReceiptTotalYen,
} from "@/lib/receipt-format"
import type { OrderRow } from "@/lib/orders"

const jpSans =
  "'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', Meiryo, 'Noto Sans JP', sans-serif"

type ReceiptFormalDocumentProps = {
  order: OrderRow
}

/** 日本式の正式領収書（印刷・PDF保存用） */
export function ReceiptFormalDocument({ order }: ReceiptFormalDocumentProps) {
  const issuer = getInvoiceIssuer()
  const issuedIso = order.invoice_issued_at ?? order.updated_at ?? order.created_at
  const taxable10 = order.subtotal_yen
  const tax10 = order.tax_yen

  return (
    <div
      className="receipt-formal receipt-formal-a4 receipt-formal-one-page"
      style={{ fontFamily: jpSans }}
    >
      <header className="receipt-formal-meta">
        <p className="receipt-formal-date">{formatReceiptDate(issuedIso)}</p>
        <p className="receipt-formal-number">領収書番号: {formatReceiptNumber(order)}</p>
      </header>

      <h1 className="receipt-formal-title">領収書</h1>

      <p className="receipt-formal-recipient">
        <span>{formatReceiptRecipient(order)}</span>
      </p>

      <div className="receipt-formal-total-box">
        <span className="receipt-formal-total-label">合計金額</span>
        <span className="receipt-formal-total-value">{formatReceiptTotalYen(order.total_yen)}</span>
      </div>

      <section className="receipt-formal-body">
        <p className="receipt-formal-tadashi">但</p>
        <p className="receipt-formal-ack">上記正に領収いたしました。</p>
        <hr className="receipt-formal-rule" />
      </section>

      <footer className="receipt-formal-footer">
        <div className="receipt-formal-tax-col">
          <div className="receipt-formal-tax-row">
            <span className="receipt-formal-tax-label">10%対象</span>
            <span className="receipt-formal-tax-value">{formatReceiptAmount(taxable10)}</span>
          </div>
          <div className="receipt-formal-tax-row">
            <span className="receipt-formal-tax-label">消費税</span>
            <span className="receipt-formal-tax-value">{formatReceiptAmount(tax10)}</span>
          </div>
          <hr className="receipt-formal-tax-rule" />
          <div className="receipt-formal-tax-row">
            <span className="receipt-formal-tax-label">8%対象</span>
            <span className="receipt-formal-tax-value">0</span>
          </div>
          <div className="receipt-formal-tax-row">
            <span className="receipt-formal-tax-label">消費税</span>
            <span className="receipt-formal-tax-value">0</span>
          </div>
          <hr className="receipt-formal-tax-rule" />
        </div>

        <div className="receipt-formal-issuer">
          <p>{issuer.companyName}</p>
          {issuer.repName.trim() ? <p>{issuer.repName}</p> : null}
          {issuer.registrationNumber.trim() ? <p>登録番号: {issuer.registrationNumber}</p> : null}
          <p className="receipt-formal-issuer-address">
            {issuer.postalCode.replace(/-/g, "")}
            <br />
            {issuer.addressLines}
          </p>
        </div>
      </footer>
    </div>
  )
}
