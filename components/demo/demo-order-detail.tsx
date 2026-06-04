"use client"

import { useState } from "react"
import type { DemoOrderView, DemoUiStatus } from "@/lib/build-demo-view-model"
import { DemoOrderStatusSelect } from "@/components/demo/demo-order-status-select"
import { getDemoUiStatus, writeDemoOrderStatus } from "@/lib/demo-order-status"

function yen(n: number) {
  return `¥${n.toLocaleString("ja-JP")}`
}

type DemoOrderDetailProps = {
  view: DemoOrderView
  onStatusChange?: (ui: DemoUiStatus) => void
}

export function DemoOrderDetail({ view, onStatusChange }: DemoOrderDetailProps) {
  const [uiStatus, setUiStatus] = useState<DemoUiStatus>(() => getDemoUiStatus(view.id, view.order.status))

  function setStatus(next: DemoUiStatus) {
    setUiStatus(next)
    writeDemoOrderStatus(view.id, next)
    onStatusChange?.(next)
  }

  return (
    <div className="order-section order-section--detail" style={{ marginTop: 0 }}>
      <div className="line-items-block">
        <h4>受け取り方法</h4>
        <div className="detail-grid">
          <div className="detail-field" style={{ gridColumn: "1 / -1" }}>
            <label>受け取り方法</label>
            <input type="text" readOnly value={view.form.receiving || "—"} />
          </div>
        </div>
      </div>

      <div className="line-items-block">
        <h4>支払い方法</h4>
        <div className="detail-grid">
          <div className="detail-field" style={{ gridColumn: "1 / -1" }}>
            <label>支払い方法</label>
            <input type="text" readOnly value={view.form.pay || "—"} />
          </div>
          {view.isInvoicePay ? (
            <>
              <div className="detail-field" style={{ gridColumn: "1 / -1" }}>
                <label>会社名（宛名）</label>
                <input type="text" readOnly value={view.form.companyName} />
              </div>
              <div className="detail-field" style={{ gridColumn: "1 / -1" }}>
                <label>請求先住所</label>
                <input type="text" readOnly value={view.form.billingAddress || "—"} />
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="line-items-block">
        <h4>お客様情報</h4>
        <div className="detail-grid">
          <div className="detail-field">
            <label>お名前</label>
            <input type="text" readOnly value={view.form.name} />
          </div>
          <div className="detail-field">
            <label>電話番号</label>
            <input type="text" readOnly value={view.form.phone} />
          </div>
          <div className="detail-field" style={{ gridColumn: "1 / -1" }}>
            <label>メールアドレス</label>
            <input type="text" readOnly value={view.form.email} />
          </div>
          {view.form.receiving === "デリバリー" ? (
            <div className="detail-field" style={{ gridColumn: "1 / -1" }}>
              <label>お届け先住所</label>
              <input type="text" readOnly value={view.form.address} />
            </div>
          ) : null}
          <div className="detail-field">
            <label>お届け日／受取日</label>
            <input type="text" readOnly value={view.form.date || "—"} />
          </div>
          <div className="detail-field">
            <label>お届け時間／受け取り時間</label>
            <input type="text" readOnly value={view.form.time || "—"} />
          </div>
          <div className="detail-field" style={{ gridColumn: "1 / -1" }}>
            <label>備考・特別なご要望</label>
            <textarea readOnly value={view.form.note || ""} />
          </div>
          <div className="detail-field" style={{ gridColumn: "1 / -1" }}>
            <label>案件名・案件番号</label>
            <input type="text" readOnly value={view.form.caseNameAndNumber} />
          </div>
        </div>
      </div>

      <div className="line-items-block">
        <h4>注文内容</h4>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>商品</th>
                <th>数量</th>
                <th>単価</th>
                <th>備考</th>
                <th>小計</th>
              </tr>
            </thead>
            <tbody>
              {view.items.map((line) => {
                const sub = line.unit_price_yen_snapshot * line.quantity
                const note = line.custom_text?.trim() || "—"
                return (
                  <tr key={line.id}>
                    <td>{line.menu_name_snapshot}</td>
                    <td>{line.quantity}</td>
                    <td>{yen(line.unit_price_yen_snapshot)}</td>
                    <td>{note}</td>
                    <td>{yen(sub)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <DemoOrderStatusSelect
        id={`order-status-${view.id}`}
        value={uiStatus}
        onChange={setStatus}
      />
    </div>
  )
}
