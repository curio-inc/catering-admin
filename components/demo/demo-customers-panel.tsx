"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import type { DemoOrderView } from "@/lib/build-demo-view-model"
import { buildDemoCustomersForClient, filterDemoCustomers } from "@/lib/build-demo-customers"

type DemoCustomersPanelProps = {
  orders: DemoOrderView[]
}

export function DemoCustomersPanel({ orders }: DemoCustomersPanelProps) {
  const customers = useMemo(() => buildDemoCustomersForClient(orders), [orders])
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => filterDemoCustomers(customers, query), [customers, query])

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
                <tr key={customer.id}>
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
                    <Link href={`/admin/customers/${customer.id}`} className="demo-open-link">
                      詳細
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
