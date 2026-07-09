"use client"

import Link from "next/link"
import { DEMO_STATUS_OPTIONS } from "@/components/demo/demo-order-status-select"
import { DemoPageShell } from "@/components/demo/demo-page-shell"
import type { DemoCustomerView } from "@/lib/build-demo-customers"
import type { DemoUiStatus } from "@/lib/build-demo-view-model"

function yen(n: number) {
  return `¥${n.toLocaleString("ja-JP")}`
}

function statusLabel(ui: DemoUiStatus): string {
  return DEMO_STATUS_OPTIONS.find((o) => o.value === ui)?.label ?? ui
}

type DemoCustomerDetailPageProps = {
  customer: DemoCustomerView
  brandName: string
  backUrl?: string
}

export function DemoCustomerDetailPage({ customer, brandName, backUrl }: DemoCustomerDetailPageProps) {
  return (
    <DemoPageShell brandName={brandName} backUrl={backUrl}>
      <main className="demo-main demo-main--standalone">
        <p className="demo-standalone-nav">
          <Link href="/admin/orders?panel=customers" className="demo-back">
            ← 顧客管理
          </Link>
        </p>
        <div className="demo-order-detail-head">
          <div>
            <h1 className="demo-panel-title">顧客詳細</h1>
            <p className="demo-order-meta">
              <span>{customer.name}</span>
              {customer.companyName ? (
                <>
                  <span className="demo-order-meta-sep">·</span>
                  <span>{customer.companyName}</span>
                </>
              ) : null}
            </p>
          </div>
        </div>

        <div className="admin-workspace">
          <div className="order-section order-section--detail" style={{ marginTop: 0 }}>
            <div className="line-items-block">
              <h4>お客様情報</h4>
              <dl className="demo-customer-info">
                <div className="demo-customer-info-row">
                  <dt>お名前</dt>
                  <dd>{customer.name}</dd>
                </div>
                <div className="demo-customer-info-row">
                  <dt>電話番号</dt>
                  <dd>{customer.phone || "—"}</dd>
                </div>
                <div className="demo-customer-info-row">
                  <dt>メールアドレス</dt>
                  <dd>{customer.email}</dd>
                </div>
                <div className="demo-customer-info-row">
                  <dt>会社名</dt>
                  <dd>{customer.companyName || "—"}</dd>
                </div>
                <div className="demo-customer-info-row">
                  <dt>住所</dt>
                  <dd>{customer.address || "—"}</dd>
                </div>
                <div className="demo-customer-info-row">
                  <dt>登録日</dt>
                  <dd>{customer.registeredLabel}</dd>
                </div>
                <div className="demo-customer-info-row">
                  <dt>注文数</dt>
                  <dd>{customer.orders.length}件</dd>
                </div>
              </dl>
            </div>

            <div className="line-items-block">
              <h4>注文履歴</h4>
              {customer.orders.length === 0 ? (
                <p className="demo-customers-detail-empty">注文履歴はまだありません。</p>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>注文番号</th>
                        <th>お届け日時</th>
                        <th>金額</th>
                        <th>状態</th>
                        <th>受付日</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {customer.orders.map((order) => (
                        <tr key={order.id}>
                          <td>{order.orderNumber}</td>
                          <td>{order.deliveryLabel}</td>
                          <td>{yen(order.totalYen)}</td>
                          <td>{statusLabel(order.uiStatus)}</td>
                          <td>{order.receivedLabel}</td>
                          <td className="demo-open-cell">
                            <Link href={`/admin/orders/${order.id}`} className="demo-open-link">
                              開く
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </DemoPageShell>
  )
}
