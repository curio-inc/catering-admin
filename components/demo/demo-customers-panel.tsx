"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { DemoOrderStatusSelect } from "@/components/demo/demo-order-status-select"
import type { DemoOrderView } from "@/lib/build-demo-view-model"
import { buildDemoCustomersForClient, filterDemoCustomers } from "@/lib/build-demo-customers"

function yen(n: number) {
  return `¥${n.toLocaleString("ja-JP")}`
}

type DemoCustomersPanelProps = {
  orders: DemoOrderView[]
  onOrderStatusChange?: (orderId: string, ui: DemoOrderView["uiStatus"]) => void
}

export function DemoCustomersPanel({ orders, onOrderStatusChange }: DemoCustomersPanelProps) {
  const customers = useMemo(() => buildDemoCustomersForClient(orders), [orders])
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(customers[0]?.id ?? null)

  const filtered = useMemo(() => filterDemoCustomers(customers, query), [customers, query])
  const selected = filtered.find((c) => c.id === selectedId) ?? filtered[0] ?? null

  return (
    <div className="admin-workspace demo-customers-workspace">
      <div className="demo-customers-toolbar">
        <label className="demo-customers-search" htmlFor="customer-search">
          <span className="sr-only">顧客を検索</span>
          <input
            id="customer-search"
            type="search"
            placeholder="会社名・氏名・メールで検索"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <p className="demo-customers-count">{filtered.length} 名の登録ユーザー</p>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>会社名</th>
              <th>氏名</th>
              <th>メールアドレス</th>
              <th>登録日</th>
              <th>注文数</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ color: "var(--muted)" }}>
                  該当する登録ユーザーはいません。
                </td>
              </tr>
            ) : (
              filtered.map((customer) => (
                <tr key={customer.id} className={selected?.id === customer.id ? "demo-customers-row--active" : undefined}>
                  <td>{customer.companyName || "—"}</td>
                  <td>{customer.name}</td>
                  <td>
                    <a href={`mailto:${customer.email}`} className="demo-customers-email">
                      {customer.email}
                    </a>
                  </td>
                  <td>{customer.registeredLabel}</td>
                  <td>{customer.orders.length}件</td>
                  <td className="demo-open-cell">
                    <button
                      type="button"
                      className={`btn btn-compact${selected?.id === customer.id ? " btn-primary" : ""}`}
                      onClick={() => setSelectedId(customer.id)}
                    >
                      注文履歴
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected ? (
        <div className="demo-customers-detail">
          <div className="demo-customers-detail-head">
            <h2 className="order-section-title">
              {selected.name} さんの注文履歴
              {selected.companyName ? <span className="demo-customers-detail-company">（{selected.companyName}）</span> : null}
            </h2>
            <p className="demo-customers-detail-email">{selected.email}</p>
          </div>

          {selected.orders.length === 0 ? (
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
                  {selected.orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.orderNumber}</td>
                      <td>{order.deliveryLabel}</td>
                      <td>{yen(order.totalYen)}</td>
                      <td>
                        <DemoOrderStatusSelect
                          showLabel={false}
                          value={order.uiStatus}
                          onChange={(ui) => onOrderStatusChange?.(order.id, ui)}
                        />
                      </td>
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
      ) : null}
    </div>
  )
}
